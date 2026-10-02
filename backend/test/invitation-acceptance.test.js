const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ApiError = require("../src/utils/ApiError");

// Fault-injected transaction fixture: staged writes only become visible on commit.
function setup() {
    const state = {
        request: { _id: "invitation", document: "document", sender: "owner", recipient: "member", role: "editor", status: "pending" },
        document: { _id: "document", owner: "owner", collaborators: [] },
        events: [], active: null, failure: ""
    };
    const matchesRequest = (record, filter) => record && Object.entries(filter).every(([key, value]) => record[key] === value);
    const sessionQuery = (read) => ({ session: (session) => {
        assert.equal(session, state.active);
        return Promise.resolve(read(session));
    } });
    const Document = {
        db: { transaction: async (callback) => {
            const session = { request: structuredClone(state.request), document: structuredClone(state.document) };
            state.active = session;
            try {
                const result = await callback(session);
                if (state.failure === "commit") throw new Error("Commit failed");
                state.request = session.request;
                state.document = session.document;
                state.events.push("commit");
                return result;
            } catch (error) {
                state.events.push("rollback");
                throw error;
            } finally { state.active = null; }
        } },
        findById: (id) => sessionQuery((session) => {
            assert.equal(id, "document");
            if (state.failure === "read") throw new Error("Document read failed");
            return session.document;
        }),
        findOneAndUpdate: async (filter, update, options) => {
            assert.equal(options.session, state.active);
            assert.equal(options.runValidators, true);
            state.events.push("grant");
            if (state.failure === "grant") throw new Error("Access grant failed");
            if (state.failure === "grant-match") return null;
            const document = options.session.document;
            assert.equal(filter.owner, "owner");
            assert.equal(filter["collaborators.user"].$ne, "member");
            document.collaborators.push(structuredClone(update.$push.collaborators));
            return document;
        }
    };
    const CollaborationRequest = {
        findOne: (filter) => sessionQuery((session) => matchesRequest(session.request, filter) ? session.request : null),
        findOneAndUpdate: async (filter, update, options) => {
            const session = options.session;
            const request = session ? session.request : state.request;
            if (session) assert.equal(session, state.active);
            state.events.push(update.$set.status);
            if (state.failure === "finalize") throw new Error("Invitation update failed");
            if (state.failure === "finalize-match" || !matchesRequest(request, filter)) return null;
            request.status = update.$set.status;
            return request;
        }
    };
    const mocks = {
        "../document.model": Document, "../../auth/user.model": {},
        "../collaborationRequest.model": CollaborationRequest, "../../../utils/ApiError": ApiError
    };
    const context = { module: { exports: {} }, require: (name) => mocks[name] };
    const file = path.join(__dirname, "../src/modules/document/services/document.collaborationRequest.service.js");
    vm.runInNewContext(fs.readFileSync(file, "utf8"), context);
    return { state, accept: (user = "member") => context.module.exports.acceptCollaborationRequest("invitation", user),
        reject: (user = "member") => context.module.exports.rejectCollaborationRequest("invitation", user) };
}

test("accept commits access and invitation status together, in grant-first order", async () => {
    const { state, accept } = setup();
    const result = await accept();
    assert.equal(result.collaborators[0].user, "member");
    assert.equal(state.request.status, "accepted");
    assert.deepEqual(state.events, ["grant", "accepted", "commit"]);
});

test("read, grant, finalization and commit failures preserve a retriable pending invitation", async () => {
    for (const failure of ["read", "grant", "finalize", "commit", "grant-match", "finalize-match"]) {
        const { state, accept } = setup();
        state.failure = failure;
        await assert.rejects(accept());
        assert.equal(state.request.status, "pending");
        assert.equal(state.document.collaborators.length, 0);
        assert.equal(state.events.at(-1), "rollback");
        state.failure = "";
        await accept();
        assert.equal(state.request.status, "accepted");
        assert.equal(state.document.collaborators.length, 1);
    }
});

test("only the intended recipient can accept or reject", async () => {
    const { state, accept, reject } = setup();
    await assert.rejects(accept("stranger"), (error) => error.statusCode === 404);
    await assert.rejects(reject("stranger"), (error) => error.statusCode === 404);
    assert.equal(state.request.status, "pending");
    assert.equal(state.document.collaborators.length, 0);
});

test("an existing collaborator is not duplicated or given an outdated invitation role", async () => {
    const { state, accept } = setup();
    state.document.collaborators = [{ user: "member", role: "viewer" }];
    await accept();
    assert.equal(state.request.status, "accepted");
    assert.equal(state.document.collaborators.length, 1);
    assert.equal(state.document.collaborators[0].role, "viewer");
    assert.deepEqual(state.events, ["accepted", "commit"]);
});

test("deleted documents reject the invitation without falsely accepting it", async () => {
    const { state, accept } = setup();
    state.document = null;
    await assert.rejects(accept(), (error) => error.statusCode === 404);
    assert.equal(state.request.status, "rejected");
    assert.deepEqual(state.events, ["rejected", "commit"]);
});

test("a former owner's invitation cannot grant access", async () => {
    const { state, accept } = setup();
    state.document.owner = "new-owner";
    await assert.rejects(accept(), (error) => error.statusCode === 409);
    assert.equal(state.request.status, "pending");
    assert.equal(state.document.collaborators.length, 0);
});

test("repeated accept cannot duplicate access and reject cannot overwrite accepted status", async () => {
    const { state, accept, reject } = setup();
    await accept();
    await assert.rejects(accept(), (error) => error.statusCode === 404);
    await assert.rejects(reject(), (error) => error.statusCode === 404);
    assert.equal(state.request.status, "accepted");
    assert.equal(state.document.collaborators.length, 1);
});

test("rejected invitations cannot be accepted or rejected again", async () => {
    const { state, accept, reject } = setup();
    await reject();
    await assert.rejects(accept(), (error) => error.statusCode === 404);
    await assert.rejects(reject(), (error) => error.statusCode === 404);
    assert.equal(state.request.status, "rejected");
    assert.equal(state.document.collaborators.length, 0);
});
