/* jshint -W030 */
var chai = require('chai'),
    expect = chai.expect;

var carMapper = require('./fixtures/composition/car-mapper'),
    ModelMapper = require('../lib/ModelMapper');

describe('Advanced ModelMapper Usage:', function () {

    describe('with composition', function () {
        var theirCarObj = {
            'Manufacture' : {
                'Name': 'Ford',
                'Model': 'Model T'
            },
            'Mechanical_Systems': {
                'Engine': {
                    'Volume': '177 cu.in',
                    'Horse_Power': 20
                }
            }
        };
        var myCarObj = {
            make: 'Ford',
            model: 'Model T',
            engine: {
                size: '177 cu.in',
                hp: 20
            }
        };

        it('can map with another mapper as a custom processor', function () {
            var myOutput = carMapper.map(theirCarObj);
            expect(myOutput).to.deep.equal(myCarObj);
        });

        it('can map reverse with another mapper as a custom processor', function () {
            var theirOutput = carMapper.mapReverse(myCarObj);
            expect(theirOutput).to.deep.equal(theirCarObj);
        });
    });

    describe('with arrays', function () {
        var arrayMapper = new ModelMapper({
            dataMappings: {
                'simpleArray': 'numbers'
            },
            dataTransforms: {
                'simpleArray': function (value, reverse) {
                    if (Array.isArray(value)) {
                        return value.map(function (item) {
                            return reverse ? item / 2 : item * 2;
                        });
                    }
                }
            },
            customProcessors: [
                {
                    targetModelPath: 'complexArray',
                    sourceModelPath: 'objects',
                    processor: function (sourceValue, reverse) {
                        if (Array.isArray(sourceValue)) {
                            return sourceValue.map(function (item) {
                                if (reverse) {
                                    return {
                                        bar: item.foo
                                    };
                                } else {
                                    return {
                                        foo: item.bar
                                    };
                                }
                            });
                        }
                    }
                }
            ]
        });
        var theirSimpleObj = {
            numbers: [1, 2, 3, 4]
        };
        var mySimpleObj = {
            simpleArray: [2, 4, 6, 8]
        };
        var theirComplexObj = {
            numbers: [1, 1, 2, 3, 5, 8],
            objects: [
                { bar: 1 },
                { bar: 2 },
                { bar: 4 },
                { bar: 8 }
            ]
        };
        var myComplexObj = {
            simpleArray: [2, 2, 4, 6, 10, 16],
            complexArray: [
                { foo: 1 },
                { foo: 2 },
                { foo: 4 },
                { foo: 8 }
            ]
        };

        it('can map simple array with transform', function () {
            var myOutput = arrayMapper.map(theirSimpleObj);
            expect(myOutput).to.deep.equal(mySimpleObj);
        });

        it('can reverse map simple array with transform', function () {
            var theirOutput = arrayMapper.mapReverse(mySimpleObj);
            expect(theirOutput).to.deep.equal(theirSimpleObj);
        });

        it('can map an array with a custom processor', function () {
            var myOutput = arrayMapper.map(theirComplexObj);
            expect(myOutput).to.deep.equal(myComplexObj);
        });

        it('can reverse map an array with a custom processor', function () {
            var theirOutput = arrayMapper.mapReverse(myComplexObj);
            expect(theirOutput).to.deep.equal(theirComplexObj);
        });
    });
});
