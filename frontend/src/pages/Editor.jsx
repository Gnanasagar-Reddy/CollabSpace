import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { connectSocket } from "../socket/socket";

import api from "../services/api";
import socket from "../socket/socket";


function Editor() {

    const { documentId } = useParams();

    const [document, setDocument] = useState(null);

    const isReceivingUpdate = useRef(false);


    const editor = useEditor({
        extensions: [
            StarterKit
        ],

        content: "",

        immediatelyRender: false,

        onUpdate: ({ editor }) => {

            if (isReceivingUpdate.current) {
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
                    content: editor.getHTML()
                }
            );

        }
    });


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

        const handleDocumentUpdate = (data) => {


            console.log(
                "Received update:",
                data.content
            );


            if (editor) {

                isReceivingUpdate.current = true;


                editor.commands.setContent(
                    data.content
                );


                isReceivingUpdate.current = false;

            }

        };


        
        socket.on(
            "connect",
            handleConnect
        );


        socket.on(
            "document-update",
            handleDocumentUpdate
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


            socket.disconnect();

        };


    }, [documentId, editor]);


    useEffect(() => {

        const loadDocument = async () => {

            const response =
                await api.get(
                    `/documents/${documentId}`
                );


            setDocument(
                response.data.data
            );


            if (editor) {

                editor.commands.setContent(
                    response.data.data.content || "",
                    false
                );

            }

        };


        loadDocument();


    }, [documentId, editor]);

    useEffect(() => {

        const handleUpdate = (data) => {

            console.log(
                "Received update:",
                data.content
            );


            if (editor) {

                editor.commands.setContent(
                    data.content,
                    false
                );

            }

        };


        socket.on(
            "document-update",
            handleUpdate
        );


        return () => {

            socket.off(
                "document-update",
                handleUpdate
            );

        };


    }, [editor]);

    if (!document) {

        return <h1>Loading...</h1>;

    }


    return (
        <div>

            <h1>
                {document.title}
            </h1>


            <EditorContent
                editor={editor}
            />

        </div>
    );
}

export default Editor;