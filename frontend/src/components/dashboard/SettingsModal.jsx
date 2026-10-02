import { useEffect, useRef } from "react";
import ThemeToggle from "../common/ThemeToggle";
import { getUserProfile } from "../../utils/userProfile";

export default function SettingsModal({ user, onClose }) {
    const ref = useRef(null);
    const { name } = getUserProfile(user);
    useEffect(() => {
        const dialog = ref.current;
        dialog.showModal();
        return () => dialog.close();
    }, []);
    return (
        <dialog ref={ref} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
            aria-labelledby="settings-title" className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/40 dark:bg-gray-900 dark:text-white">
            <h2 id="settings-title" className="text-xl font-semibold">Settings</h2>
            <p className="mt-4 font-medium">{name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <div className="mt-6 flex items-center justify-between"><span>Appearance</span><ThemeToggle /></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Starred documents are saved for your account in this browser.</p>
            <button type="button" autoFocus onClick={onClose} className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">Close</button>
        </dialog>
    );
}
