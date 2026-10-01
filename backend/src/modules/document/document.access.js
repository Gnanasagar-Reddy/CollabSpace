const getDocumentAccess = (document, userId) => {
    const userIdString = userId.toString();
    const isOwner = document.owner.toString() === userIdString;
    const collaborator = document.collaborators.find(
        (item) => (item.user._id || item.user).toString() === userIdString
    );
    const isEditor = Boolean(collaborator && collaborator.role === "editor");

    return {
        isOwner,
        collaborator,
        isEditor,
        hasAccess: isOwner || Boolean(collaborator),
        canEdit: isOwner || isEditor,
        role: isOwner ? "owner" : collaborator?.role
    };
};

module.exports = { getDocumentAccess };
