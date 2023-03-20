import type {
	Component,
	Props
} from './index.d';
import type ReactDOM from 'react-dom';


import {isFunction} from '../util/isFunction';

// This should be commented out, or it causes this runtime warning in React 18:
// Warning: You are importing hydrateRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".
// import ReactDOM from 'react-dom'; // This should be commented out, or it causes runtime warnings!

import {getContainer} from './getContainer';
import {getRenderable} from './getRenderable';


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
		ReactDOM.hydrateRoot(container, renderable); // React 18
	} else {
		ReactDOM.hydrate(renderable, container);  // React 17
	}
}
