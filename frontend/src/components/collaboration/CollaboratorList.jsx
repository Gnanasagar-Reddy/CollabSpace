import { useState } from "react";
import api from "../../services/api";

function CollaboratorList({
    documentId,
    collaborators,
    onUpdate
}) {

    const [message, setMessage] =
        useState("");

    const updateRole = async (
        collaboratorId,
        role
    ) => {

        try {

            const response =
                await api.patch(
                    `/documents/${documentId}/collaborators/${collaboratorId}`,
                    {
                        role
                    }
                );

            console.log(
                response.data
            );

            setMessage(
                "Role updated successfully"
            );

            if (onUpdate) {
                onUpdate();
            }

        } catch (error) {

            console.log(
                error.response?.data
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to update role"
            );

        }
    };


    const removeCollaborator = async (
        collaboratorId
    ) => {

        try {

            const response =
                await api.delete(
                    `/documents/${documentId}/collaborators/${collaboratorId}`
                );

            console.log(
                response.data
            );

            setMessage(
                "Collaborator removed"
            );

            if (onUpdate) {
                onUpdate();
            }

        } catch (error) {

            console.log(
                error.response?.data
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to remove collaborator"
            );

        }
    };


    if (
        !collaborators ||
        collaborators.length === 0
    ) {

        return (
            <div>

                <h3>
                    Collaborators
                </h3>

                <p>
                    No collaborators yet.
                </p>

            </div>
        );

    }


    return (

        <div>

            <h3>
                Collaborators
            </h3>


            {
                collaborators.map(
                    (collaborator) => {

                        const user =
                            collaborator.user;

                        return (

                            <div
                                key={user._id}
                            >

                                <div>

                                    <strong>
                                        {user.name}
                                    </strong>

                                    <div>
                                        {user.email}
                                    </div>

                                </div>


                                <select
                                    value={
                                        collaborator.role
                                    }
                                    onChange={(e) =>
                                        updateRole(
                                            user._id,
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="editor">
                                        Editor
                                    </option>

                                    <option value="viewer">
                                        Viewer
                                    </option>

                                </select>


                                <button
                                    onClick={() =>
                                        removeCollaborator(
                                            user._id
                                        )
                                    }
                                >
                                    Remove
                                </button>

                            </div>

                        );

                    }
                )
            }


            {
                message && (
                    <p>
                        {message}
                    </p>
                )
            }

        </div>
    );
}

export default CollaboratorList;