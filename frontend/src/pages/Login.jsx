import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/login.css";

function Login() {

    const navigate = useNavigate();

    const { login } =
        useContext(AuthContext);

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {

            const response =
                await api.post(
                    "/auth/login",
                    form
                );


            const {
                user,
                accessToken,
                refreshToken
            } = response.data.data;


            login(
                user,
                accessToken,
                refreshToken
            );


            navigate("/dashboard");


        } catch (error) {

            console.log(
                error.response?.data
            );


            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="login-page">

            <div className="login-card">


                {/* Logo */}

                <div className="login-logo">
                    C
                </div>


                <h1>
                    Welcome back
                </h1>


                <p className="login-subtitle">
                    Sign in to continue to CollabSpace
                </p>


                <form
                    onSubmit={handleSubmit}
                    className="login-form"
                >


                    {/* Email */}

                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* Password */}

                    <div className="form-group">

                        <div className="password-label">

                            <label>
                                Password
                            </label>

                        </div>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* Error */}

                    {message && (

                        <div className="login-error">
                            {message}
                        </div>

                    )}


                    {/* Login button */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing in..."
                            : "Sign in"
                        }

                    </button>


                </form>


                <p className="login-footer">

                    Don't have an account?

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/register")
                        }
                    >
                        Create account
                    </button>

                </p>


            </div>

        </div>

    );

}

export default Login;