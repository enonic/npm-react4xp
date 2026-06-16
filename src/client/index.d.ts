import type {ReactNode} from 'react';

export interface Props {
	regionsData: {
		[regionName: string]: {
			components: Array<{
				descriptor: string
				path: string
				text?: string
				type: string
			}>
		}
	}
}
export type ComponentFunction = (props: Props) => ReactNode;
export interface ComponentObject {
	default: ComponentFunction|ReactNode
}
export type Component = ComponentFunction|ComponentObject|unknown;


export interface Region {
	innerHTML: string
}
export interface RegionsBuffer {
	[regionName: string]: string
}
export interface RegionsRemaining {
	[regionName: string]: number
}
