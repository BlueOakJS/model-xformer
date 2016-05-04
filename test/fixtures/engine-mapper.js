var modelMapper = require('../../index');
var engineMappingConfig = {
    dataMappings: {
        'size': 'Volume',
        'hp': 'Horse_Power'
    }
};
module.exports = modelMapper.createMapper(engineMappingConfig);
