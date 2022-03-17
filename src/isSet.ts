export function isSet(value: unknown): boolean {
	if (typeof value === 'boolean') { return true; } // If value is true/false it is set
	return value !== null && typeof value !== 'undefined';
}
