export function regexpEscape(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
