const { redisClient } = require("../config/redis");


const addUserToDocument = async(
    documentId,
    userId
)=>{

    await redisClient.sAdd(
        `document:${documentId}:presence`,
        userId.toString()
    );

};


const removeUserFromDocument = async(
    documentId,
    userId
)=>{

    await redisClient.sRem(
        `document:${documentId}:presence`,
        userId.toString()
    );

};


const getDocumentUsers = async(
    documentId
)=>{

    return await redisClient.sMembers(
        `document:${documentId}:presence`
    );

};


module.exports = {
    addUserToDocument,
    removeUserFromDocument,
    getDocumentUsers
};