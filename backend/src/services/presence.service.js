const { redisClient } = require("../config/redis");
const User = require("../modules/auth/user.model");


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

    const userIds = await redisClient.sMembers(
        `document:${documentId}:presence`
    );


    const users = await User.find({
        _id: {
            $in: userIds
        }
    }).select(
        "_id name email"
    );


    return users.map(
        (user)=>({
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