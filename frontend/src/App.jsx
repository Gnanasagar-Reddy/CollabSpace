import {
    BrowserRouter,
    Navigate,
    Route,
    Routes
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    element={
                        <PublicRoute />
                    }
                >
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/document/:documentId"
                        element={<Editor />}
                    />
                </Route>

            <Route
                path="/"
                element={
                    localStorage.getItem(
                        "accessToken"
                    ) ? (
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    ) : (
                        <Navigate
                            to="/login"
                            replace
                        />
                    )
                }
            />

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />
        </Routes>
        </BrowserRouter >
    );
}

export default App;