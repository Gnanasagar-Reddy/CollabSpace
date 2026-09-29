const { Queue } = require("bullmq");

const documentQueue = new Queue(
    "document-save",
    {
        connection: {
            url: process.env.REDIS_URL
        }
    }
);

const AUTOSAVE_DELAY = 1000 * 60 * 3;

const getDocumentJobIds = (documentId) => [
    documentId,
    `${documentId}:next`
];

const getPendingJob = async (documentId) => {
    const jobIds = getDocumentJobIds(documentId);

    for (const jobId of jobIds) {
        const job = await documentQueue.getJob(jobId);

        if (!job) {
            continue;
        }

        const state = await job.getState();

        if (state === "delayed" || state === "waiting") {
            return job;
        }
    }

    return null;
};

const removeDocumentSaveJobs = async (documentId) => {
    for (const jobId of getDocumentJobIds(documentId)) {
        const job = await documentQueue.getJob(jobId);

        if (job) {
            await job.remove();
        }
    }
};

const addDocumentSaveJob = async (documentId) => {
    const pendingJob = await getPendingJob(documentId);

    if (pendingJob) {
        await pendingJob.updateData({ documentId });

        if (await pendingJob.isDelayed()) {
            await pendingJob.changeDelay(AUTOSAVE_DELAY);
        }

        return;
    }

    const primaryJob = await documentQueue.getJob(documentId);
    const jobId = primaryJob
        ? `${documentId}:next`
        : documentId;

    await documentQueue.add(
        "save-document",
        { documentId },
        {
            delay: AUTOSAVE_DELAY,
            jobId,
            removeOnComplete: true,
            removeOnFail: true
        }
    );
};

module.exports = {
    documentQueue,
    addDocumentSaveJob,
    removeDocumentSaveJobs
};
