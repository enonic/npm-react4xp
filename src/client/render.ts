import type {
	Component,
	Props
} from './index.d';
import type ReactDOM from 'react-dom';


import {isFunction} from '../util/isFunction';

// This should be commented out, or it causes this runtime warning in React 18:
// Warning: You are importing createRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".
// import ReactDOM from 'react-dom';

import {getContainer} from './getContainer';
import {getRenderable} from './getRenderable';
import {postFillRegions} from './postFillRegions';


export function render(
	component: Component,
	targetId: string,
	props: Props,
	//@ts-expect-error TS6133: 'isPage' is declared but its value is never read.
	isPage: number, //boolean, // 0 means false
	hasRegions: number, //boolean, // 0 means false
	isDevMode: number //boolean // 0 means false
) {
	const container = getContainer(targetId);
	const renderable = getRenderable(component, props);

	async function render() {
		if (isFunction(ReactDOM.createRoot)) {
			ReactDOM.createRoot(container).render(renderable); // React 18
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
