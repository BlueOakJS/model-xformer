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
        'forward.model.path.to.field1': 'reverse.model.path.to.comparible-field1',
        // a transform function can be provided (see below) to handle any formatting nuances
        'forward.model.path.to.field2': 'reverse.model.path.to.comparible-field2'
    },
    dataTransforms: {
        // N.B.: the dataTransforms keys MUST also be keys in the dataMappings object
        'forward.model.path.to.field1': function transformFnToCall(fieldValue, reverse) { /* ... */ }
    }
    customProcessors: [
        // custom processors are called in the order they're defined
        {
            forwardModelPath: 'forward.model.path.to.something',
            reverseModelPath: 'reverse.model.path.to.whatever.is.needed.to.do.this.mapping',
            processor: function fnToCallForCustomProcessing(sourceModel, reverse) { /* ... */ }
        },
        /* ... */
        {
            /* ... */
        }
    ]
};
```

## direction

Conceptually, the **forward** mapping assumes the object to be mapped is in the format defined by the `dataMappings`
field's "values", and produces an object in the format defined by the `dataMappings` field's keys.
Thus, in a similar way, the **reverse** mapping assumes that the object to be mapped is in the format defined by the
`dataMappings` field's keys, and produces an object in the format defined by the `dataMappings` field's "values".

## usage

```javascript
var modelMapper = require('ps-model-mapper');

var myMappingConfig = { /* see above ... */ };
var myMapper = modelMapper.createMapper(myMappingConfig);

/* ... */

// assuming our "public" model is the one in the `dataMappings` field's keys ...
var publicModelInstance = myMapper.mapForward(privateModelInstance);
var differentPrivateModelInstance = myMapper.mapReverse(anotherPublicModelInstance);

```
