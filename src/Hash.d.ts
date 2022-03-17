export type BinaryLike = string | NodeJS.ArrayBufferView;

export type BinaryToTextEncoding = 'base64' | 'base64url' | 'hex' | 'binary';
type CharacterEncoding = 'utf8' | 'utf-8' | 'utf16le' | 'latin1';
type LegacyCharacterEncoding = 'ascii' | 'binary' | 'ucs2' | 'ucs-2';
export type Encoding = BinaryToTextEncoding | CharacterEncoding | LegacyCharacterEncoding;

export interface Hash {
  //digest(): Buffer;
  //digest(encoding: BinaryToTextEncoding): string;
  digest(encoding?: BinaryToTextEncoding): string|Buffer;

  update(data: BinaryLike): Hash;
  update(data: string, inputEncoding: Encoding): Hash;
}
