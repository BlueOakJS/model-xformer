var _ = require('lodash');
var moment = require('moment');
var DATE_FORMAT = ('YYYY-MM-DD');
//var TIME_FORMAT = ('hh:mm zz');
var TIME_FORMAT = ('h:mm A')
/* jshint unused: vars */
function dateTransformer(date, reverse) {
    var m = moment.utc(new Date(date));
    if ((m.hour() === 0) && (m.minute() === 0)) {
        m.hour(12);
    }

    // reverse: format date for CO, forward: format date for UI
    return m.format(DATE_FORMAT);
}

// Returns only the time of a dateTime
function dateTimeToTimeTransformer(date) {
    var m = moment.utc(new Date(date));
    return m.format(TIME_FORMAT);
}

function combineDateTimeString(dateString, timeString) {
    dateString = moment.utc(dateString).format('YYYY-MM-DD');
    return moment.utc(dateString + ' ' + timeString, ['YYYY-MM-DD h:mm A']).toISOString();
}

function dateTimeTransformer(date, reverse) {
    // in either direction, return full date/time
    var m = moment.utc(new Date(date));
    if ((m.hour() === 0) && (m.minute() === 0)) {
        m.hour(12);
    }
    return m.toISOString();
}

function dateToDateTimeTransformer(date, reverse) {
    return reverse ? dateTransformer(date) : dateTimeTransformer(date);
}

function uppercaseWordsTransformer(stringVal, reverse) {
    return stringVal.toLowerCase().replace(/\b\w/g, function (word) {
        return _.capitalize(word);
    })
}

function stringToFloatTransformer(val, reverse) {
    if (reverse) {
        return (typeof val === 'number') ? val.toString() : undefined;
    } else {
        return parseFloat(val);
    }
}

module.exports = {
    dateTransformer: dateTransformer,
    dateTimeTransformer: dateTimeTransformer,
    dateTimeToTimeTransformer: dateTimeToTimeTransformer,
    dateToDateTimeTransformer: dateToDateTimeTransformer,
    combineDateTimeString: combineDateTimeString,
    uppercaseWordsTransformer: uppercaseWordsTransformer,
    stringToFloatTransformer: stringToFloatTransformer
};
