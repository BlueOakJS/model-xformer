/* jshint -W030 */
var chai = require('chai'),
    expect = chai.expect;

var ModelMapper = require('../lib/ModelMapper');

describe('ModelMapper', function () {
    var inputObject, myMapper;

    describe('.map()', function () {

        describe('should return null', function () {
            var nullMapper;

            before(function () {
                myMapper = new ModelMapper({
                    dataMappings: {
                        'first': 'a.b.c'
                    }
                });
                nullMapper = new ModelMapper();
                inputObject = {};
            });

            it('when source is undefined', function () {
                var res = myMapper.map(undefined);
                expect(res).to.be.null;
            });

            it('when source is null', function () {
                var res = myMapper.map(null);
                expect(res).to.be.null;
            });

            it('when mapping config is undefined', function () {
                var res = nullMapper.map(inputObject);
                expect(res).to.be.null;
            });
        });

        describe('should return an empty object', function () {
            var emptyMapper;

            before(function () {
                myMapper = new ModelMapper({
                    dataMappings: {
                        'first': 'a.b.c'
                    }
                });
                emptyMapper = new ModelMapper({});
                inputObject = {
                    x: {
                        y: {
                            z: 'foo'
                        }
                    }
                };
            });

            it('when mapping config is empty', function () {
                var res = emptyMapper.map(inputObject);
                expect(res).to.be.empty;
            });

            it('when there is no dataMappings match', function () {
                var res = myMapper.map(inputObject);
                expect(res).to.be.empty;
            });
        });

        describe('should return a mapped object', function () {

            it('when `dataMappings` matches the input', function () {
                myMapper = new ModelMapper({
                    dataMappings: {
                        'b': 'a.b',
                        'a.b': 'b'
                    }
                });
                inputObject = {
                    a: {
                        b: 5
                    },
                    b: 'universe'
                };
                var expectValue = {
                    b: 5,
                    a: {
                        b: 'universe'
                    }
                };

                expect(myMapper.map(inputObject)).to.deep.equal(expectValue);
            });

            it('when there\'s a dataTransforms section', function () {
                myMapper = new ModelMapper({
                    dataMappings: {
                        'c': 'a.b'
                    },
                    dataTransforms: {
                        'c': function (value, reverse) {
                            if (!reverse) {
                                return value * 2;
                            }
                        }
                    }
                });
                inputObject = {
                    a: {
                        b: 3
                    }
                };
                var expectValue = {
                    c: 6
                };

                expect(myMapper.map(inputObject)).to.deep.equal(expectValue);
            });
        });
    });

    describe('.mapReverse()', function () {

        describe('should return a mapped object', function () {

            it('when `dataMappings` matches the input', function () {
                myMapper = new ModelMapper({
                    dataMappings: {
                        'b': 'a.b',
                        'a.b': 'b'
                    }
                });
                inputObject = {
                    a: {
                        b: 5
                    },
                    b: 'universe'
                };
                var expectValue = {
                    a: {
                        b: 'universe'
                    },
                    b: 5
                };

                expect(myMapper.mapReverse(inputObject)).to.deep.equal(expectValue);
            });

            it('when there\'s a dataTransforms section', function () {
                myMapper = new ModelMapper({
                    dataMappings: {
                        'c': 'a.b'
                    },
                    dataTransforms: {
                        'c': function (value, reverse) {
                            if (reverse) {
                                return value / 2;
                            }
                        }
                    }
                });
                inputObject = {
                    c: 6
                };
                var expectValue = {
                    a: {
                        b: 3
                    }
                };

                expect(myMapper.mapReverse(inputObject)).to.deep.equal(expectValue);
            });
        });
    });

});
