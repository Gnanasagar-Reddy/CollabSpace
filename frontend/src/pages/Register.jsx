import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/login.css";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
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
                    "/auth/register",
                    form
                );


            console.log(
                response.data
            );


            setMessage(
                "Account created successfully"
            );


            setTimeout(() => {

                navigate("/login");

            }, 1000);


        } catch (error) {

            console.log(
                error.response?.data
            );


            setMessage(
                error.response?.data?.message ||
                "Registration failed"
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
                    Create your account
                </h1>


                <p className="login-subtitle">
                    Join CollabSpace and start collaborating
                </p>


                <form
                    onSubmit={handleSubmit}
                    className="login-form"
                >


                    {/* Name */}

                    <div className="form-group">

                        <label>
                            Full name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Your name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                    </div>


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

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />

                    </div>


                    {/* Message */}

                    {message && (

                        <div
                            className={
                                message.includes(
                                    "successfully"
                                )
                                    ? "login-success"
                                    : "login-error"
                            }
                        >
                            {message}
                        </div>

                    )}


                    {/* Register */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating account..."
                            : "Create account"
                        }

                    </button>


                </form>


                <p className="login-footer">

                    Already have an account?

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Sign in
                    </button>

                </p>


            </div>

        </div>

    );

}

export default Register;