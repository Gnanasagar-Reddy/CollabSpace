import {
    createContext,
    useEffect,
    useState
} from "react";
import api from "../services/api";

export const AuthContext =
    createContext();

export const AuthProvider = ({
    children
}) => {
    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const login = (
        userData,
        accessToken,
        refreshToken
    ) => {
        localStorage.setItem(
            "accessToken",
            accessToken
        );

        localStorage.setItem(
            "refreshToken",
            refreshToken
        );

        setUser(userData);
    };

    const logout = async () => {
        const refreshToken =
            localStorage.getItem(
                "refreshToken"
            );

        try {
            if (refreshToken) {
                await api.post(
                    "/auth/logout",
                    {
                        refreshToken
                    }
                );
            }
        } catch (error) {
            console.log(
                "Logout error:",
                error.response?.data ||
                error
            );
        } finally {
            localStorage.removeItem(
                "accessToken"
            );

            localStorage.removeItem(
                "refreshToken"
            );

            setUser(null);
        }
    };

    useEffect(() => {
        const restoreUser = async () => {
            const accessToken =
                localStorage.getItem(
                    "accessToken"
                );

            if (!accessToken) {
                setLoading(false);
                return;
            }

            try {
                const response =
                    await api.get(
                        "/auth/me"
                    );

                setUser(
                    response.data.user
                );
            } catch (error) {
                console.log(
                    "Failed to restore user:",
                    error.response?.data ||
                    error
                );

                localStorage.removeItem(
                    "accessToken"
                );

                localStorage.removeItem(
                    "refreshToken"
                );

                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};