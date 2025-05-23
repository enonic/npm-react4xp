import type {
	Component,
	Props
} from './index.d';


import type { ReactNode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import {getContainer} from './getContainer';
import {getRenderable} from './getRenderable';


export function hydrate(
	component: Component,
	targetId: string,
	props: Props
) {
	const container = getContainer(targetId);
	const renderable: ReactNode = getRenderable(component, props);
	hydrateRoot(container, renderable, {
		identifierPrefix: process.env.R4X_APP_NAME, // Resolved at compile time
	});
}
