import axios from "axios";


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


        if (
            originalRequest &&
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;


            try {

                const response =
                    await axios.post(
                        `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
                        {},
                        {
                            withCredentials: true
                        }
                    );


                const newAccessToken =
                    response.data.data.accessToken;


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

                return Promise.reject(
                    refreshError
                );

            }

        }


        return Promise.reject(error);

    }

);


export default api;
