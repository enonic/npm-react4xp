export const isString = (value: string | unknown) :value is string =>
	typeof value === 'string' || value instanceof String;
