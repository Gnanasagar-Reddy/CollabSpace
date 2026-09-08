const { Queue } = require("bullmq");

const documentQueue = new Queue(
    "document-save",
    {
        connection: {
            url: process.env.REDIS_URL
        }
    }
);

const addDocumentSaveJob = async (
    documentId,
    content
) => {

    const existingJob =
        await documentQueue.getJob(
            documentId
        );

    if (existingJob) {
        await existingJob.remove();
    }

    await documentQueue.add(
        "save-document",
        {
            documentId,
            content
        },
        {
            delay: 1000 * 60 * 3,
            jobId: documentId,
            removeOnComplete: true,
            removeOnFail: true
        }
    );
};

module.exports = {
    documentQueue,
    addDocumentSaveJob
};