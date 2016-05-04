/* jshint -W030 */
var chai = require('chai'),
    expect = chai.expect;

var accessor = require('../lib/accessors');

describe('accessors', function () {

    describe('getValue...', function () {
        describe('when getting by element', function () {
            it('retrieves the value (string) if it exists', function () {
                var obj = {
                    a: 'hello',
                    b: {
                        a: 'world'
                    }
                };

                var path = 'a';

                expect(accessor.getValue(obj, path)).to.equal('hello');
            });

            it('retrieves the value (array) if it exists', function () {
                var obj = {
                    a: [1, 2, 3]
                };

                var path = 'a';

                expect(accessor.getValue(obj, path)).to.deep.equal([1, 2, 3]);
            });

            it('retrieves the value (object) if it exists', function () {
                var subObj = {
                    b: 'hello',
                    c: [1, 2, 3]
                };

                var obj = {
                    a: subObj
                };

                var path = 'a';

                expect(accessor.getValue(obj, path)).to.equal(subObj);
            });

            it('returns undefined if the value does not exist', function () {
                var obj = {
                    b: 'a',
                    c: {
                        d: 'a',
                        a: 'hello'
                    },
                    '@a': 'world'
                };

                var path = 'a';

                expect(accessor.getValue(obj, path)).to.be.undefined;
            });
        });

        describe('getting by index', function () {
            it('retrieves the value (number) if it exists', function () {
                var path = 'b[1]';
                var obj = {
                    a: {
                        b: [1, 2, 3]
                    },
                    c: 'hi',
                    b: [4, 5, 6]
                };

                expect(accessor.getValue(obj, path)).to.equal(5);
            });

            it('retrieves the value (array) if it exists', function () {
                var path = 'b[0]';
                var obj = {
                    a: true,
                    b: [
                        [1, 2, 3],
                        [4, 5, 6],
                        [7, 8, 9]
                    ],
                    c: {
                        b: 5
                    }
                };

                expect(accessor.getValue(obj, path)).to.deep.equal([1, 2, 3]);
            });

            it('retrieves the value (object) if it exists', function () {
                var path = 'b[2]';
                var subObj = {
                    b: [7, 8, 9]
                };

                var obj = {
                    b: [
                        {
                            b: [1, 2, 3]
                        },
                        {
                            b: [4, 5, 6]
                        },
                        subObj
                    ],
                    a: {
                        b: 'hello'
                    }
                };

                expect(accessor.getValue(obj, path)).to.equal(subObj);
            });

            it('returns undefined if the element is not an array (string)', function () {
                var path = 'b[5]';
                var obj = {
                    b: 'hello there'
                };

                expect(accessor.getValue(obj, path)).to.be.undefined;
            });

            it('returns undefined if the element is not an array (object)', function () {
                var path = 'b[2]';
                var obj = {
                    b: {
                        a: 1,
                        b: 2,
                        c: 3
                    }
                };

                expect(accessor.getValue(obj, path)).to.be.undefined;
            });
        });

        describe('getting by predicate', function () {
            it('returns the value (object) if it exists', function () {
                var path = 'c[d=e]';
                var subObj = {
                    d: 'e',
                    c: 'hello'
                };

                var obj = {
                    a: {
                        c: [{
                            d: 'e'
                        }]
                    },
                    c: [
                        {
                            d: ['e']
                        },
                        subObj
                    ]
                };

                expect(accessor.getValue(obj, path)).to.equal(subObj);
            });

            it('returns undefined if the predicate is not satisifed', function () {
                var path = 'c[d=e]';
                var obj = {
                    a: {
                        c: [{
                            d: 'e'
                        }]
                    },
                    c: [
                        {
                            d: ['e']
                        },
                        {
                            d: 'a'
                        }
                    ]
                };

                expect(accessor.getValue(obj, path)).to.be.undefined;
            });

            it('returns undefined if the element is not an array', function () {
                var path = 'c[d=e]';
                var obj = {
                    a: {
                        c: [{
                            d: 'e'
                        }]
                    },
                    c: {
                        d: 'e',
                        a: true
                    }
                };

                expect(accessor.getValue(obj, path)).to.be.undefined;
            });

            it('return appropriate value when predicate key is nested', function () {
                var path = 'c[d_e=f]';
                var subObj = {
                    d: {
                        e: 'f'
                    },
                    b: 'hello'
                };
                var obj = {
                    c: [
                        subObj,
                        {
                            d: 'f'
                        }
                    ]
                };

                expect(accessor.getValue(obj, path)).to.equal(subObj);
            });
        });

        describe('edge cases and errors', function () {
            it('returns undefined if the object is not defined', function () {
                var path = 'a.b.c';
                var obj = null;

                expect(accessor.getValue(obj, path)).to.be.undefined;
            });

            it('returns undefined if the path is not defined', function () {
                var path = null;
                var obj = {
                    a: 'hello',
                    b: ['world', 'whats', 'up']
                };

                expect(accessor.getValue(obj, path)).to.be.undefined;
            });

            it('returns the value in the extreme nested case', function () {
                // NOTE: The purpose of this test is to test that each style of
                //       retrieval (element, index, predicate) both precedes and
                //       follows each other style.
                var path = 'a.b[1].c[d=e].f.g[h=i].j[2].k';
                var obj = {
                    a: {
                        b: [
                            {
                                c: [

                                ]
                            },
                            {
                                c: [
                                    {
                                        d: 'e',
                                        f: {
                                            g: [
                                                {
                                                    h: 'ii'
                                                },
                                                {
                                                    h: 'i',
                                                    j: [
                                                        {
                                                            k: 'nope'
                                                        },
                                                        {
                                                            k: 'you lose'
                                                        },
                                                        {
                                                            k: 'waldo'
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        d: ['e']
                                    }
                                ]
                            }
                        ]
                    },
                    b: 'a',
                    aa: 5
                };

                expect(accessor.getValue(obj, path)).to.equal('waldo');
            });

            it('subpaths where components are more than one character are value', function () {
                // NOTE: This test verifies that a bug that existed during development does
                //       not reoccur. There was a case where the pattern used to extract parts
                //       of the sub-path only worked when the parts were one character long.
                var path = 'abc.def[0].ghi[jkl=mno].pqr.stu[vwx=yza].abb[0].ccd';

                var obj = {
                    abc: {
                        def: [
                            {
                                ghi: [
                                    {
                                        jkl: 'mno',
                                        pqr: {
                                            stu: [
                                                {
                                                    vwx: 'ii'
                                                },
                                                {
                                                    vwx: 'yza',
                                                    abb: [
                                                        {
                                                            ccd: 'marco'
                                                        },
                                                        {
                                                            ccd: 'you lose'
                                                        },
                                                        {
                                                            ccd: 'nope'
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        d: ['e']
                                    }
                                ]
                            },
                            {
                                ghi: [

                                ]
                            }
                        ]
                    },
                    b: 'a',
                    aa: 5
                };

                expect(accessor.getValue(obj, path)).to.equal('marco');
            });
        });
    });

    describe('setValue...', function () {
        describe('setting by element', function () {
            it('when the path exists', function () {
                var path = 'a';
                var obj = {
                    a: 5,
                    b: {
                        a: [1, 2, 3]
                    }
                };
                var value = 'hello';

                expect(accessor.setValue(obj, path, value)).to.equal(obj);
                expect(obj.a).to.equal(value);
            });

            it('when the path does not exist', function () {
                var path = 'a';
                var obj = {
                    b: {
                        a: [1, 2, 3]
                    }
                };
                var value = 'world';

                expect(accessor.setValue(obj, path, value)).to.equal(obj);
                expect(obj.a).to.equal(value);
            });

            it('setting objects are merged with present objects', function () {
                var path = 'a';
                var obj = {
                    a: {
                        b: 'hi there'
                    }
                };
                var value = {
                    c: 'how',
                    d: 'are',
                    e: [1, 2, 3],
                    f: {
                        g: 'you?'
                    }
                };
                var expectValue = {
                    b: 'hi there',
                    c: 'how',
                    d: 'are',
                    e: [1, 2, 3],
                    f: {
                        g: 'you?'
                    }
                };

                expect(accessor.setValue(obj, path, value)).to.equal(obj);
                expect(obj.a).to.deep.equal(expectValue);
            });
        });

        describe('setting by index', function () {
            it('when the path exists', function () {
                var path = 'b[1]';
                var obj = {
                    a: {
                        b: [1, 2, 3]
                    },
                    b: [true, false]
                };
                var value = [1, 2, 3];

                expect(accessor.setValue(obj, path, value)).to.equal(obj);
                expect(obj.b[1]).to.equal(value);
            });

            describe('when the path does not exist', function () {
                it('because of too few elements', function () {
                    var path = 'b[2]';
                    var obj = {
                        b: ['hello']
                    };
                    var value = 'world';

                    expect(accessor.setValue(obj, path, value)).to.equal(obj);
                    expect(obj.b[2]).to.equal(value);
                });

                it('because the element does not exist', function () {
                    var path = 'b[3]';
                    var obj = {};
                    var value = 'hi';

                    expect(accessor.setValue(obj, path, value)).to.equal(obj);
                    expect(obj.b[3]).to.equal(value);
                });

                it('does not permute object if index is not integer', function () {
                    var path = 'a[f]';
                    var obj = {
                        a: {
                            f: 'no'
                        }
                    };
                    var value = 'way';
                    var expectValue = {
                        a: {
                            f: 'no'
                        }
                    };

                    expect(accessor.setValue(obj, path, value)).to.deep.equal(expectValue);
                });
            });
        });

        describe('setting by predicate', function () {
            it('when the path exists', function () {
                var path = 'a[b=c]';
                var obj = {
                    a: [
                        {
                            b: {
                                b: 'c'
                            }
                        },
                        {
                            b: 'c'
                        }
                    ]
                };
                var value = {
                    c: 'hey',
                    d: [1, 2, 3]
                };
                var expectValue = {
                    b: 'c',
                    c: 'hey',
                    d: [1, 2, 3]
                };

                expect(accessor.setValue(obj, path, value)).to.equal(obj);
                expect(obj.a[1]).to.deep.equal(expectValue);
            });

            it('when the path does not exist', function () {
                var path = 'a[b=d]';
                var obj = {};
                var value = {
                    c: 'waldo',
                    d: {
                        e: [4, 5, 6]
                    }
                };
                var expectValue = {
                    b: 'd',
                    c: 'waldo',
                    d: {
                        e: [4, 5, 6]
                    }
                };

                expect(accessor.setValue(obj, path, value)).to.equal(obj);
                expect(obj.a[0]).to.deep.equal(expectValue);
            });

            it('when the predicate is not satisfied', function () {
                var path = 'a[c=e]';
                var obj = {
                    c: 'e',
                    a: [
                        {
                            c: 'f'
                        },
                        {
                            c: 'g'
                        }
                    ]
                };
                var value = {
                    first: 'second'
                };
                var expectValue = {
                    c: 'e',
                    first: 'second'
                };

                expect(accessor.setValue(obj, path, value)).to.equal(obj);
                expect(obj.a[2]).to.deep.equal(expectValue);
            });

            it('when the element is not an array', function () {
                var path = 'a[f=g]';
                var obj = {
                    f: 'g',
                    a: {
                        f: 'h'
                    }
                };
                var value = {
                    who: 'isonfirst'
                };
                var expectValue = {
                    f: 'g',
                    who: 'isonfirst'
                };

                expect(accessor.setValue(obj, path, value)).to.equal(obj);
                expect(obj.a[1]).to.deep.equal(expectValue);
            });

            it('does not permute object if value is not an object', function () {
                var path = 'a[f=g]';
                var obj = {
                    f: 'g',
                    a: [{
                        f: 'g'
                    }]
                };
                var value = 5;
                var expectValue = {
                    f: 'g',
                    a: [{
                        f: 'g'
                    }]
                };

                expect(accessor.setValue(obj, path, value)).to.deep.equal(expectValue);
                expect(obj.a[0]).to.deep.equal({ f: 'g' });
            });

            describe('predicate matching child object values works', function () {
                it('when the matching object exists', function () {
                    var path = 'a[f_g=hello]';
                    var obj = {
                        a: [
                            {
                                f: {
                                    g: 'nope'
                                }
                            },
                            {
                                f: {
                                    g: 'hello'
                                }
                            }
                        ]
                    };
                    var value = {
                        h: 'it works!'
                    };

                    expect(accessor.setValue(obj, path, value)).to.equal(obj);
                    expect(obj.a[1]).to.deep.equal({ f: { g: 'hello' }, h: 'it works!' });
                });

                it('when the matching object does not exist', function () {
                    var path = 'a[f_g=hello]';
                    var obj = {};
                    var value = {
                        h: 'it works!'
                    };

                    expect(accessor.setValue(obj, path, value)).to.equal(obj);
                    expect(obj.a[0]).to.deep.equal({ f: { g: 'hello' }, h: 'it works!' });
                });
            });
        });

        describe('sets the value in the extreme nested case', function () {
            it('when the path exists', function () {
                var path = 'a.b[1].c[d=e].f.g[h=i].j[2].k';
                var obj = {
                    a: {
                        b: [
                            {
                                c: []
                            },
                            {
                                c: [
                                    {
                                        d: 'e',
                                        f: {
                                            g: [
                                                {
                                                    h: 'ii'
                                                },
                                                {
                                                    h: 'i',
                                                    j: [
                                                        {
                                                            k: 'nope'
                                                        },
                                                        {
                                                            k: 'you lose'
                                                        },
                                                        {
                                                            k: 'waldo'
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        d: ['e']
                                    }
                                ]
                            }
                        ]
                    },
                    b: 'a',
                    aa: 5
                };
                var value = 5;

                expect(accessor.setValue(obj, path, value)).to.equal(obj);
                expect(obj.a.b[1].c[0].f.g[1].j[2].k).to.equal(value);
            });

            it('when the path does not exist', function () {
                var path = 'a.b[1].c[d=e].f.g[h=i].j[2].k';
                var obj = {};
                var value = 'hello world';
                expect(accessor.setValue(obj, path, value)).to.equal(obj);
                expect(obj.a.b[1].c[0].f.g[0].j[2].k).to.equal(value);
                expect(obj.a.b[1].c[0].d).to.equal('e');
                expect(obj.a.b[1].c[0].f.g[0].h).to.equal('i');
            });
        });

        describe('edge cases and errors', function () {
            it('does not permute object if path does not exist', function () {
                var path = null;
                var obj = {
                    a: [1, 2, 3],
                    b: 'hello'
                };
                var expectValue = {
                    a: [1, 2, 3],
                    b: 'hello'
                };
                var value = [3, 4, 5];

                expect(accessor.setValue(obj, path, value)).to.deep.equal(expectValue);
            });
        });

        it('returns a new object if object does not exist', function () {
            var path = 'a[2]';
            var obj = null;
            var value = 5;
            var expectValue = { a: [] };
            expectValue.a[2] = value;

            expect(accessor.setValue(obj, path, value)).to.deep.equal(expectValue);
            expect(obj).to.be.null;
        });
    });
});
