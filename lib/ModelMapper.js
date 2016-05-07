var _ = require('lodash'),
    util = require('util');
var accessors = require('./accessors');

function ModelMapper(mapperConfig) {
    Object.defineProperty(this, 'config', {
        value: mapperConfig
    });
    this.map = function (valuesModel, reverse) {
        return mapModel(valuesModel, mapperConfig, reverse);
    };
    this.mapReverse = function (keysModel) {
        return mapModel(keysModel, mapperConfig, true);
    };
    this.mapArray = function (valuesModels, reverse) {
        if (!valuesModels || _.isArray(valuesModels)) {
            return _.map(valuesModels, function (valuesModel) {
                return mapModel(valuesModel, mapperConfig, reverse);
            });
        } else {
            throw Error('Value must be an array.');
        }
    };
    this.mapArrayReverse = function (valuesModels) {
        if (!valuesModels || _.isArray(valuesModels)) {
            return _.map(valuesModels, function (valuesModel) {
                return mapModel(valuesModel, mapperConfig, true);
            });
        }
    };
}

function mapModel(dataObj, map, reverse) {
    if (!(dataObj && map)) {
        return null;
    }
    var destObj = {};
    mapAndTransform(dataObj, destObj, map, reverse);
    runCustomProcessors(dataObj, destObj, map, reverse);
    insertDefaultValues(destObj, map, reverse);
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
        if (_.isFunction(transformer) && !_.isUndefined(value)) {
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

    mappingConfig.customProcessors.forEach(function (procdef, index) {
        var sourceObj = procdef[dataPath] ? _.get(dataObj, procdef[dataPath]) : dataObj;
        if (sourceObj) {
            var result = procdef.processor(sourceObj, reverse);
            if (result) {
                var assignPath = procdef[destPath];
                if (typeof result === 'object' || Array.isArray(result)) {
                    // the result is a complex type so we have to assign into it
                    if (assignPath) {
                        // when there's a destination path, assign only onto that path
                        if (!_.has(destObj, assignPath)) {
                            _.set(destObj, assignPath, Array.isArray(result) ? [] : {});
                        }
                        var targetObj = _.get(destObj, assignPath);
                        var setObj;
                        if ((!targetObj || Array.isArray(targetObj)) && Array.isArray(result)) {
                            setObj = _.concat(targetObj, result);
                        } else {
                            setObj = _.assign(targetObj, result);
                        }
                        _.set(destObj, assignPath, setObj);
                    } else {
                        // without a destination path, assign directly to the destination object
                        _.assign(destObj, result);
                    }
                } else {
                    // the result is a simple type so we can simply assign to it
                    // but in these cases a destination path must be provided
                    if (!assignPath) {
                        var msg = util.format(
                            'customProcessor[%d](%s) returned a "simple" type but had no destination path (in %s)',
                            index, (reverse ? 'reverse' : 'forward'), destPath);
                        throw new Error(msg);
                    }
                    _.set(destObj, assignPath, result);
                }
            }
        }
    });

    return destObj;
}

function insertDefaultValues(destObj, mappingConfig, reverse) {
    if (mappingConfig.defaultValues) {
        var defaults = mappingConfig.defaultValues[reverse ? 'mapReverse' : 'map'];
        _.forIn(defaults, function (defaultValue, destPath) {
            if (_.isUndefined(accessors.getValue(destObj, destPath))) {
                accessors.setValue(destObj, destPath,
                    (typeof defaultValue === 'function') ? defaultValue() : defaultValue);
            }
        });
    }
    return destObj;
}

module.exports = ModelMapper;
