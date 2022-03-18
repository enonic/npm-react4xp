import type {
  BinaryToTextEncoding,
  //Encoding,
  Hash
} from './Hash.d';


import {fingerprint64} from 'farmhash';
import {isSet} from './isSet';
//import {toStr} from './toStr';


const changeEndianness = (string :string) => {
  //console.debug('changeEndianness() string:%s', string);
  const result = [];
  let len = string.length - 2;
  while (len >= 0) {
    //console.debug('changeEndianness() string:%s len:%s', string, len);
    result.push(string.substr(len, 2)); // shortest:14 longest:16
    //console.debug('changeEndianness() string:%s len:%s result:%s', string, len, toStr(result));
    //result.push(string.substring(len, len+2)); // // shortest:56 longest:72
    len -= 2;
  }
  //console.debug('changeEndianness() string:%s len:%s result:%s', string, len, toStr(result));
  return result.join('');
}

let shortest = 1000;
let longest = 0;

export class FarmHash implements Hash {
  _data :string|Buffer;
  _digest :string;

  //constructor() {}

  // digest: Calculates the digest of all of the data passed to be
  //  hashed (using the hash.update() method). If encoding is provided a
  //  string will be returned; otherwise a Buffer is returned.
  //  The Hash object can not be used again after hash.digest() method
  //  has been called. Multiple calls will cause an error to be thrown.
  digest/*<
    Encoding extends BinaryToTextEncoding|undefined
    ReturnType extends string|Buffer = Encoding extends BinaryToTextEncoding ? string : Buffer
  >*/(encoding? :BinaryToTextEncoding) {
    //console.debug('FarmHash.digest() encoding:%s', encoding);
    if (isSet(this._digest)) {
      throw new Error(`FarmHash.digest() digest already called! digest:${this._digest}`);
    }
    if (encoding) {
      //this._digest = fingerprint64(this._data); // shortest:18 longest:20
      this._digest = changeEndianness(BigInt(fingerprint64(this._data)).toString(16)); // shortest:14 longest:16
      //this._digest = BigInt(fingerprint64(this._data)).toString(16); // shortest:14 longest:16

      //this._digest = parseInt(fingerprint64(this._data)).toString(16); // shortest:15 longest:16
      //this._digest = parseInt(fingerprint64(this._data), 10).toString(16); // same
      //this._digest = BigInt(changeEndianness(fingerprint64(this._data))).toString(16); // shortest:14 longest:17

      if (this._digest.length < shortest) {
        shortest = this._digest.length;
      } else if (this._digest.length > longest) {
        longest = this._digest.length;
      }
      console.debug('FarmHash.digest() encoding:%s digest:%s length:%s shortest:%s longest:%s', encoding, this._digest, this._digest.length, shortest, longest);

      return this._digest;
    } else {
      this._digest = 'digest previously called without encoding';
      return new Uint8Array() as Buffer;
    }
  }

  // update: Updates the hash content with the given data, the encoding
  //  of which is given in inputEncoding. If encoding is not provided,
  //  and the data is a string, an encoding of 'utf8' is enforced. If
  //  data is a Buffer, TypedArray, or DataView, then inputEncoding is
  //  ignored. This can be called many times with new data as it is
  //  streamed.
  update(
    data :string|Buffer//,
    //inputEncoding :Encoding
  ) {
    if (isSet(this._digest)) {
      throw new Error(`FarmHash.update() digest already called! digest:${this._digest}`);
    }
    //console.debug('FarmHash.update() data:%s', JSON.stringify(data));
    //console.debug('FarmHash.update() inputEncoding:%s', inputEncoding);
    this._data = data;
    return this;
  }
}
