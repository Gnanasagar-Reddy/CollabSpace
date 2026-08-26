import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
            const response = await api.post(
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
            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 lg:flex lg:p-6">
            <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:rounded-3xl lg:bg-gradient-to-br lg:from-indigo-600 lg:via-indigo-600 lg:to-violet-600">
                <div className="max-w-md px-12 text-center text-white">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-5xl font-bold shadow-lg backdrop-blur-sm">
                        C
                    </div>

                    <h1 className="mt-8 text-4xl font-bold tracking-tight">
                        CollabSpace
                    </h1>

                    <p className="mt-4 text-lg leading-8 text-indigo-100">
                        Collaborate, create and achieve more together.
                    </p>
                </div>
            </div>

            <div className="flex min-h-screen w-full items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0 lg:w-1/2 lg:px-12 lg:py-16">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center lg:text-left">
                        <div className="mb-6 flex justify-center lg:hidden">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-2xl font-bold text-white shadow-sm">
                                C
                            </div>
                        </div>

                        <p className="text-sm font-semibold text-indigo-600">
                            Welcome back 👋
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Sign in to your account
                        </h2>

                        <p className="mt-3 text-sm text-gray-500 sm:text-base">
                            Enter your credentials to continue to CollabSpace
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
                    >
                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-800">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                    className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-800">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                                />
                            </div>

                            {message && (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Signing in..."
                                    : "Sign in"}
                            </button>
                        </div>

                        <div className="mt-7 text-center text-sm text-gray-500">
                            Don't have an account?

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/register")
                                }
                                className="ml-1 font-semibold text-indigo-600 transition hover:text-indigo-700"
                            >
                                Create account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;