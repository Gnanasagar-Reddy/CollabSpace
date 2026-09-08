const { redisClient } = require("../config/redis");
const User = require("../modules/auth/user.model");


const addUserToDocument = async (
    documentId,
    userId,
    socketId
) => {

    await redisClient.hSet(
        `document:${documentId}:presence`,
        socketId,
        userId.toString()
    );

};


const removeUserFromDocument = async (
    documentId,
    socketId
) => {

    await redisClient.hDel(
        `document:${documentId}:presence`,
        socketId
    );

};


const getDocumentUsers = async (
    documentId
) => {

    const connections =
        await redisClient.hGetAll(
            `document:${documentId}:presence`
        );


    const userIds =
        [...new Set(
            Object.values(connections)
        )];


    if (userIds.length === 0) {
        return [];
    }


    const users = await User.find({
        _id: {
            $in: userIds
        }
    }).select(
        "_id name email"
    );


    return users.map(
        (user) => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email
        })
    );

};


module.exports = {
    addUserToDocument,
    removeUserFromDocument,
    getDocumentUsers
};