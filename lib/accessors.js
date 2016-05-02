var _ = require('lodash');

/**
 * Retrieves a value from the given object by following the given path.
 *
 * @param {Object} obj - The object from which to retrieve data
 * @param {string} path - The path to the data to retrieve from the given object. The
 *                 supported syntax is as follows:
 *                 a.b[sub_key=valueLiteral].c.d[3]
 *                 Which pulls 'God' from the following object:
 *                 {
 *                   a: {
 *                     b: [
 *                       {
 *                         sub: {
 *                           key: 'something unmatched'
 *                         },
 *                         c: {
 *                           d: ['these', 'values', 'are', 'not', 'returned']
 *                         }
 *                       },
 *                       {
 *                         sub: {
 *                           key: 'valueLiteral'
 *                         },
 *                         c: {
 *                           d: ['are', 'you', 'there', 'God', 'its', 'me', 'Margaret']
 *                         }
 *                       }
 *                     ]
 *                   },
 *                   u: 'not returned',
 *                   v: true
 *                 }
 *
 * @returns        The data from the given object found at the given path.
 */
function getValue(obj, path) {
    if (!_.isString(path) || _.isEmpty(path)) {
        return undefined;
    }
    var pathArr = path.split('.');
    return getValueHelper(obj, pathArr);
}

/**
 * The purpose of this function is to allow us to make the getValue call recursive
 * without the need to constantly convert the path back and forth between array and string.
 *
 * @param  {Object}   obj - The object from which to retrieve data
 * @param  {string[]} path - The path to the data to retrieve from the given object. Each
 *                    element in the array handles one more level in the hierarchy of the
 *                    object from which to retrieve data. For example, 'a.b[c=d].e[4]'
 *                    would be represented by the array ['a', 'b[c=d]', 'e[4]'].
 *
 * @returns           The data from the given object found at the given path.
 */
function getValueHelper(obj, path) {
    if (!path || !path.length) {
        // This check serves two purposes: (1) it performs input validation
        // on the first call of this method, and (2) it terminates the
        // recursion of this method when the path is gone. When we're out
        // of path, we simply return whatever we found in the last step.
        return obj;
    }

    // Removing the next portion of the path from the array will
    // allow the recursion of the method to eventually end.
    var elementPath = path.shift();
    var pathParts = subPathParser(elementPath);

    // Find the value represented by the element portion of the sub-path string.
    var elementObj = _.get(obj, pathParts.element);

    if (pathParts.literalValue) {
        // Special Case 1: b[sub_key=valueLiteral]

        // If the elementObject (ex: b) is not an array, then there is no
        // way for the predicate to be satisifed.
        if (!_.isArray(elementObj)) {
            return undefined;
        }

        // Proprietary syntax says that we can call out sub-objects in a
        // predicate using '_' in place of '.'. We have this syntax, because
        // we split on '.' and we don't want to break up a path awkwardly
        // inside of a predicate. (ex: sub_key instead of sub.key)
        var whereKeyConverted = pathParts.whereKeyOrIndex.replace('_', '.');
        var match = _.find(elementObj, function (o) {
            return getValue(o, whereKeyConverted) === pathParts.literalValue;
        });

        // The predicate was not matched, so there is nothing to be returned.
        if (!match) {
            return undefined;
        }

        elementObj = match;
    } else if (pathParts.whereKeyOrIndex) {
        // Special Case 2: d[3]

        // If the elementObject (ex: d) is not an array, then there is no
        // way to find an element at the specified index.
        if (!_.isArray(elementObj)) {
            return undefined;
        }

        // If the index is not an integer, then there is no way to find an
        // element at the specified index.
        var idx = parseInt(pathParts.whereKeyOrIndex);
        if (isNaN(idx)) {
            return undefined;
        }

        elementObj = elementObj[idx];
    }

    // Recursively call the method with this method with the object we found after
    // executing this portion of the path along with what's left of the path.
    return getValueHelper(elementObj, path);
}

/**
 * Parses the given sub-path token and returns it in its component pieces.
 *
 * @param  {string}  subPath - The portion of the path to parse
 *
 * @returns {Object} An object with three properties (element, whereKeyOrIndex, and literalValue).
 *
 * @example
 * // returns {
 * //   element: 'a',
 * //   whereKeyOrIndex: null,
 * //   literalValue: null
 * // }
 * subPathParser('a');
 * @example
 * // returns {
 * //   element: 'b',
 * //   whereKeyOrIndex: c_d,
 * //   literalValue: e
 * // }
 * subPathParser('b[c_d=e]');
 * @example
 * // returns {
 * //   element: 'f',
 * //   whereKeyOrIndex: 4,
 * //   literalValue: null
 * // }
 * subPathParser('f[4]');
 */
function subPathParser(subPath) {
    // PATTERN MATCHES: element
    //                  element[whereKeyOrIndex]
    //                  element[whereKeyOrIndex=literalValue]
    var subPathPattern = /([^\.\[\s]+)\s*(?:\[\s*([^\s\=\]]*)\s*(?:\=\s*([^\s\]]+)\s*)?\])?/;
    var subPathParts = subPathPattern.exec(subPath);

    return {
        element: subPathParts[1],
        whereKeyOrIndex: subPathParts[2],
        literalValue: subPathParts[3]
    };
}

/**
 * Sets the given value in the given object at the given path.
 *
 * @param {Object} obj - The object in which to set the value
 * @param {string} path - The path to where the  data should be set in the given object.
 *                 The supported syntax is as follows:
 *                 setValue(testObj, 'a.b[sub_key=valueLiteral].c.d[3]', 'Dad');
 *                 Which substitutes 'Dad' for 'God' in the following object:
 *                 {
 *                   a: {
 *                     b: [
 *                       {
 *                         sub: {
 *                           key: 'something unmatched'
 *                         },
 *                         c: {
 *                           d: ['these', 'values', 'are', 'not', 'returned']
 *                         }
 *                       },
 *                       {
 *                         sub: {
 *                           key: 'valueLiteral'
 *                         },
 *                         c: {
 *                           d: ['are', 'you', 'there', 'God', 'its', 'me', 'Margaret']
 *                         }
 *                       }
 *                     ]
 *                   },
 *                   u: 'not returned',
 *                   v: true
 *                 }
 *
 * @returns {Object} The original object passed into this method.
 */
function setValue(obj, path, value) {
    // IMPLEMENTATION NOTE: We choose not to use recursion in this method, because unlike
    //                      the getter method, recursive set is troublesome. For example,
    //                      a previous implementation of this method contained a defect
    //                      where values were thought to have been passed by reference,
    //                      but this hadn't actually happened, which led to lost data.

    if (!_.isString(path) || _.isEmpty(path)) {
        return obj;
    }

    if (!obj) {
        obj = {};
    }

    var pathParts = path.split('.');
    var nested = obj;

    // Instead of recursively calling this method, we iterate on each sub-path.
    while (pathParts.length > 0) {
        var pathPart = pathParts.shift();

        // We have to behave differently whether we have more path or not; we
        // can't wait on the next loop, so we keep a pretty variable to track.
        var pathHasMore = (pathParts.length > 0);
        var pi = subPathParser(pathPart);

        if (pi.literalValue) {
            // Case 1: b[sub_key=valueLiteral]
            //  Business Rules:
            //    - If b doesn't exist, initialize b to be an array.
            //    - If b exists but is not an array, wrap it in an array.
            //    - If no object in the array at b satisfies the predicate,
            //      create a new object in the array at b that does.

            if (!nested[pi.element]) {
                nested[pi.element] = [];
            }

            if (!_.isArray(nested[pi.element])) {
                nested[pi.element] = [nested[pi.element]];
            }

            var whereKeyConverted = pi.whereKeyOrIndex.replace('_', '.');
            /* jshint -W083 */
            var match = _.find(nested[pi.element], function (o) {
                return _.get(o, whereKeyConverted) === pi.literalValue;
            });
            /* jshint +W083 */

            // NOTE: We have some duplicate code below to handle when
            // the predicate match is not found. We can't refactor it
            // out, because we do not want to set the value if it
            // is not an object (no way to make sense of that).

            if (pathHasMore) {
                // Sub-Case 1A - We have more path to process
                if (!match) {
                    match = {};
                    _.set(match, whereKeyConverted, pi.literalValue);
                    nested[pi.element].push(match);
                }
                nested = match;
            } else {
                // Sub-Case 1B - No more path to process; set the value
                if (!_.isPlainObject(value)) {
                    return obj;
                }

                if (!match) {
                    match = {};
                    _.set(match, whereKeyConverted, pi.literalValue);
                    nested[pi.element].push(match);
                }

                // We choose the 'merge' semantic instead of 'assign'.
                // This is inline with past implementations and so
                // supports backwards compatibility.
                _.merge(match, value);
            }
        } else if (pi.whereKeyOrIndex) {
            // Case 2: d[3]
            //   Business Rules:
            //     - If the index is not an integer, declare error
            //     - If d does not exist, initialize d to be an array

            var idx = parseInt(pi.whereKeyOrIndex);
            if (isNaN(idx)) {
                return obj;
            }

            if (!nested[pi.element]) {
                nested[pi.element] = [];
            }

            if (pathHasMore) {
                // Sub-case 2A - We have more path to process (NOTE: this
                // means the element in the array we create is an object)
                if (!nested[pi.element][idx]) {
                    nested[pi.element][idx] = {};
                }
                nested = nested[pi.element][idx];
            } else {
                // Sub-Case 2B - No more path to process; set the value
                nested[pi.element][idx] = value;
            }
        } else {
            // Case 3: a

            if (pathHasMore) {
                // Sub-Case 3A - We have more path to process (NOTE: this
                // means the element we create is an object)
                if (!nested[pi.element]) {
                    nested[pi.element] = {};
                }
                nested = nested[pi.element];
            } else {
                // Sub-Case 3B - No more path to process; set the value
                //   Business Logic:
                //     - If the existing element is an object, we set the value
                //       using 'merge' semantics instead of 'assign'
                //     - If the existing element is not an object, we assign the
                //       value directly
                if (_.isPlainObject(nested[pi.element]) && _.isPlainObject(value)) {
                    _.merge(nested[pi.element], value);
                } else {
                    nested[pi.element] = value;
                }
            }
        }
    }

    return obj;
}

module.exports = {
    getValue: getValue,
    setValue: setValue
};
