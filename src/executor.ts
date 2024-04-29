type BooleanProp = '1' | '0' | 1 | 0 | boolean;

interface Data {
	command: 'hydrate'|'render'
	devMode: BooleanProp
	hasRegions: BooleanProp
	isPage: BooleanProp
	jsxPath: string
	props: object
}

const inlineJsonElements = Array.from(document.querySelectorAll(
	`script[data-react4xp-app-name="${process.env.R4X_APP_NAME}"][data-react4xp-ref][type="application/json"]`
));
//console.debug('inlineJsonElements', inlineJsonElements);
for (let index = 0; index < inlineJsonElements.length; index++) {
	const inlineJsonElement = inlineJsonElements[index];
	if (inlineJsonElement instanceof HTMLElement) {
		const id = inlineJsonElement.dataset['react4xpRef'];
		//console.debug('id', id);

		const json = inlineJsonElement.textContent;
		//console.debug('json', json);

		let data = {} as Data;
		try {
			data = JSON.parse(json as string);
		} catch (e) {
			console.error('Something went wrong while trying to JSON.parse(' + json + ')');
		}
		//console.debug('data', data);

		const {
			command,
			devMode,
			hasRegions,
			isPage,
			jsxPath,
			props
		} = data;
		/*console.debug('command', command);
		console.debug('devMode', devMode);
		console.debug('hasRegions', hasRegions);
		console.debug('isPage', isPage);
		console.debug('jsxPath', jsxPath);
		console.debug('props', props);*/
		globalThis[process.env.R4X_CLIENT_NAME][command](
			globalThis[process.env.R4X_LIBRARY_NAME][jsxPath], id, props, isPage, hasRegions, devMode
		);
	}
} // for
