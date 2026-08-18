import { createContext, useState } from "react";

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(
        null
    );


    const login = (userData, token) => {

        localStorage.setItem(
            "accessToken",
            token
        );

        setUser(userData);

    };


    const logout = () => {

        localStorage.removeItem(
            "accessToken"
        );

        setUser(null);

    };


    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};