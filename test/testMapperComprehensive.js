/* jshint -W030 */
var chai = require('chai'),
    _ = require('lodash'),
    expect = chai.expect,
    testMapper = require('./fixtures/comprehensive-mapper');

var mapDefaults = testMapper.config.defaultValues.map,
    mapReverseDefaults = testMapper.config.defaultValues.mapReverse;

describe('Comprehensive ModelMapper Usage:', function () {

    describe('should return only the default values', function () {

        var myDefaultsOnly = {
            t: mapDefaults.t(),
            y: mapDefaults.y
        };
        var theirDefaultsOnly = {
            'Zulu': {
                'Alice': mapReverseDefaults['Zulu.Alice'],
                'Bob': mapReverseDefaults['Zulu.Bob']
            }
        };

        it('when map input is an empty object', function () {
            expect(testMapper.map({})).to.deep.equal(myDefaultsOnly);
        });

        it('when mapReverse input is an empty object', function () {
            expect(testMapper.mapReverse({})).to.deep.equal(theirDefaultsOnly);
        });

        it('when map input an object that doesn\'t match', function () {
            var theirObj = {
                alice: 'foo',
                bob: 'bar',
                yoga: 0
            };
            var myObj = _.merge({}, {_source: theirObj}, myDefaultsOnly);

            expect(testMapper.map(theirObj)).to.deep.equal(myObj);
        });

        it('when mapReverse input an object that doesn\'t match', function () {
            expect(testMapper.mapReverse({
                i: 7,
                j: 8,
                k: 9
            })).to.deep.equal(theirDefaultsOnly);
        });
    });

    describe('should prioritize mapped values over defaults', function () {

        var theirInputObj = {
            'Alpha': 'FIRST',
            'Omega': 'LAST',
            'Zulu': {
                'Carol': 'baz'
            }
        };
        var myOutputObj = _.merge({
            'a': 'first',
            'o': theirInputObj.Omega,
            't': mapDefaults.t(),
            'x': [
                undefined,
                null
            ],
            'y': 'Savasana'
        }, {_source: theirInputObj});

        var theirOutputInputObj = {
            'Alpha': 'FIRST',
            'Omega': myOutputObj.o,
            'Yoga': myOutputObj.y,
            'Zulu': {
                'Alice': mapReverseDefaults['Zulu.Alice'],
                'Bob': null
            }
        };

        it('when mapping forward', function () {
            var mapped = testMapper.map(theirInputObj);
            expect(mapped).to.deep.equal(myOutputObj);
        });

        it('and back again', function () {
            var mapped = testMapper.mapReverse(myOutputObj);
            expect(mapped).to.deep.equal(theirOutputInputObj);
        });
    });
});
