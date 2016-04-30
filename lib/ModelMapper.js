var _ = require('lodash');
var accessors = require('./accessors');

function ModelMapper(mapperConfig) {
    Object.defineProperty(this, 'config', {
        value: mapperConfig
    });
}

ModelMapper.prototype.map = function (valuesModel) {
    return mapModel(valuesModel, this.config, false);
};

ModelMapper.prototype.mapReverse = function (keysModel) {
    return mapModel(keysModel, this.config, true);
};

function mapModel(dataObj, map, reverse) {
    var destObj = {};
    mapAndTransform(dataObj, destObj, map, reverse);
    runCustomProcessors(dataObj, destObj, map, reverse);
    return destObj;
}

function mapAndTransform(dataObj, destObj, mappingConfig, reverse) {
    if (!dataObj || !mappingConfig) {
        return null;
    }

    if (!destObj) {
        destObj = {};
    }

    _.forEach(mappingConfig.dataMappings, function (valuePath, keyPath) {
        var dataPath = reverse ? keyPath : valuePath;
        var destPath = reverse ? valuePath : keyPath;

        // Find the value to be copied
        var value = accessors.getValue(dataObj, dataPath);

        // Check for a transformer for this newly-found value
        var transformer = accessors.getValue(mappingConfig.dataTransforms, keyPath);
        if (_.isFunction(transformer)) {
            value = transformer(value, reverse);
        }

        // If we're left with a value after transformation, copy it.
        if (value !== undefined) {
            accessors.setValue(destObj, destPath, value);
        }
    });

    return destObj;
}

function runCustomProcessors(dataObj, destObj, mappingConfig, reverse) {
    var dataPath, destPath;
    if (!Array.isArray(mappingConfig.customProcessors)) {
        return destObj;
    } else if (reverse) {
        dataPath = 'targetModelPath';
        destPath = 'sourceModelPath';
    } else {
        dataPath = 'sourceModelPath';
        destPath = 'targetModelPath';
    }

    _.forEach(mappingConfig.customProcessors, function (procdef) {
        var sourceObj = procdef[dataPath] ? _.get(dataObj, procdef[dataPath]) : dataObj;
        if (sourceObj) {
            var result = procdef.processor(sourceObj, reverse);
            if (result) {
                if (procdef[destPath] && !_.has(destObj, procdef[destPath])) {
                    _.set(destObj, procdef[destPath], {});
                }
                var targetObj = procdef[destPath] ? _.get(destObj, procdef[destPath]) : destObj;
                _.set(destObj, procdef[destPath], _.assign(targetObj, result));
            }
        }
    });

    return destObj;
}

module.exports = ModelMapper;
