import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Escape the toolbar's scroll container and keep menus within the viewport.
export default function EditorPopover({ anchor, onClose, children, className, ...props }) {
    const ref = useRef(null);
    useLayoutEffect(() => {
        if (!anchor) return undefined;
        const position = () => {
            const box = anchor.getBoundingClientRect();
            const menu = ref.current;
            const left = Math.max(8, Math.min(box.left, window.innerWidth - menu.offsetWidth - 8));
            const top = box.bottom + menu.offsetHeight + 8 <= window.innerHeight
                ? box.bottom + 8 : Math.max(8, box.top - menu.offsetHeight - 8);
            menu.style.left = `${left}px`;
            menu.style.top = `${top}px`;
        };
        const outside = (event) => {
            if (!ref.current.contains(event.target) && !anchor.contains(event.target)) onClose();
        };
        const escape = (event) => { if (event.key === "Escape") onClose(); };
        position();
        window.addEventListener("resize", position);
        window.addEventListener("scroll", position, true);
        document.addEventListener("pointerdown", outside);
        document.addEventListener("keydown", escape);
        return () => {
            window.removeEventListener("resize", position);
            window.removeEventListener("scroll", position, true);
            document.removeEventListener("pointerdown", outside);
            document.removeEventListener("keydown", escape);
        };
    }, [anchor, onClose]);
    return createPortal(
        <div ref={ref} className={className} style={{ position: "fixed", zIndex: 100, maxWidth: "calc(100vw - 16px)" }} {...props}>
            {children}
        </div>, document.body
    );
}
