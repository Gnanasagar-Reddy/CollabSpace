import { useEffect, useState } from "react";
import EditorPopover from "./EditorPopover";

const TEXT_COLORS = ["#111827", "#475569", "#4f46e5", "#0f766e", "#b45309", "#be123c", "#7e22ce", "#2563eb"];
const HIGHLIGHT_COLORS = ["#fef08a", "#bbf7d0", "#bae6fd", "#ddd6fe", "#fecdd3", "#fed7aa"];

function ToolButton({ active = false, children, className = "", ...props }) {
    return <button type="button" className={["editor-tool", active && "editor-tool-active", className].filter(Boolean).join(" ")} {...props}>{children}</button>;
}

function ToolDivider() {
    return <span className="editor-tool-divider" aria-hidden="true" />;
}

function EditorToolbar({ editor, userRole }) {
    const [, forceUpdate] = useState(0);
    const [colorMenuOpen, setColorMenuOpen] = useState(false);
    const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);
    const [linkMenuOpen, setLinkMenuOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [menuAnchor, setMenuAnchor] = useState(null);

    useEffect(() => {
        if (!editor) return undefined;
        const refresh = () => forceUpdate((value) => value + 1);
        editor.on("transaction", refresh);
        editor.on("selectionUpdate", refresh);
        editor.on("update", refresh);
        return () => {
            editor.off("transaction", refresh);
            editor.off("selectionUpdate", refresh);
            editor.off("update", refresh);
        };
    }, [editor]);

    if (!editor || userRole === "viewer") return null;

    const run = (command) => () => command(editor.chain().focus()).run();
    const setBlock = (event) => {
        const chain = editor.chain().focus();
        if (event.target.value === "paragraph") chain.setParagraph().run();
        else chain.toggleHeading({ level: Number(event.target.value) }).run();
    };
    const currentBlock = editor.isActive("heading", { level: 1 }) ? "1"
        : editor.isActive("heading", { level: 2 }) ? "2"
            : editor.isActive("heading", { level: 3 }) ? "3" : "paragraph";
    const openLinkMenu = (event) => {
        setMenuAnchor(event.currentTarget);
        setColorMenuOpen(false);
        setHighlightMenuOpen(false);
        setLinkUrl(editor.getAttributes("link").href || "https://");
        setLinkMenuOpen(true);
    };
    const applyLink = (event) => {
        event.preventDefault();
        const url = linkUrl.trim();
        if (!url) editor.chain().focus().unsetLink().run();
        else editor.chain().focus().setLink({ href: url }).run();
        setLinkMenuOpen(false);
    };

    return (
        <div className="editor-toolbar-shell">
            <div className="editor-toolbar" role="toolbar" aria-label="Document formatting">
                <div className="editor-toolbar-group">
                    <ToolButton title="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={run((chain) => chain.undo())}>↶</ToolButton>
                    <ToolButton title="Redo (Ctrl+Shift+Z)" disabled={!editor.can().redo()} onClick={run((chain) => chain.redo())}>↷</ToolButton>
                </div>
                <ToolDivider />
                <select className="editor-block-select" value={currentBlock} onChange={setBlock} aria-label="Text style">
                    <option value="paragraph">Normal text</option>
                    <option value="1">Title</option>
                    <option value="2">Heading</option>
                    <option value="3">Subheading</option>
                </select>
                <ToolDivider />
                <div className="editor-toolbar-group">
                    <ToolButton active={editor.isActive("bold")} title="Bold (Ctrl+B)" onClick={run((chain) => chain.toggleBold())}><strong>B</strong></ToolButton>
                    <ToolButton active={editor.isActive("italic")} title="Italic (Ctrl+I)" onClick={run((chain) => chain.toggleItalic())}><em>I</em></ToolButton>
                    <ToolButton active={editor.isActive("underline")} title="Underline (Ctrl+U)" onClick={run((chain) => chain.toggleUnderline())}><span className="underline">U</span></ToolButton>
                    <ToolButton active={editor.isActive("strike")} title="Strikethrough" onClick={run((chain) => chain.toggleStrike())}><span className="line-through">S</span></ToolButton>
                    <ToolButton active={editor.isActive("code")} title="Inline code" onClick={run((chain) => chain.toggleCode())}>{"</>"}</ToolButton>
                </div>
                <ToolDivider />
                <div className="editor-toolbar-group">
                    <ToolButton active={editor.isActive("bulletList")} title="Bullet list" onClick={run((chain) => chain.toggleBulletList())}>• List</ToolButton>
                    <ToolButton active={editor.isActive("orderedList")} title="Numbered list" onClick={run((chain) => chain.toggleOrderedList())}>1. List</ToolButton>
                    <ToolButton active={editor.isActive("taskList")} title="Checklist" onClick={run((chain) => chain.toggleTaskList())}>☑</ToolButton>
                    <ToolButton active={editor.isActive("blockquote")} title="Quote" onClick={run((chain) => chain.toggleBlockquote())}>❝</ToolButton>
                    <ToolButton active={editor.isActive("codeBlock")} title="Code block" onClick={run((chain) => chain.toggleCodeBlock())}>Code</ToolButton>
                </div>
                <ToolDivider />
                <div className="editor-toolbar-group">
                    {[["left", "Left"], ["center", "Center"], ["right", "Right"]].map(([align, label]) => (
                        <ToolButton key={align} active={editor.isActive({ textAlign: align })} title={"Align " + label.toLowerCase()} onClick={run((chain) => chain.setTextAlign(align))}>
                            <span className={"editor-align editor-align-" + align}>≡</span>
                        </ToolButton>
                    ))}
                </div>
                <ToolDivider />
                <div className="editor-toolbar-group editor-color-group">
                    <ToolButton active={Boolean(editor.getAttributes("textStyle").color)} title="Text colour" onClick={(event) => { setMenuAnchor(event.currentTarget); setColorMenuOpen(!colorMenuOpen); setHighlightMenuOpen(false); setLinkMenuOpen(false); }}>
                        <span className="editor-color-letter">A</span>
                    </ToolButton>
                    {colorMenuOpen && <EditorPopover anchor={menuAnchor} onClose={() => setColorMenuOpen(false)} className="editor-palette" role="dialog" aria-label="Text colours">
                        {TEXT_COLORS.map((color) => <button key={color} type="button" className="editor-swatch" style={{ backgroundColor: color }} onClick={run((chain) => chain.setColor(color))} aria-label={"Set text color " + color} />)}
                        <button type="button" className="editor-palette-clear" onClick={run((chain) => chain.unsetColor())}>Clear</button>
                    </EditorPopover>}
                    <ToolButton active={editor.isActive("highlight")} title="Highlight colour" onClick={(event) => { setMenuAnchor(event.currentTarget); setHighlightMenuOpen(!highlightMenuOpen); setColorMenuOpen(false); setLinkMenuOpen(false); }}>
                        <span className="editor-highlight-letter">H</span>
                    </ToolButton>
                    {highlightMenuOpen && <EditorPopover anchor={menuAnchor} onClose={() => setHighlightMenuOpen(false)} className="editor-palette" role="dialog" aria-label="Highlight colours">
                        {HIGHLIGHT_COLORS.map((color) => <button key={color} type="button" className="editor-swatch" style={{ backgroundColor: color }} onClick={run((chain) => chain.setHighlight({ color }))} aria-label={"Set highlight color " + color} />)}
                        <button type="button" className="editor-palette-clear" onClick={run((chain) => chain.unsetHighlight())}>Clear</button>
                    </EditorPopover>}
                </div>
                <ToolDivider />
                <div className="editor-toolbar-group editor-link-group">
                    <ToolButton active={editor.isActive("link")} title="Add or edit link" onClick={openLinkMenu}>Link</ToolButton>
                    {editor.isActive("link") && <ToolButton title="Remove link" onClick={run((chain) => chain.unsetLink())}>×</ToolButton>}
                    {linkMenuOpen && <EditorPopover anchor={menuAnchor} onClose={() => setLinkMenuOpen(false)} className="editor-link-popover" role="dialog" aria-label="Edit link"><form onSubmit={applyLink}>
                        <label htmlFor="editor-link-url">Link URL</label>
                        <div><input id="editor-link-url" autoFocus value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://example.com" /><button type="submit">Apply</button></div>
                    </form></EditorPopover>}
                    <ToolButton title="Horizontal line" onClick={run((chain) => chain.setHorizontalRule())}>—</ToolButton>
                </div>
                <ToolDivider />
                <div className="editor-toolbar-group">
                    <ToolButton active={editor.isActive("table")} title="Insert a 3 by 3 table" onClick={run((chain) => chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }))}>Table</ToolButton>
                    {editor.isActive("table") && <>
                        <ToolButton title="Add row" onClick={run((chain) => chain.addRowAfter())}>+ Row</ToolButton>
                        <ToolButton title="Add column" onClick={run((chain) => chain.addColumnAfter())}>+ Col</ToolButton>
                        <ToolButton className="editor-tool-danger" title="Delete table" onClick={run((chain) => chain.deleteTable())}>Delete</ToolButton>
                    </>}
                </div>
                <ToolDivider />
                <ToolButton title="Clear formatting" onClick={run((chain) => chain.clearNodes().unsetAllMarks())}>Tx</ToolButton>
            </div>
        </div>
    );
}

export default EditorToolbar;
