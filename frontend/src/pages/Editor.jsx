import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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


    const isReceivingUpdate =
        useRef(false);


    /*
     * Tiptap editor
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

            /*
             * Do not send changes received
             * from another user.
             */

            if (
                isReceivingUpdate.current
            ) {
                return;
            }


            /*
             * Viewer cannot edit.
             */

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


        /*
         * Receive document changes
         * from other users.
         */

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


        /*
         * Presence update
         */

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


        /*
         * Cleanup
         */

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


                /*
                 * Backend returns:
                 *
                 * {
                 *     document,
                 *     role
                 * }
                 */

                setDocument(
                    data.document
                );


                setUserRole(
                    data.role
                );


                /*
                 * Load initial content.
                 *
                 * Prevent this from being
                 * treated as a local edit.
                 */

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
     * UPDATE EDITOR PERMISSION
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


    /*
     * =========================
     * UI
     * =========================
     */

    return (

        <div className="editor-page">


            {/* =====================
                HEADER
            ====================== */}

            <DocumentHeader
                title={
                    document.title
                }

                role={
                    userRole
                }
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
                DOCUMENT
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