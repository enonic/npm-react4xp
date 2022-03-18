/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify

replacer | Optional | A function that alters the behavior of the stringification
process, or an array of String and Number that serve as an allowlist for
selecting/filtering the properties of the value object to be included in the
JSON string. If this value is null or not provided, all properties of the object
are included in the resulting JSON string.
*/
type ReplacerFn = (this: unknown, key: string, value: unknown) => unknown;
//type Replacer =  ReplacerFn|Array<string|number>|undefined
type Replacer =  ReplacerFn|undefined

export function toStr(
	value: unknown,
	replacer? :Replacer,
	space: string | number | undefined = 4
): string {
	return JSON.stringify(value, replacer, space);
}
