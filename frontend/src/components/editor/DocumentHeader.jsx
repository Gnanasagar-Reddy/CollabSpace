import { useNavigate } from "react-router-dom";

function DocumentHeader({
    title,
    role
}) {

    const navigate = useNavigate();

    return (

        <header className="document-header">

            <div className="document-header-left">

                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    ←
                </button>


                <div className="document-header-info">

                    <h1>
                        {title || "Untitled Document"}
                    </h1>


                    <span
                        className={`role-badge ${role}`}
                    >
                        {role}
                    </span>

                </div>

            </div>


            <div className="document-header-right">

                <div className="sync-status">

                    <span className="sync-dot"></span>

                    Saved

                </div>

            </div>

        </header>

    );
}

export default DocumentHeader;