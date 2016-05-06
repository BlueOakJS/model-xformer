/* jshint -W030 */
var _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect;

var modelMapper = require('../index');

describe('Custom Processors', function () {

    var processorConfig, processorOnlyMapper;

    var theirArray = {
        'Alpha': [1, 2, 3]
    };
    var myArray = {
        a: [3, 2, 1]
    };

    var theirObject = {
        'Alpha': {
            'Alpha': 'first',
            'Omega': 'last'
        }
    };
    var myObject = {
        a: {
            'first': 'Alpha',
            'last': 'Omega'
        }
    };

    var theirInt = {
        'Alpha': 5
    };
    var myInt = {
        a: 10
    };

    var theirString = {
        'Alpha': 'WORD'
    };
    var myString = {
        a: 'word'
    };

    describe('with both paths provided', function () {

        before(function () {
            processorConfig = {
                targetModelPath: 'a',
                sourceModelPath: 'Alpha',
                processor: multiProcessor
            };
            processorOnlyMapper = modelMapper.createMapper({
                customProcessors: [processorConfig]
            });
        });

        it('can map an array to an array', function () {
            var output = processorOnlyMapper.map(theirArray);
            expect(output).to.deep.equal(myArray);
        });

        it('can reverse map an array to an array', function () {
            var output = processorOnlyMapper.mapReverse(myArray);
            expect(output).to.deep.equal(theirArray);
        });

        it('can map an object to an object', function () {
            var output = processorOnlyMapper.map(theirObject);
            expect(output).to.deep.equal(myObject);
        });

        it('can reverse map an object to an object', function () {
            var output = processorOnlyMapper.mapReverse(myObject);
            expect(output).to.deep.equal(theirObject);
        });

        it('can map an int to an int', function () {
            var output = processorOnlyMapper.map(theirInt);
            expect(output).to.deep.equal(myInt);
        });

        it('can reverse map an int to an int', function () {
            var output = processorOnlyMapper.mapReverse(myInt);
            expect(output).to.deep.equal(theirInt);
        });

        it('can map a string to a string', function () {
            var output = processorOnlyMapper.map(theirInt);
            expect(output).to.deep.equal(myInt);
        });

        it('can reverse map a string to a string', function () {
            var output = processorOnlyMapper.mapReverse(myInt);
            expect(output).to.deep.equal(theirInt);
        });
    });
});

function multiProcessor(value, reverse) {
    if (Array.isArray(value)) {
        // ALWAYS reverse the array
        return value.reduceRight(function (items, item) {
            items.push(item);
            return items;
        }, []);
    } else if (typeof value === 'object') {
        // ALWAYS swap the keys and values
        var result = {};
        _.forEach(value, function (val, key) {
            result[val] = key;
        });
        return result;
    } else if (typeof value === 'number') {
        return (reverse ? value / 2 : value * 2);
    } else if (typeof value === 'string') {
        return (reverse ? value.toUpperCase() : value.toLowerCase());
    } else {
        return value;
    }
}
