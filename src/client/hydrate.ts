import type {
	Component,
	Props
} from './index.d';
import type {hydrateRoot} from 'react-dom/client';
import type {hydrate as hydrateOrig} from 'react-dom';

import {isFunction} from '../util/isFunction';

// This should be commented out, or it causes this runtime warning in React 18:
// Warning: You are importing hydrateRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".
// import ReactDOM from 'react-dom'; // This should be commented out, or it causes runtime warnings!

// Even though you make react-dom/client an external, it causes runtime error:
// Dynamic require of "react-dom/client" is not supported
// import {hydrateRoot} from 'react-dom/client';

import {getContainer} from './getContainer';
import {getRenderable} from './getRenderable';

// Avoid 'ReactDOM' refers to a UMD global, but the current file is a module. Consider adding an import instead.ts(2686)
declare const ReactDOM: {
	hydrate: typeof hydrateOrig
	hydrateRoot: typeof hydrateRoot
};


export function hydrate(
	component: Component,
	targetId: string,
	props: Props/*,
	isPage: boolean,
	hasRegions: boolean*/
) {
	const container = getContainer(targetId);
	const renderable = getRenderable(component, props);
	if (isFunction(ReactDOM.hydrateRoot)) {
		// React 18
		ReactDOM.hydrateRoot(container, renderable, {
			identifierPrefix: process.env.R4X_APP_NAME // Resolved compiletime
		});
	} else {
		ReactDOM.hydrate(renderable, container); // React 17
	}
}
