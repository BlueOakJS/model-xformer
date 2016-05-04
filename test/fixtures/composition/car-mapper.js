var modelMapper = require('../../../index');
var engineMapper = require('./engine-mapper');

var carMappingConfig = {
    dataMappings: {
        'make': 'Manufacture.Name',
        'model': 'Manufacture.Model'
    },
    customProcessors: [
        {
            targetModelPath: 'engine',
            sourceModelPath: 'Mechanical_Systems.Engine',
            processor: engineMapper.map
        }
    ]
};

module.exports = modelMapper.createMapper(carMappingConfig);
