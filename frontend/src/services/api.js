import axios from "axios";

let refreshRequest;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});


api.interceptors.request.use((config) => {

    const token =
        localStorage.getItem("accessToken");


    if (token) {

        config.headers.Authorization =
            `Bearer ${token}`;

    }


    return config;

});


api.interceptors.response.use(

    (response) => {

        return response;

    },


    async (error) => {

        console.log(
            "API ERROR:",
            error.response?.status,
            error.config?.url
        );


        const originalRequest =
            error.config;

        const isAuthRequest =
            /\/auth\/(?:login|register|refresh-token|logout)(?:[/?#]|$)/.test(originalRequest?.url || "");


        if (
            originalRequest &&
            error.response?.status === 401 &&
            !isAuthRequest &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;


            try {

                if (!refreshRequest) {
                    refreshRequest = axios.post(
                        `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
                        {},
                        {
                            withCredentials: true
                        }
                    ).finally(() => {
                        refreshRequest = null;
                    });
                }

                const response = await refreshRequest;


                const newAccessToken =
                    response.data.data.accessToken;

                if (typeof newAccessToken !== "string" || !newAccessToken) {
                    throw new Error("The server did not return a valid access token");
                }


                localStorage.setItem(
                    "accessToken",
                    newAccessToken
                );


                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;


                return api(
                    originalRequest
                );


            } catch (refreshError) {

                // A network outage or server error does not invalidate the session.
                if ([401, 403].includes(refreshError.response?.status)) {
                    localStorage.removeItem("accessToken");
                    if (window.location.pathname !== "/login") {
                        window.location.assign("/login");
                    }
                }

                return Promise.reject(
                    refreshError
                );

            }

        }


        return Promise.reject(error);

    }

);


export default api;
