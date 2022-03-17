"use strict";
exports.__esModule = true;
exports.FarmHash = void 0;
var farmhash_1 = require("farmhash");
var isSet_1 = require("./isSet");
var FarmHash = /** @class */ (function () {
    function FarmHash() {
    }
    //constructor() {}
    // digest: Calculates the digest of all of the data passed to be
    //  hashed (using the hash.update() method). If encoding is provided a
    //  string will be returned; otherwise a Buffer is returned.
    //  The Hash object can not be used again after hash.digest() method
    //  has been called. Multiple calls will cause an error to be thrown.
    FarmHash.prototype.digest /*<
      Encoding extends BinaryToTextEncoding|undefined
      ReturnType extends string|Buffer = Encoding extends BinaryToTextEncoding ? string : Buffer
    >*/ = function (encoding) {
        //console.debug('FarmHash.digest() encoding:%s', encoding);
        if ((0, isSet_1.isSet)(this._digest)) {
            throw new Error("FarmHash.digest() digest already called! digest:".concat(this._digest));
        }
        if (encoding) {
            this._digest = (0, farmhash_1.fingerprint64)(this._data);
            console.debug('FarmHash.digest() encoding:%s digest:%s', encoding, this._digest);
            return this._digest;
        }
        else {
            this._digest = 'digest previously called without encoding';
            return new Uint8Array();
        }
    };
    // update: Updates the hash content with the given data, the encoding
    //  of which is given in inputEncoding. If encoding is not provided,
    //  and the data is a string, an encoding of 'utf8' is enforced. If
    //  data is a Buffer, TypedArray, or DataView, then inputEncoding is
    //  ignored. This can be called many times with new data as it is
    //  streamed.
    FarmHash.prototype.update = function (data //,
    //inputEncoding :Encoding
    ) {
        if ((0, isSet_1.isSet)(this._digest)) {
            throw new Error("FarmHash.update() digest already called! digest:".concat(this._digest));
        }
        //console.debug('FarmHash.update() data:%s', JSON.stringify(data));
        //console.debug('FarmHash.update() inputEncoding:%s', inputEncoding);
        this._data = data;
        return this;
    };
    return FarmHash;
}());
exports.FarmHash = FarmHash;
