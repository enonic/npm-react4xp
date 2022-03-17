"use strict";
exports.__esModule = true;
exports.isSet = void 0;
function isSet(value) {
    if (typeof value === 'boolean') {
        return true;
    } // If value is true/false it is set
    return value !== null && typeof value !== 'undefined';
}
exports.isSet = isSet;
