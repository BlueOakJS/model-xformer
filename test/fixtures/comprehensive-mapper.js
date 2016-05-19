var _ = require('lodash'),
    modelMapper = require('../../index');

var comprehensiveMapper = modelMapper.createMapper({
    baseObject: {
        map: function (source) {
            return (!_.isEmpty(source)) ? {
                _source: source
            } : {};
        }
    },
    dataMappings: {
        'a': 'Alpha',
        'o': 'Omega',
        'y': 'Yoga',
        'z': 'Zulu.Zipper'
    },
    dataTransforms: {
        'a': function (value, reverse) {
            return reverse ? value.toUpperCase() : value.toLowerCase();
        }
    },
    customProcessors: [
        {
            targetModelPath: 'x',
            sourceModelPath: 'Zulu',
            processor: function (value, reverse) {
                if (reverse) {
                    if (!Array.isArray(value)) {
                        return;
                    }
                    return {
                        Alice: value[0],
                        Bob: value[1] || null
                    };
                } else {
                    return [value.Alice, value.Bob || null];
                }
            }
        }
    ],
    defaultValues: {
        map: {
            't': tfault,
            'y': 'Savasana'
        },
        mapReverse: {
            'Zulu.Alice': 'foo',
            'Zulu.Bob': 'bar'
        }
    }
});

function tfault() {
    return 'Zulu Time!';
}

module.exports = comprehensiveMapper;
