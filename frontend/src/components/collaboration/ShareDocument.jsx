import { useState } from "react";
import api from "../../services/api";


function ShareDocument({ documentId }) {

    const [email, setEmail] =
        useState("");

    const [role, setRole] =
        useState("editor");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const shareDocument = async () => {

        if (!email.trim()) {

            setMessage(
                "Please enter a user's email."
            );

            return;

        }


        try {

            setLoading(true);

            setMessage("");


            await api.post(
                `/documents/${documentId}/share`,
                {
                    email: email.trim(),
                    role
                }
            );


            setMessage(
                "Document shared successfully."
            );


            setEmail("");


        } catch (error) {

            console.log(
                error.response?.data
            );


            setMessage(
                error.response?.data?.message ||
                "Failed to share document."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="share-card">


            <div className="share-header">

                <div>

                    <h3>
                        Share document
                    </h3>

                    <p>
                        Invite people to collaborate
                        on this document.
                    </p>

                </div>

                <div className="share-icon">
                    ↗
                </div>

            </div>


            <div className="share-form">


                <div className="share-input-wrapper">

                    <span className="input-icon">
                        @
                    </span>

                    <input
                        type="email"
                        placeholder="Enter user's email"
                        value={email}
                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={role}
                    onChange={(e) =>
                        setRole(
                            e.target.value
                        )
                    }
                >

                    <option value="editor">
                        Can edit
                    </option>

                    <option value="viewer">
                        Can view
                    </option>

                </select>


                <button
                    type="button"
                    className="share-button"
                    onClick={shareDocument}
                    disabled={loading}
                >

                    {loading
                        ? "Sharing..."
                        : "Share"
                    }

                </button>

            </div>


            {message && (

                <div className="share-message">

                    {message}

                </div>

            )}

        </div>

    );

}


export default ShareDocument;