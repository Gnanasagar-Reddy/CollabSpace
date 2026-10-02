import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import axios from "axios";
import { createServer } from "vite";

const apiSource = fs.readFileSync(new URL("../src/services/api.js", import.meta.url), "utf8")
    .replace('import axios from "axios";', "")
    .replaceAll("import.meta.env.VITE_API_URL", '"http://test/api"')
    .replace("export default api;", "return api;");

function client({ refreshError, accessToken = "renewed", alwaysUnauthorized = false } = {}) {
    const stored = new Map([["accessToken", "expired"]]);
    const redirects = [], requests = [];
    let refreshes = 0;
    const facade = {
        create: (options) => axios.create({ ...options, adapter: async (config) => {
            requests.push(config);
            if (alwaysUnauthorized || config.headers.Authorization !== "Bearer renewed") {
                throw new axios.AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, { status: 401, data: {} });
            }
            return { status: 200, data: { user: { _id: "user" } }, headers: {}, config };
        } }),
        post: async (url, data, options) => {
            refreshes++;
            assert.equal(url, "http://test/api/auth/refresh-token");
            assert.equal(options.withCredentials, true);
            if (refreshError) throw refreshError;
            return { data: { data: { accessToken } } };
        }
    };
    const storage = { getItem: (key) => stored.get(key), setItem: (key, value) => stored.set(key, value), removeItem: (key) => stored.delete(key) };
    const window = { location: { pathname: "/dashboard", assign: (path) => redirects.push(path) } };
    const api = new Function("axios", "localStorage", "window", "console", apiSource)(facade, storage, window, { log() {} });
    return { api, stored, redirects, requests, refreshes: () => refreshes };
}

test("expired /auth/me refreshes and retries with the new access token", async () => {
    const fixture = client();
    const response = await fixture.api.get("/auth/me");
    assert.equal(response.data.user._id, "user");
    assert.equal(fixture.refreshes(), 1);
    assert.equal(fixture.stored.get("accessToken"), "renewed");
    assert.equal(fixture.requests.length, 2);
    assert.deepEqual(fixture.redirects, []);
});

test("concurrent unauthorized requests share one refresh", async () => {
    const fixture = client();
    await Promise.all([fixture.api.get("/auth/me"), fixture.api.get("/documents")]);
    assert.equal(fixture.refreshes(), 1);
    assert.equal(fixture.requests.length, 4);
});

test("login/register/logout/refresh failures do not recursively refresh", async () => {
    for (const endpoint of ["login", "register", "logout", "refresh-token"]) {
        const fixture = client();
        await assert.rejects(fixture.api.post(`/auth/${endpoint}`));
        assert.equal(fixture.refreshes(), 0);
    }
});

test("invalid refresh sessions clear the token and redirect", async () => {
    for (const status of [401, 403]) {
        const fixture = client({ refreshError: { response: { status } } });
        await assert.rejects(fixture.api.get("/auth/me"));
        assert.equal(fixture.stored.has("accessToken"), false);
        assert.deepEqual(fixture.redirects, ["/login"]);
    }
});

test("network/server failures and malformed refresh responses preserve the token", async () => {
    for (const options of [{ refreshError: new Error("offline") }, { refreshError: { response: { status: 503 } } }, { accessToken: "" }]) {
        const fixture = client(options);
        await assert.rejects(fixture.api.get("/auth/me"));
        assert.equal(fixture.stored.get("accessToken"), "expired");
        assert.deepEqual(fixture.redirects, []);
    }
});

test("a failed retried request does not enter a refresh loop", async () => {
    const fixture = client({ alwaysUnauthorized: true });
    await assert.rejects(fixture.api.get("/auth/me"));
    assert.equal(fixture.refreshes(), 1);
    assert.equal(fixture.requests.length, 2);
});

test("AuthProvider shows retry for outages, recovers, and ignores unmounted requests", async () => {
    const cells = [], requests = [];
    let cursor = 0, effect;
    const hooks = {
        useState: (initial) => {
            const index = cursor++;
            if (!(index in cells)) cells[index] = initial;
            return [cells[index], (value) => { cells[index] = typeof value === "function" ? value(cells[index]) : value; }];
        },
        useEffect: (callback) => { effect = callback; }
    };
    const stored = new Map([["accessToken", "expired"]]);
    const originalStorage = globalThis.localStorage;
    globalThis.localStorage = { getItem: (key) => stored.get(key), setItem: (key, value) => stored.set(key, value), removeItem: (key) => stored.delete(key) };
    globalThis.authAudit = { ...hooks, api: { get: () => new Promise((resolve, reject) => requests.push({ resolve, reject })) } };
    const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom", plugins: [{ name: "isolated-auth", enforce: "pre", transform(code, id) {
        if (!id.endsWith("/src/context/AuthProvider.jsx")) return;
        return code.replace('import { useEffect, useState } from "react";', "const {useEffect,useState}=globalThis.authAudit;")
            .replace('import api from "../services/api";', "const {api}=globalThis.authAudit;");
    } }] });
    const flush = () => new Promise((resolve) => setImmediate(resolve));
    try {
        const { AuthProvider } = await server.ssrLoadModule("/src/context/AuthProvider.jsx");
        const render = () => { cursor = 0; return AuthProvider({ children: "application" }); };
        render(); let cleanup = effect();
        requests[0].reject(new Error("offline")); await flush();
        const errorScreen = render();
        assert.equal(errorScreen.props.children[0].props.role, "alert");
        assert.equal(stored.get("accessToken"), "expired");
        errorScreen.props.children[1].props.onClick(); cleanup(); render(); cleanup = effect();
        requests[1].resolve({ data: { user: { _id: "user" } } }); await flush();
        assert.equal(render().props.value.user._id, "user");
        assert.equal(render().props.value.loading, false);
        cleanup(); render(); cleanup = effect(); cleanup();
        requests[2].resolve({ data: { user: { _id: "stale" } } }); await flush();
        assert.equal(render().props.value.user._id, "user");
        render(); cleanup = effect(); requests[3].reject({ response: { status: 401 } }); await flush();
        assert.equal(render().props.value.user, null);
        assert.equal(stored.has("accessToken"), false);
        cleanup();
    } finally {
        await server.close();
        globalThis.localStorage = originalStorage;
        delete globalThis.authAudit;
    }
});
