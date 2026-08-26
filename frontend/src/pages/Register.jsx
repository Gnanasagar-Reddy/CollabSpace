import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
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
            await api.post(
                "/auth/register",
                form
            );

            setMessage(
                "Account created successfully"
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Registration failed"
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
                        Create, collaborate and bring your ideas together.
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
                            Get started
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Create your account
                        </h2>

                        <p className="mt-3 text-sm text-gray-500 sm:text-base">
                            Join CollabSpace and start collaborating.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
                    >
                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-800">
                                    Full name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    required
                                    className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                                />
                            </div>

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
                                    placeholder="Create a password"
                                    required
                                    minLength={6}
                                    className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                                />
                            </div>

                            {message && (
                                <div
                                    className={
                                        message.includes(
                                            "successfully"
                                        )
                                            ? "rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-600"
                                            : "rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                                    }
                                >
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </div>

                        <div className="mt-7 text-center text-sm text-gray-500">
                            Already have an account?

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/login")
                                }
                                className="ml-1 font-semibold text-indigo-600 transition hover:text-indigo-700"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;