import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";


function Dashboard() {
    const navigate = useNavigate();
    const [documents, setDocuments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    const fetchDocuments = async () => {

        try {

            const response =
                await api.get(
                    "/documents"
                );


            console.log(
                response.data
            );


            setDocuments(
                response.data.data
            );


        } catch (error) {

            console.log(
                error.response.data
            );

        } finally {

            setLoading(false);

        }

    };

    const createDocument = async () => {

        try {

            const response =
                await api.post(
                    "/documents",
                    {
                        title: "Untitled Document",
                        content: ""
                    }
                );


            console.log(
                response.data
            );


            const documentId =
                response.data.data._id;


            navigate(
                `/document/${documentId}`
            );


        } catch (error) {

            console.log(
                error.response.data
            );

        }

    };

    useEffect(() => {

        fetchDocuments();

    }, []);



    if (loading) {

        return <h1>Loading...</h1>;

    }


    return (

        <div>

            <h1>
                Dashboard
            </h1>


            <h2>
                My Documents
            </h2>


            {
                documents.map(
                    (doc) => (

                        <div key={doc._id}>

                            <h3>
                                {doc.title}
                            </h3>


                            <button
                                onClick={() =>
                                    navigate(
                                        `/document/${doc._id}`
                                    )
                                }
                            >
                                Open Document
                            </button>


                        </div>

                    )
                )
            }
            <button
                onClick={createDocument}
            >
                Create Document
            </button>


        </div>

    );

}


export default Dashboard;