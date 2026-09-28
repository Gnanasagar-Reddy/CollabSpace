const { Worker } = require("bullmq");

const Document = require(
    "../modules/document/document.model"
);

const {
    redisClient
} = require("../config/redis");
const {
    addDocumentSaveJob
} = require("./document.queue");

const deleteDraftIfUnchanged = async (
    redisKey,
    content
) => redisClient.eval(
    `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        end
        return 0
    `,
    {
        keys: [redisKey],
        arguments: [content]
    }
);

const worker =
    new Worker(
        "document-save",
        async (job) => {

            const { documentId } = job.data;

            const redisKey =
                `document:${documentId}:content`;

            const content = await redisClient.get(
                redisKey
            );

            if (content === null) {
                return;
            }

            await Document.findByIdAndUpdate(
                documentId,
                {
                    content
                }
            );

            const deleted = await deleteDraftIfUnchanged(
                redisKey,
                content
            );

            if (!deleted) {
                await addDocumentSaveJob(documentId);
            }

            console.log(
                "Document saved:",
                documentId
            );
        },
        {
            connection: {
                url: process.env.REDIS_URL
            }
        }
    );


worker.on(
    "failed",
    (job, error) => {
        console.log(
            "Job failed:",
            error
        );
    }
);


module.exports = worker;
