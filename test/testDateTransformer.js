/*global describe, it*/
/*jshint -W079, expr:true */
var chai = require('chai'),
    expect = chai.expect,
    mapperUtils = require('../lib/mapperUtils');

describe ('Mapper Utils', function () {
    it('should map date strings to expected format', function() {
        expect(mapperUtils.dateTransformer('04/22/2016')).to.equal('2016-04-22');
        expect(mapperUtils.dateTransformer('2016/04/22')).to.equal('2016-04-22');
        expect(mapperUtils.dateTimeTransformer('2016-04-22')).to.equal('2016-04-22T12:00:00.000Z');
        expect(mapperUtils.dateTimeTransformer('2016-04-22T12:34:56.000Z')).to.equal('2016-04-22T12:34:56.000Z');
        expect(mapperUtils.dateToDateTimeTransformer('2016-04-22')).to.equal('2016-04-22T12:00:00.000Z');
        expect(mapperUtils.dateToDateTimeTransformer('2016-04-22T12:00:00.000Z', true)).to.equal('2016-04-22');
    });
});
