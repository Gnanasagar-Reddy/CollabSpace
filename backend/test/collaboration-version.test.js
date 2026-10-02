const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");

const documentId = "0123456789abcdef01234567";
const sourcePath = path.resolve(__dirname, "../src/collaboration/collaboration.server.js");
const realRequire = createRequire(sourcePath);

// Exercise the real hooks and Yjs/HTML conversions without starting a server or DB.
function setup(version = 0) {
    const state = { document: { _id: documentId, owner: "owner", collaborators: [], content: "<p>Original</p>" }, beforeWrite: null, reads: 0 };
    if (version !== undefined) state.document.collaborationVersion = version;
    const query = (value) => {
        const promise = Promise.resolve(value);
        promise.select = () => promise;
        return promise;
    };
    const Document = {
        findById: () => {
            state.reads++;
            const promise = state.readError ? Promise.reject(state.readError)
                : query(state.document ? { ...state.document } : null);
            promise.select = () => promise;
            return promise;
        },
        updateOne: async (filter, update) => {
            state.beforeWrite?.();
            assert.equal(filter._id, documentId);
            const current = state.document.collaborationVersion;
            const matches = filter.$or
                ? current === 0 || current === undefined
                : current === filter.collaborationVersion;
            if (matches) Object.assign(state.document, update.$set);
            return { matchedCount: Number(matches) };
        }
    };
    const mocks = {
        dotenv: { config() {} },
        jsonwebtoken: { verify: () => ({ userId: state.authUser || "owner" }) },
        "@hocuspocus/server": { Server: class { constructor(hooks) { this.hooks = hooks; } } },
        "../modules/auth/user.model": { findById: (id) => query({ _id: id, email: "user@example.com" }) },
        "../modules/document/document.model": Document
    };
    const context = {
        module: { exports: {} }, Buffer, process,
        console: { log() {}, error() {} },
        setInterval: (callback, delay) => {
            assert.equal(delay, 1000);
            state.tick = callback;
            return { unref() {} };
        },
        clearInterval: () => { state.tick = null; },
        require: (name) => mocks[name] || realRequire(name)
    };
    // Tiptap checks Object identity when merging options. A separate VM realm
    // makes valid options look non-plain and falsely produces duplicate extensions.
    const load = vm.runInThisContext(
        `(function(require, module, Buffer, process, console, setInterval, clearInterval) {\n${fs.readFileSync(sourcePath, "utf8")}\n})`,
        { filename: sourcePath }
    );
    load(context.require, context.module, Buffer, process, context.console, context.setInterval, context.clearInterval);
    return { hooks: context.module.exports.hooks, state };
}

test("current room loads, authenticates and persists real Yjs content without duplicate extensions", async (t) => {
    const warnings = t.mock.method(console, "warn", () => {});
    const { hooks, state } = setup(3);
    const documentName = `document_${documentId}_v3`;
    const context = await hooks.onAuthenticate({ token: "test", documentName, connectionConfig: {} });
    assert.equal(context.documentId, documentId);
    const document = await hooks.onLoadDocument({ documentName });
    await hooks.onStoreDocument({ documentName, document });
    assert.match(state.document.content, /Original/);
    assert.ok(state.document.yjsState);
    const reloaded = await hooks.onLoadDocument({ documentName });
    reloaded.destroy();
    document.destroy();
    assert.equal(warnings.mock.calls.filter((call) => call.arguments.join(" ").includes("Duplicate extension names")).length, 0);
});

test("stale and future room names are rejected on authentication and load", async () => {
    const { hooks } = setup(2);
    for (const suffix of ["", "_v0", "_v1", "_v3"]) {
        const documentName = `document_${documentId}${suffix}`;
        await assert.rejects(hooks.onAuthenticate({ token: "test", documentName }), /Document was restored/);
        await assert.rejects(hooks.onLoadDocument({ documentName }), /Document was restored/);
    }
});

test("old-room persistence cannot overwrite a restored document", async () => {
    const { hooks, state } = setup(0);
    const documentName = `document_${documentId}_v0`;
    const document = await hooks.onLoadDocument({ documentName });
    Object.assign(state.document, { collaborationVersion: 1, content: "<p>Restored</p>", yjsState: "" });
    await hooks.onStoreDocument({ documentName, document });
    assert.equal(state.document.content, "<p>Restored</p>");
    assert.equal(state.document.yjsState, "");
    document.destroy();
});

test("restore racing the write is protected by the atomic version predicate", async () => {
    const { hooks, state } = setup(4);
    const documentName = `document_${documentId}_v4`;
    const document = await hooks.onLoadDocument({ documentName });
    state.beforeWrite = () => Object.assign(state.document, {
        collaborationVersion: 5, content: "<p>Race restore</p>", yjsState: ""
    });
    await hooks.onStoreDocument({ documentName, document });
    assert.equal(state.document.content, "<p>Race restore</p>");
    assert.equal(state.document.yjsState, "");
    document.destroy();
});

test("legacy documents with no version still work in unversioned and v0 rooms", async () => {
    for (const suffix of ["", "_v0"]) {
        const { hooks, state } = setup();
        delete state.document.collaborationVersion;
        const documentName = `document_${documentId}${suffix}`;
        const document = await hooks.onLoadDocument({ documentName });
        await hooks.onAuthenticate({ token: "test", documentName, connectionConfig: {} });
        await hooks.onStoreDocument({ documentName, document });
        assert.ok(state.document.yjsState);
        document.destroy();
    }
});

test("malformed and unsafe room versions are rejected", async () => {
    const { hooks } = setup(0);
    for (const documentName of ["invalid", `document_${documentId}_v-1`, `document_${documentId}_v9007199254740992`]) {
        await assert.rejects(hooks.onLoadDocument({ documentName }), /Invalid/);
    }
});

function connectionFor(userId) {
    let onClose;
    return {
        context: { userId }, readOnly: false, closed: false,
        onClose: (callback) => { onClose = callback; },
        close() { this.closed = true; onClose?.(); }
    };
}

test("viewer authentication sets the supported connectionConfig property", async () => {
    const { hooks, state } = setup();
    state.authUser = "member";
    state.document.collaborators = [{ user: "member", role: "viewer" }];
    const connectionConfig = {};
    await hooks.onAuthenticate({ token: "test", documentName: `document_${documentId}_v0`, connectionConfig });
    assert.equal(connectionConfig.readOnly, true);
});

test("existing connections become read-only on demotion and editable on promotion", async () => {
    const { hooks, state } = setup();
    const documentName = `document_${documentId}_v0`;
    state.document.collaborators = [{ user: "member", role: "editor" }];
    const connection = connectionFor("member");
    await hooks.connected({ documentName, connection });
    assert.equal(connection.readOnly, false);
    state.document.collaborators[0].role = "viewer";
    await hooks.beforeHandleMessage({ documentName, connection });
    assert.equal(connection.readOnly, true);
    assert.equal(connection.context.role, "viewer");
    state.document.collaborators[0].role = "editor";
    await hooks.beforeHandleMessage({ documentName, connection });
    assert.equal(connection.readOnly, false);
    connection.close();
    assert.equal(state.tick, null);
});

test("removed users cannot send further messages on an authenticated connection", async () => {
    const { hooks, state } = setup();
    const documentName = `document_${documentId}_v0`;
    state.document.collaborators = [{ user: "member", role: "editor" }];
    const connection = connectionFor("member");
    await hooks.connected({ documentName, connection });
    state.document.collaborators = [];
    await assert.rejects(hooks.beforeHandleMessage({ documentName, connection }), /revoked/);
    assert.equal(connection.closed, true);
    assert.equal(connection.readOnly, true);
    assert.equal(state.tick, null);
});

test("idle removal is enforced; periodic checks share one DB read per room", async () => {
    const { hooks, state } = setup();
    const documentName = `document_${documentId}_v0`;
    state.document.collaborators = [{ user: "member", role: "editor" }];
    const member = connectionFor("member"), owner = connectionFor("owner");
    await hooks.connected({ documentName, connection: member });
    await hooks.connected({ documentName, connection: owner });
    state.document.collaborators = [];
    const reads = state.reads;
    await state.tick();
    assert.equal(state.reads - reads, 1);
    assert.equal(member.closed, true);
    assert.equal(owner.closed, false);
    owner.close();
    assert.equal(state.tick, null);
});

test("permission lookup failures close connections rather than trust stale access", async () => {
    const { hooks, state } = setup();
    const documentName = `document_${documentId}_v0`;
    const connection = connectionFor("owner");
    await hooks.connected({ documentName, connection });
    state.readError = new Error("DB unavailable");
    await assert.rejects(hooks.beforeHandleMessage({ documentName, connection }), /DB unavailable/);
    assert.equal(connection.closed, true);
    assert.equal(state.tick, null);
});

test("revocation during connection setup is caught and shutdown clears the timer", async () => {
    const { hooks, state } = setup();
    const documentName = `document_${documentId}_v0`;
    const removed = connectionFor("member");
    await assert.rejects(hooks.connected({ documentName, connection: removed }), /revoked/);
    assert.equal(removed.closed, true);
    await hooks.connected({ documentName, connection: connectionFor("owner") });
    assert.equal(typeof state.tick, "function");
    await hooks.onDestroy();
    assert.equal(state.tick, null);
});

test("real Hocuspocus message handling rejects a demoted user's Yjs update", async () => {
    const Y = realRequire("yjs");
    const { IncomingMessage, OutgoingMessage, MessageReceiver } = realRequire("@hocuspocus/server");
    const { hooks, state } = setup();
    const documentName = `document_${documentId}_v0`;
    state.document.collaborators = [{ user: "member", role: "editor" }];
    const connection = connectionFor("member");
    connection.send = () => {};
    connection.callbacks = { beforeSync: () => Promise.resolve() };
    const source = new Y.Doc(), target = new Y.Doc();
    target.name = documentName;
    source.getText("test").insert(0, "Unauthorised change");
    const data = new OutgoingMessage(documentName).createSyncMessage()
        .writeUpdate(Y.encodeStateAsUpdate(source)).toUint8Array();
    const apply = () => {
        const message = new IncomingMessage(data);
        message.readVarString();
        message.writeVarString(documentName);
        new MessageReceiver(message).apply(target, connection);
    };
    state.document.collaborators[0].role = "viewer";
    await hooks.beforeHandleMessage({ documentName, connection });
    apply();
    assert.equal(target.getText("test").toString(), "");
    state.document.collaborators[0].role = "editor";
    await hooks.beforeHandleMessage({ documentName, connection });
    apply();
    assert.equal(target.getText("test").toString(), "Unauthorised change");
    source.destroy();
    target.destroy();
});
