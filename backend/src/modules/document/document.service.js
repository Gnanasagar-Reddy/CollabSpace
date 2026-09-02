const crudService =
    require("./services/document.crud.service");

const collaborationService =
    require("./services/document.collaboration.service");

const persistenceService =
    require("./services/document.persistence.service");

const versionService =
    require("./services/document.version.service");


module.exports = {
    ...crudService,
    ...collaborationService,
    ...persistenceService,
    ...versionService
};