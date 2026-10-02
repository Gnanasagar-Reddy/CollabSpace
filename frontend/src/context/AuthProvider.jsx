import { useEffect, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [restoreError, setRestoreError] = useState("");
    const [restoreAttempt, setRestoreAttempt] = useState(0);

    const login = (userData, accessToken) => {
        localStorage.removeItem("refreshToken");
        localStorage.setItem("accessToken", accessToken);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.log("Logout error:", error.response?.data || error);
        } finally {
            localStorage.removeItem("accessToken");
            setUser(null);
        }
    };

    useEffect(() => {
        let active = true;
        localStorage.removeItem("refreshToken");
        api.get("/auth/me")
            .then((response) => {
                if (!active) return;
                setUser(response.data.user);
            })
            .catch((error) => {
                if (!active) return;
                console.log("Failed to restore user:", error.response?.data || error);
                if ([401, 403].includes(error.response?.status)) {
                    localStorage.removeItem("accessToken");
                } else {
                    setRestoreError("Unable to restore your session. Check your connection and try again.");
                }
                setUser(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [restoreAttempt]);

    if (restoreError) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 dark:bg-gray-950">
                <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">{restoreError}</p>
                <button type="button" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" onClick={() => {
                    setRestoreError("");
                    setLoading(true);
                    setRestoreAttempt((attempt) => attempt + 1);
                }}>Retry connection</button>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
