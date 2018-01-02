/* jshint -W030 */
var _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect;

var modelMapper = require('../index');

describe('Base Object Usage', function () {

    var testMapper, myObj;

    var theirObj = {
        'Alpha': {
            'Alpha': 'first',
            'Omega': 'last'
        }
    };

    describe('with source mapping', function () {

        before(function () {
            testMapper = modelMapper.createMapper({
                baseObject: {
                    map: 'source',
                    mapReverse: 'source'
                }
            });

            myObj = {
                a: {
                    'first': 'Alpha',
                    'last': 'Omega'
                }
            };
        });

        it('can map source fields through to target', function () {
            var output = testMapper.map(theirObj);
            expect(output).to.deep.equal(theirObj);
        });

        it('can reverse map target fields through to source', function () {
            var output = testMapper.mapReverse(myObj);
            expect(output).to.deep.equal(myObj);
        });
    });

    describe('with function-base mappings', function () {

        before(function () {
            testMapper = modelMapper.createMapper({
                baseObject: {
                    map: function (source) {
                        return _.get(source, 'Alpha');
                    },
                    mapReverse: function (source) {
                        return _.set({}, 'Alpha', source);
                    }
                }
            });

            myObj = {
                'Alpha': 'first',
                'Omega': 'last'
            };
        });

        it('can map source fields through to target', function () {
            var output = testMapper.map(theirObj);
            expect(output).to.deep.equal(myObj);
        });

        it('can reverse map an target fields through to source', function () {
            var output = testMapper.mapReverse(myObj);
            expect(output).to.deep.equal(theirObj);
        });

    });

    describe('without baseObject mapping', function () {

        before(function () {
            testMapper = modelMapper.createMapper({
                dataMappings: {
                    'a.first': 'Alpha.Alpha'
                }
            });

            myObj = {
                a: {
                    'first': 'first'
                }
            };
        });

        it('do not propagate unmapped fields to target', function () {
            var output = testMapper.map(theirObj);
            expect(output).to.deep.equal(myObj);
        });

        it('do not propagate unmapped fields through to source', function () {
            var output = testMapper.mapReverse(myObj);
            expect(output).to.not.deep.equal(theirObj);
            expect(output).to.not.have.deep.property('Alpha.Omega');
            expect(output.Alpha.Alpha).to.equal('first');
        });
    });

});
