export const isObject = (value :object | unknown) :value is object =>
	Object.prototype.toString.call(value).slice(8,-1) === 'Object';
