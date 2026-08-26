const crudService =
    require("./services/document.crud.service");

const collaborationService =
    require("./services/document.collaboration.service");

const persistenceService =
    require("./services/document.persistence.service");

module.exports = {
    ...crudService,
    ...collaborationService,
    ...persistenceService
};