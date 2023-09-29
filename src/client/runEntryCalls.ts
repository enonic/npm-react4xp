import type {Entries} from './index.d';


/** After all the dependency and entry source scripts have been loaded and run, it's time to add a script tag that calls
 * the render method on each entry, and finally runs the callback */
export function runEntryCalls(
	entriesWithTargetIdsAndProps: Entries,
	entryNames: string[],
	callback: () => void
) {
	const script = document.createElement("script");
	script.type = "text/javascript";

	let inlineScript = "\n";
	entryNames.forEach((entryName) => {
		const trimmedEntryName = (entryName || "").trim();
		if (trimmedEntryName === "") {
			return;
		}

		inlineScript +=
			`globalThis['${process.env.R4X_CLIENT_NAME}'].render(globalThis['${process.env.R4X_LIBRARY_NAME}']['${trimmedEntryName}'], ` +
			`${JSON.stringify(entriesWithTargetIdsAndProps[entryName].targetId)}, ` +
			`${JSON.stringify(entriesWithTargetIdsAndProps[entryName].props)});\n`;
	});

	if (typeof callback === "function") {
		inlineScript += `(${callback.toString()})();\n`;
	}

	script.appendChild(document.createTextNode(inlineScript));
	document.getElementsByTagName("head")[0].appendChild(script);
}
