/* jshint -W030 */
var _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect;

var modelMapper = require('../index');

describe('Custom Processors', function () {

    var testMapper, myArr, myObj, myInt, myStr;

    var theirArr = {
        'Alpha': [1, 2, 3]
    };
    var theirObj = {
        'Alpha': {
            'Alpha': 'first',
            'Omega': 'last'
        }
    };
    var theirInt = {
        'Alpha': 5
    };
    var theirStr = {
        'Alpha': 'WORD'
    };

    describe('with both paths provided', function () {

        before(function () {
            testMapper = modelMapper.createMapper({
                customProcessors: [{
                    targetModelPath: 'a',
                    sourceModelPath: 'Alpha',
                    processor: multiProcessor
                }]
            });

            myArr = {
                a: [3, 2, 1]
            };
            myObj = {
                a: {
                    'first': 'Alpha',
                    'last': 'Omega'
                }
            };
            myInt = {
                a: 10
            };
            myStr = {
                a: 'word'
            };
        });

        it('can map an array to an array', function () {
            var output = testMapper.map(theirArr);
            expect(output).to.deep.equal(myArr);
        });

        it('can reverse map an array to an array', function () {
            var output = testMapper.mapReverse(myArr);
            expect(output).to.deep.equal(theirArr);
        });

        it('can map an object to an object', function () {
            var output = testMapper.map(theirObj);
            expect(output).to.deep.equal(myObj);
        });

        it('can reverse map an object to an object', function () {
            var output = testMapper.mapReverse(myObj);
            expect(output).to.deep.equal(theirObj);
        });

        it('can map an int to an int', function () {
            var output = testMapper.map(theirInt);
            expect(output).to.deep.equal(myInt);
        });

        it('can reverse map an int to an int', function () {
            var output = testMapper.mapReverse(myInt);
            expect(output).to.deep.equal(theirInt);
        });

        it('can map a string to a string', function () {
            var output = testMapper.map(theirStr);
            expect(output).to.deep.equal(myStr);
        });

        it('can reverse map a string to a string', function () {
            var output = testMapper.mapReverse(myStr);
            expect(output).to.deep.equal(theirStr);
        });
    });

    describe('with only one path provided', function () {

        before(function () {
            testMapper = modelMapper.createMapper({
                customProcessors: [{
                    sourceModelPath: 'Alpha',
                    processor: multiProcessor
                }]
            });

            myArr = [3, 2, 1];
            myObj = {
                'first': 'Alpha',
                'last': 'Omega'
            };
            myInt = 10;
            myStr = 'word';
        });

        it('can map an array in an object to an array-like object', function () {
            var output = testMapper.map(theirArr);
            expect(output).to.be.an('object');
            _.forEach(output, function (val, key) {
                expect(val).to.equal(myArr[key]);
            });
        });

        it('can map an array to an array in an object', function () {
            var output = testMapper.mapReverse(myArr);
            expect(output).to.deep.equal(theirArr);
        });

        it('can map a nested object to a top-level object', function () {
            var output = testMapper.map(theirObj);
            expect(output).to.deep.equal(myObj);
        });

        it('can map a top-level object to a nested object', function () {
            var output = testMapper.mapReverse(myObj);
            expect(output).to.deep.equal(theirObj);
        });

        it('cannot map an int field to an int', function () {
            expect(testMapper.map.bind(null, theirInt)).to.throw(Error);
        });

        it('can map an int to an int field', function () {
            var output = testMapper.mapReverse(myInt);
            expect(output).to.deep.equal(theirInt);
        });

        it('cannot map a string field to a string', function () {
            expect(testMapper.map.bind(null, theirStr)).to.throw(Error);
        });

        it('can map a string to a string field', function () {
            var output = testMapper.mapReverse(myStr);
            expect(output).to.deep.equal(theirStr);
        });
    });

    describe('when merging is needed', function () {

        var sourceArr, sourceObj, sourceInt, sourceStr;

        before(function () {
            testMapper = modelMapper.createMapper({
                customProcessors: [
                    {
                        targetModelPath: 'x',
                        sourceModelPath: 'Alpha',
                        processor: multiProcessor
                    },
                    {
                        targetModelPath: 'x',
                        sourceModelPath: 'Beta',
                        processor: multiProcessor
                    }
                ]
            });

            sourceArr = _.assign({}, theirArr, {
                'Beta': [7, 8, 9]
            });
            sourceObj = _.assign({}, theirObj, {
                'Beta': {
                    'version': 1,
                    'date': '2016-05-07'
                }
            });
            sourceInt = _.assign({}, theirInt, {
                'Beta': 1
            });
            sourceStr = _.assign({}, theirStr, {
                'Beta': 'ONE'
            });

            myArr = {
                x: [3, 2, 1, 9, 8, 7]
            };
            myObj = {
                x: {
                    'first': 'Alpha',
                    'last': 'Omega',
                    '1': 'version',
                    '2016-05-07': 'date'
                }
            };
            myInt = {
                x: 2
            };
            myStr = {
                x: 'one'
            };
        });

        it('can merge arrays in the output', function () {
            var output = testMapper.map(sourceArr);
            expect(output).to.deep.equal(myArr);
        });

        it('can merge objects in the output', function () {
            var output = testMapper.map(sourceObj);
            expect(output).to.deep.equal(myObj);
        });

        it('can replace previously set ints in the output', function () {
            var output = testMapper.map(sourceInt);
            expect(output).to.deep.equal(myInt);
        });

        it('can replace previously set strings in the output', function () {
            var output = testMapper.map(sourceStr);
            expect(output).to.deep.equal(myStr);
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
