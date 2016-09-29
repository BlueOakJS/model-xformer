var ModelMapper = require('./lib/ModelMapper'),
    mapperUtils = require('./lib/mapperUtils');

function createMapper(mappingConfig) {
    return new ModelMapper(mappingConfig);
}

module.exports = {
    createMapper: createMapper,
    utils: mapperUtils
};
