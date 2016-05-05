var modelMapper = require('../../../index');
var engineMapper = require('./engine-mapper');

var carMappingConfig = {
    dataMappings: {
        'make': 'Manufacture.Name',
        'model': 'Manufacture.Model',
        'engine': 'Mechanical_Systems.Engine'
    },
    dataTransforms: {
        'engine': engineMapper.map
    }
};

module.exports = modelMapper.createMapper(carMappingConfig);
