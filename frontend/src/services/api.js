import axios from "axios";


const api = axios.create({
    baseURL: "http://localhost:5000/api"
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


        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            console.log(
                "Access token expired. Trying refresh..."
            );


            originalRequest._retry = true;


            try {

                const refreshToken =
                    localStorage.getItem(
                        "refreshToken"
                    );


                console.log(
                    "Refresh token exists:",
                    !!refreshToken
                );


                const response =
                    await axios.post(
                        "http://localhost:5000/api/auth/refresh-token",
                        {
                            refreshToken
                        }
                    );


                console.log(
                    "Refresh response:",
                    response.data
                );


                const newAccessToken =
                    response.data.data.accessToken;


                localStorage.setItem(
                    "accessToken",
                    newAccessToken
                );


                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;


                console.log(
                    "Retrying original request..."
                );


                return api(
                    originalRequest
                );


            } catch (refreshError) {

                console.log(
                    "REFRESH FAILED:",
                    refreshError.response?.data
                );


                return Promise.reject(
                    refreshError
                );

            }

        }


        return Promise.reject(error);

    }

);


export default api;