import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { getSchema } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorState } from "@tiptap/pm/state";
import { createServer } from "vite";

test("real character-count plugin accepts over-threshold remote transactions without trimming", () => {
    const source = fs.readFileSync(new URL("../src/components/editor/CollaborationEditor.jsx", import.meta.url), "utf8");
    const match = source.match(/CharacterCount\.configure\(\{[\s\S]*?limit:\s*(\d+)/);
    assert.ok(match);
    const count = CharacterCount.configure({ limit: Number(match[1]) });
    const schema = getSchema([StarterKit.configure({ link: false, underline: false }), count]);
    const context = { options: count.options, storage: {}, editor: {} };
    count.config.onBeforeCreate.call(context);
    const plugins = count.config.addProseMirrorPlugins.call(context);
    let state = EditorState.create({ schema, plugins, doc: schema.node("doc", null, [schema.node("paragraph", null, [schema.text("a".repeat(199999))])]) });
    context.editor.state = state;
    state = state.apply(state.tr.insertText("remote", 1).setMeta("y-sync$", { isChangeOrigin: true }));
    context.editor.state = state;
    assert.equal(state.doc.textContent.length, 200005);
    assert.equal(context.storage.characters(), 200005);
    state = state.apply(state.tr.insertText("local", 1));
    assert.equal(state.doc.textContent.length, 200010);
    state = state.apply(state.tr.delete(1, 6));
    assert.equal(state.doc.textContent.length, 200005);
});

test("registration UI rejects overlong Unicode passwords before sending a request", async () => {
    const cells = [], posted = [];
    let cursor = 0;
    globalThis.smallFixAudit = {
        useState: (initial) => {
            const index = cursor++;
            if (!(index in cells)) cells[index] = initial;
            return [cells[index], (value) => { cells[index] = typeof value === "function" ? value(cells[index]) : value; }];
        },
        useNavigate: () => () => {},
        api: { post: async (...args) => { posted.push(args); throw new Error("mock network failure"); } }
    };
    const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom", plugins: [{ name: "isolated-register", enforce: "pre", transform(code, id) {
        if (!id.endsWith("/src/pages/Register.jsx")) return;
        return code.replace('import { useState } from "react";', "const {useState}=globalThis.smallFixAudit;")
            .replace('import { useNavigate } from "react-router-dom";', "const {useNavigate}=globalThis.smallFixAudit;")
            .replace('import api from "../services/api";', "const {api}=globalThis.smallFixAudit;");
    } }] });
    const find = (tree, predicate) => {
        if (!tree || typeof tree !== "object") return;
        if (predicate(tree)) return tree;
        for (const child of [tree.props?.children].flat(Infinity)) {
            const result = find(child, predicate);
            if (result) return result;
        }
    };
    try {
        const { default: Register } = await server.ssrLoadModule("/src/pages/Register.jsx");
        const render = () => { cursor = 0; return Register(); };
        find(render(), (element) => element.type === "input" && element.props.name === "password")
            .props.onChange({ target: { name: "password", value: "é".repeat(37) } });
        await find(render(), (element) => element.type === "form").props.onSubmit({ preventDefault() {} });
        assert.equal(posted.length, 0);
        assert.match(cells[1], /72 UTF-8 bytes/);
        assert.equal(cells[2], false);
        find(render(), (element) => element.type === "input" && element.props.name === "password")
            .props.onChange({ target: { name: "password", value: "é".repeat(36) } });
        await find(render(), (element) => element.type === "form").props.onSubmit({ preventDefault() {} });
        assert.equal(posted.length, 1);
    } finally {
        await server.close();
        delete globalThis.smallFixAudit;
    }
});
