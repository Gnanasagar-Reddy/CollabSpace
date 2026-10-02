const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ApiError = require("../src/utils/ApiError");

function setup() {
    const hashed = [];
    const mocks = {
        bcrypt: { hash: async (password) => { hashed.push(password); return "hash"; } },
        "./user.model": { findOne: async () => null, create: async (user) => user },
        "../../utils/ApiError": ApiError,
        jsonwebtoken: {}, "./refreshToken.model": {}, "../../utils/jwt": {}
    };
    const context = { module: { exports: {} }, Buffer, require: (name) => mocks[name] };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/modules/auth/auth.service.js"), "utf8"), context);
    return { register: (password) => context.module.exports.registerUser({ name: "Test", email: "test@example.com", password }), hashed };
}

test("registration accepts passwords up to 72 UTF-8 bytes", async () => {
    const { register, hashed } = setup();
    for (const password of ["abcdef", "a".repeat(72), "é".repeat(36), "🙂".repeat(18)]) {
        await register(password);
        assert.equal(hashed.at(-1), password);
    }
});

test("overlong ASCII and multibyte passwords are rejected before hashing", async () => {
    const { register, hashed } = setup();
    for (const password of ["a".repeat(73), "é".repeat(37), "🙂".repeat(19), "a".repeat(71) + "é"]) {
        await assert.rejects(register(password), (error) => error.statusCode === 400 && /72 UTF-8 bytes/.test(error.message));
    }
    assert.equal(hashed.length, 0);
});

test("minimum length and password type validation remain enforced", async () => {
    const { register, hashed } = setup();
    for (const password of ["short", "", undefined, null, 123, {}]) {
        await assert.rejects(register(password), (error) => error.statusCode === 400);
    }
    assert.equal(hashed.length, 0);
});
