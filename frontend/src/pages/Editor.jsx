import { useEffect, useState, useRef } from "react";
import { useNavigate,useParams } from "react-router-dom";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import api from "../services/api";

import socket, {
    connectSocket
} from "../socket/socket";

import DocumentHeader
    from "../components/editor/DocumentHeader";

import EditorToolbar
    from "../components/editor/EditorToolbar";

import OnlineUsers
    from "../components/editor/OnlineUsers";

import EditorContentArea
    from "../components/editor/EditorContentArea";

import ShareDocument
    from "../components/collaboration/ShareDocument";

import "../styles/editor.css";


function Editor() {

    const { documentId } = useParams();


    const [document, setDocument] =
        useState(null);


    const [userRole, setUserRole] =
        useState(null);


    const [onlineUsers, setOnlineUsers] =
        useState([]);


    const [editingTitle, setEditingTitle] =
        useState(false);


    const [newTitle, setNewTitle] =
        useState("");


    const [deleting, setDeleting] =
        useState(false);

    const [renameMessage, setRenameMessage] =
        useState("");


    const isReceivingUpdate =
        useRef(false);

    const navigate = useNavigate();

    /*
     * =========================
     * TIPTAP EDITOR
     * =========================
     */

    const editor = useEditor({

        extensions: [
            StarterKit
        ],

        content: "",

        immediatelyRender: false,

        editable:
            userRole !== "viewer",


        onUpdate: ({ editor }) => {

            if (
                isReceivingUpdate.current
            ) {
                return;
            }


            if (
                userRole === "viewer"
            ) {
                return;
            }


            console.log(
                "Sending change:",
                editor.getHTML()
            );


            socket.emit(
                "document-change",
                {
                    documentId,

                    content:
                        editor.getHTML()
                }
            );

        }

    });


    /*
     * =========================
     * SOCKET CONNECTION
     * =========================
     */

    useEffect(() => {

        connectSocket();


        const handleConnect = () => {

            console.log(
                "Socket connected:",
                socket.id
            );


            socket.emit(
                "join-document",
                documentId
            );

        };


        const handleDocumentUpdate = (
            data
        ) => {

            console.log(
                "Received update:",
                data.content
            );


            if (!editor) {
                return;
            }


            isReceivingUpdate.current =
                true;


            editor.commands.setContent(
                data.content,
                false
            );


            isReceivingUpdate.current =
                false;

        };


        const handlePresenceUpdate = (
            data
        ) => {

            console.log(
                "Presence update:",
                data.users
            );


            setOnlineUsers(
                data.users
            );

        };


        socket.on(
            "connect",
            handleConnect
        );


        socket.on(
            "document-update",
            handleDocumentUpdate
        );


        socket.on(
            "presence-update",
            handlePresenceUpdate
        );


        return () => {

            socket.off(
                "connect",
                handleConnect
            );


            socket.off(
                "document-update",
                handleDocumentUpdate
            );


            socket.off(
                "presence-update",
                handlePresenceUpdate
            );


            socket.disconnect();

        };

    }, [
        documentId,
        editor
    ]);


    /*
     * =========================
     * LOAD DOCUMENT
     * =========================
     */

    useEffect(() => {

        if (!editor) {
            return;
        }


        const loadDocument = async () => {

            try {

                const response =
                    await api.get(
                        `/documents/${documentId}`
                    );


                const data =
                    response.data.data;


                setDocument(
                    data.document
                );


                setUserRole(
                    data.role
                );


                isReceivingUpdate.current =
                    true;


                editor.commands.setContent(
                    data.document.content || "",
                    false
                );


                isReceivingUpdate.current =
                    false;


            } catch (error) {

                console.log(
                    error.response?.data ||
                    error
                );

            }

        };


        loadDocument();

    }, [
        documentId,
        editor
    ]);


    /*
     * =========================
     * EDITOR PERMISSION
     * =========================
     */

    useEffect(() => {

        if (
            !editor ||
            !userRole
        ) {
            return;
        }


        editor.setEditable(
            userRole !== "viewer"
        );

    }, [
        editor,
        userRole
    ]);


    /*
     * =========================
     * RENAME DOCUMENT
     * =========================
     */

    const renameDocument = async () => {

        const title =
            newTitle.trim();


        if (!title) {

            setRenameMessage(
                "Document name cannot be empty"
            );

            return;

        }


        if (title === document.title) {

            setEditingTitle(false);

            return;

        }


        try {

            const response =
                await api.put(
                    `/documents/${documentId}`,
                    {
                        title
                    }
                );


            setDocument(
                response.data.data
            );


            setEditingTitle(false);

            setNewTitle("");

            setRenameMessage("");


        } catch (error) {

            console.log(
                error.response?.data ||
                error
            );


            setRenameMessage(
                error.response?.data?.message ||
                "Failed to rename document"
            );

        }

    };


    /*
     * =========================
     * START RENAMING
     * =========================
     */

    const startRename = () => {

        setNewTitle(
            document.title
        );

        setRenameMessage("");

        setEditingTitle(true);

    };


    /*
     * =========================
     * CANCEL RENAMING
     * =========================
     */

    const cancelRename = () => {

        setEditingTitle(false);

        setNewTitle("");

        setRenameMessage("");

    };


    /*
     * =========================
     * LOADING
     * =========================
     */

    if (!document) {

        return (
            <div className="editor-loading">

                <h2>
                    Loading document...
                </h2>

            </div>
        );

    }

    const deleteDocument = async () => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this document?"
            );

        if (!confirmed) {
            return;
        }


        try {

            setDeleting(true);


            await api.delete(
                `/documents/${documentId}`
            );


            navigate("/dashboard");


        } catch (error) {

            console.log(
                error.response?.data ||
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete document"
            );


        } finally {

            setDeleting(false);

        }

    };


    /*
     * =========================
     * UI
     * =========================
     */

    return (

        <div className="editor-page">


            {/* =====================
                DOCUMENT HEADER
            ====================== */}

            <DocumentHeader
                title={document.title}
                role={userRole}

                editingTitle={editingTitle}
                newTitle={newTitle}
                setNewTitle={setNewTitle}

                startRename={startRename}
                renameDocument={renameDocument}
                cancelRename={cancelRename}
                renameMessage={renameMessage}

                deleteDocument={deleteDocument}
                deleting={deleting}
            />


            {/* =====================
                TOOLBAR
            ====================== */}

            <EditorToolbar
                editor={
                    editor
                }
            />


            {/* =====================
                SHARE DOCUMENT
            ====================== */}

            {userRole === "owner" && (

                <ShareDocument
                    documentId={
                        documentId
                    }
                />

            )}


            {/* =====================
                ONLINE USERS
            ====================== */}

            <OnlineUsers
                users={
                    onlineUsers
                }
            />


            {/* =====================
                DOCUMENT CONTENT
            ====================== */}

            <EditorContentArea
                editor={
                    editor
                }
            />


        </div>

    );

}


export default Editor;