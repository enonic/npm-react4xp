// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction<FunctionShape extends Function>(value: unknown) :value is FunctionShape {
	return Object.prototype.toString.call(value).slice(8,-1) === 'Function';
}
