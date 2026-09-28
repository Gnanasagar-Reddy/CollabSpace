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
        accessToken
    ) => {
        localStorage.removeItem(
            "refreshToken"
        );

        localStorage.setItem(
            "accessToken",
            accessToken
        );

        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post(
                "/auth/logout"
            );
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

            setUser(null);
        }
    };

    useEffect(() => {
        const restoreUser = async () => {
            localStorage.removeItem(
                "refreshToken"
            );

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
