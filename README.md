# ps-model-mapper

**Common utilities for bidirectionally mapping data between two models**

 If you need to map and transform data from one model (format) to another, this is the module for you!
 
Provide one JSON configuration that connects the two models, and use `ps-model-mapper` to interpret and apply that
configuration onto real data you provide in one format to output the other.  

## configuration

Mapping from one model to the other is done based on a configuration provided.

example:
```javascript
var myMappingConfig = {
    dataMappings: {
        // by default, field data is simply mapped from one to the other
        'targetModel.path.to.field1': 'sourceModel.path.to.comparible-field1',
        // a transform function can be provided (see below) to handle any formatting nuances
        'targetModel.path.to.field2': 'sourceModel.path.to.comparible-field2',
        // dataMappings paths may uses the extended path patterns for picking specific items out of an array, e.g.:
        'targetModel.somethingSpecial' : 'sourceModel.path.to.array[@_type=Special]'
    },
    dataTransforms: {
        // N.B.: the dataTransforms keys MUST also be keys in the dataMappings object
        'targetModel.path.to.field1': function transformFnToCall(fieldValue, reverse) { /* ... */ }
    }
    customProcessors: [
        // custom processors are called in the order they're defined
        {
            // customProcessors paths may use the standard path patterns supported by lodash get, set, etc.
            targetModelPath: 'targetModel.path.to.destination',
            sourceModelPath: 'sourceModel.path.to.whatever.is.needed.to.do.this.mapping',
            processor: function fnToCallForCustomProcessing(sourceValue, reverse) { /* ... */ }
        },
        {
            // if either the targetModelPath or sourceModelPath is not provided, the whole data object will be used
            // e.g.: in this case, when the processor function is called going "forward",
            // `sourceValue` will be the entire source object, and when called for "reverse" processing,
            // the whole target object will be passed in
            targetModelPath: 'targetModel.path.to.something',
            processor: function anotherFnForCustomProcessing(sourceValue, reverse) { /* ... */ }
        },
        /* ... */
        {
            /* ... */
        }
    ],
    defaultValues: {
        // provide default values to use when a mapping fails to produce a value for the named fields,
        // i.e. when the path in the key is 'undefined' (if there's a value, including 'null', it won't be applied)
        // default values are added to the mapped object after all mappings/transforms and custom processors are done
        map: {
            // in case the data object didn't have the source data to map,
            // you can provide default values for fields that could be set from elsewhere
            'targetModel.path.to.field1': 'my default value',
            // you can also just fill in additional data that is always the same
            'targetModel.somethingSpecial.reallySpecial': true
        },
        mapReverse: {
            // the keys of this object are the keys of the mapped object when the mapper is run in reverse
            // i.e. they match to the model described by the dataMappings values
            'sourceModel.path.to.array[@_type=Special]': {
                type: 'Special',
                reallySpecial: false
            },
            // you can call a function too, but it won't get the either the data object or the mapped object as context
            'sourceModel.timeCreated': Date.now
        }
    }
};
```

## direction

Conceptually, the "normal", or **forward**, mapping assumes the object to be mapped is in the format defined by the
`dataMappings` field's "values", and produces an object in the format defined by the `dataMappings` field's keys.

Thus, in a similar way, the **reverse** mapping assumes that the object to be mapped is in the format defined by the
`dataMappings` field's keys, and produces an object in the format defined by the `dataMappings` field's "values".

## use

```javascript
var modelMapper = require('ps-model-mapper');

var myMappingConfig = { /* see above ... */ };
var myMapper = modelMapper.createMapper(myMappingConfig);

/* ... */

// assuming our "public" model is the one in the `dataMappings` field's keys ...
var publicModelInstance = myMapper.map(privateModelInstance);
var differentPrivateModelInstance = myMapper.mapReverse(anotherPublicModelInstance);

```

## reuse

Often times it's handy to build up complex mappings from smaller mappings.
A good example of this is object composition, e.g. a "`Car` _has a_ `Engine`" relationship.
In this case, you can reuse the engine mapper to provide the mapping for that element of the car's mapping.

**engine-mapper.js**
```javascript
var modelMapper = require('ps-model-mapper');
var engineMappingConfig = { /* ... */ };
module.exports = modelMapper.createMapper(engineMappingConfig);
``` 

**car-mapper.js**
```javascript
var modelMapper = require('ps-model-mapper');
var engineMapper = require('./engine-mapper');
var carMappingConfig = {
    /* ... */
    customProcessors: [
        /* ... */
        {
            targetModelPath: 'engine',
            sourceModelPath: 'Mechanical_Systems.Engine',
            // (the `map` function has an optional second parameter `reverse` that allows it to run bidirectionally)
            processor: engineMapper.map
        }
        /* ... */
    ],
    /* ... */
};
module.exports = modelMapper.createMapper(carMappingConfig);
```

Then, from somewhere else in your code:
```javascript
var carMapper = require('./mappers/car-mapper');
/* ... */
var publicModelInstance = carMapper.map(privateModelInstance);
var differentPrivateModelInstance = carMapper.mapReverse(anotherPublicModelInstance);
```
