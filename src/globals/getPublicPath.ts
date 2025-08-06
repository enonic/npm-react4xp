type BooleanProp = '1' | '0' | 1 | 0 | boolean;

interface Data {
	command: 'hydrate' | 'render'
	devMode: BooleanProp
	hasRegions: BooleanProp
	isPage: BooleanProp
	jsxPath: string
	publicPath: string
	props: object
}

export const getPublicPath = (appName: string): string | undefined => {
	if (typeof document === 'undefined') {
		return undefined;
	}

	const inlineJsonElements = Array.from(document.querySelectorAll(
		`script[data-react4xp-app-name="${appName}"][data-react4xp-ref][type="application/json"]`
	));

	//console.debug('inlineJsonElements', inlineJsonElements);
	for (let index = 0; index < inlineJsonElements.length; index++) {
		const inlineJsonElement = inlineJsonElements[index];
		if (inlineJsonElement instanceof HTMLElement) {

			const json = inlineJsonElement.textContent;
			//console.debug('json', json);

			let data = {} as Data;
			try {
				data = JSON.parse(json as string);
			} catch (e) {
				console.error('Something went wrong while trying to JSON.parse(' + json + ')');
			}
			//console.debug('data', data);

			if (data.publicPath?.length) {
				return data.publicPath;
			}
		}
	} // for
}
