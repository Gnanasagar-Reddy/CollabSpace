import { useState } from "react";

const storageKey = (userId) => `collabspace:starred:${userId}`;
export function readStarredDocuments(userId) {
    if (!userId) return [];
    try {
        const ids = JSON.parse(localStorage.getItem(storageKey(userId)) || "[]");
        return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
    } catch { return []; }
}

export default function useStarredDocuments(userId) {
    const [byUser, setByUser] = useState(() => ({ [userId]: readStarredDocuments(userId) }));
    const [error, setError] = useState("");
    const starredIds = byUser[userId] || readStarredDocuments(userId);
    const toggleStar = (documentId) => {
        if (!userId) return;
        const next = starredIds.includes(documentId)
            ? starredIds.filter((id) => id !== documentId) : [...starredIds, documentId];
        try {
            localStorage.setItem(storageKey(userId), JSON.stringify(next));
            setByUser((current) => ({ ...current, [userId]: next }));
            setError("");
        } catch {
            setError("Unable to save favourites in this browser. Check your browser storage settings.");
        }
    };
    return { starredIds, toggleStar, error };
}
