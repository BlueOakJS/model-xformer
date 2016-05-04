/* jshint -W030 */
var chai = require('chai'),
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
            expect(testMapper.map({
                alice: 'foo',
                bob: 'bar',
                yoga: 0
            })).to.deep.equal(myDefaultsOnly);
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
        var myOutputObj = {
            'a': 'first',
            'o': theirInputObj.Omega,
            't': mapDefaults.t(),
            'x': [
                undefined,
                null
            ],
            'y': 'Savasana'
        };
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
