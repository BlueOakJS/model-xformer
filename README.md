# ps-model-mapper

**Common utilities for bidirectionally mapping data between two models**

 If you need to map and transform data from one model (format) to another, this is the module for you!
 
Provide one JSON configuration that connects the two models, and use `ps-model-mapper` to interpret and apply that
configuration onto real data you provide in one format to output the other.  

## configuration

Mapping from one model to the other is done based on a configuration provided.

example:
```javascript
    {
        data: {
            'forward.model.path.to.field1': 'reverse.model.path.to.comparible-field1'
            'forward.model.path.to.field2': 'reverse.model.path.to.comparible-field2'
        },
        transforms: {
            // N.B.: the transforms keys MUST also be keys in the data object
            'forward.model.path.to.field1': function transformFnToCall(fieldValue, reverse) { /* ... */ }
        }
        conditionals: [
            {
                forwardModelPath: 'forward.model.path.to.something',
                reverseModelPath: 'reverse.model.path.to.whatever.is.needed.to.do.this.mapping',
                processor: function fnToCallForConditionalProcessing(sourceModel, reverse) { /* ... */ }
            }
        ]
    }
```

## direction

Conceptually, the **forward** mapping assumes the object to be mapped is in the format defined by the `data` field's 
"values", and produces an object in the format defined by the `data` field's keys.
Thus, in a similar way, the **reverse** mapping assumes that the object to be mapped is in the format defined by the
`data` field's keys, and produces an object in the format defined by the `data` field's "values".
