const { Worker } = require("bullmq");
const Document = require("../modules/document/document.model");

const worker =
new Worker(
    "document-save",
    async(job)=>{

        const {
            documentId,
            content
        } = job.data;


        await Document.findByIdAndUpdate(
            documentId,
            {
                content
            }
        );


        console.log(
            "Document saved:",
            documentId
        );

    },
    {
        connection:{
            host:"localhost",
            port:6379
        }
    }
);


worker.on(
    "failed",
    (job,error)=>{

        console.log(
            "Job failed:",
            error
        );

    }
);