import type {
	Component,
	Props
} from './index.d';
import type {createRoot} from 'react-dom/client';
import type {flushSync, render as renderOrig} from 'react-dom';

import {isFunction} from '../util/isFunction';

// This should be commented out, or it causes this runtime warning in React 18:
// Warning: You are importing createRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".
// import ReactDOM from 'react-dom';

// Even though you make react-dom/client an external, it causes runtime error:
// Dynamic require of "react-dom/client" is not supported
// import {createRoot} from 'react-dom/client';
// import {flushSync} from 'react-dom';

import {getContainer} from './getContainer';
import {getRenderable} from './getRenderable';
import {postFillRegions} from './postFillRegions';


// Avoid 'ReactDOM' refers to a UMD global, but the current file is a module. Consider adding an import instead.ts(2686)
declare var ReactDOM: {
	createRoot: typeof createRoot
	flushSync: typeof flushSync
	render: typeof renderOrig
};


export function render(
	component: Component,
	targetId: string,
	props: Props,
	//@ts-expect-error TS6133: 'isPage' is declared but its value is never read.
	isPage: number, //boolean, // 0 means false
	hasRegions: number, //boolean, // 0 means false
	isDevMode: number //boolean // 0 means false
) {
	// if (process.env.BUILD_ENV === 'development') {
	// 	console.debug('render');
	// }
	const container = getContainer(targetId);
	const renderable = getRenderable(component, props);

	async function render() {
		if (isFunction(ReactDOM.createRoot)) {
			// React 18
			ReactDOM.createRoot(container, {
				identifierPrefix: process.env.R4X_APP_NAME // Resolved compiletime
			}).render(renderable);
		} else {
			ReactDOM.render(renderable, container); // React 17
		}
	}

	if (hasRegions) {
		// Or postfill will run before the DOM is populated
		ReactDOM.flushSync(() => {
			render();
		});
		postFillRegions(props, isDevMode);
	} else {
		render();
	}
}
