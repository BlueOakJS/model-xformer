var ModelMapper = require('./lib/ModelMapper');

function createMapper(mappingConfig) {
    return new ModelMapper(mappingConfig);
}

module.exports = {
    createMapper: createMapper
};
