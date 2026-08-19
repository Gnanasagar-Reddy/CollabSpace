import { createContext, useState } from "react";

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(
        null
    );


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


const logout = () => {

    localStorage.removeItem(
        "accessToken"
    );


    localStorage.removeItem(
        "refreshToken"
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