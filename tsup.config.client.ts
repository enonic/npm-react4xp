import manifestPlugin from 'esbuild-plugin-manifest';
import { isAbsolute, join } from 'path';
// import { print } from 'q-i';
import { defineConfig, type Options } from 'tsup';
import { LIBRARY_NAME } from './src/constants.runtime';
import { DIR_PATH_RELATIVE_BUILD_ASSETS_R4X } from './src/constants.buildtime';
import { camelize } from './src/util/camelize';
import { ucFirst } from './src/util/ucFirst';

interface MyOptions extends Options {
	env?: {
		R4X_APP_NAME?: string
		R4X_CLIENT_NAME?: string
		R4X_DIR_PATH_ABSOLUTE_PROJECT?: string
		R4X_LIBRARY_NAME?: string
	}
}


export default defineConfig((options: MyOptions) => {
	// print(process.env, { maxItems: Infinity });
	// print(options, { maxItems: Infinity });
	const R4X_DIR_PATH_ABSOLUTE_PROJECT = process.env.R4X_DIR_PATH_ABSOLUTE_PROJECT;
	if (!R4X_DIR_PATH_ABSOLUTE_PROJECT || !isAbsolute(R4X_DIR_PATH_ABSOLUTE_PROJECT)) {
		throw new Error(`env.R4X_DIR_PATH_ABSOLUTE_PROJECT:${R4X_DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
	}

	if (!process.env.R4X_APP_NAME) {
		throw new Error(`System environment variable $R4X_APP_NAME is required!`);
	}
	if (!options.env) {
		options.env = {};
	}
	options.env.R4X_APP_NAME = process.env.R4X_APP_NAME;
	options.env.R4X_LIBRARY_NAME = `${ucFirst(camelize(process.env.R4X_APP_NAME,/\./g))}${LIBRARY_NAME}`;
	options.env.R4X_CLIENT_NAME = `${options.env.R4X_LIBRARY_NAME}Client`;
	// print(options, { maxItems: Infinity });

	return {
		globalName: options.env.R4X_CLIENT_NAME,
		entry: {
			'client': 'src/client.ts'
		},
		esbuildOptions(options, context) {
			// Let's see if this works, it does but: Dynamic require of "react-dom/client" is not supported
			// options.external = [
			// 	'react',
			// 	'react-dom',
			// 	'react-dom/client',
			// ]
		},
		esbuildPlugins: [
			manifestPlugin({
				extensionless: 'input',
				filename: 'client.manifest.json',
				generate: (entries) => {
					return {
						'client.js': entries['client']
					};
				},
				shortNames: true
			})
		],
		// For some reason external doesn't work! Neither on the cmdline.
		// The only thing that works is to comment out the imports in render.ts and hydrate.ts???
		// external: [
		// 	/^react.*$/i
		// ],
		// external: [
		// 	'react',
		// 	'react-dom',
		// 	'react-dom/client',
		// ],
		format: 'iife',
		platform: 'browser',
		outDir: join(R4X_DIR_PATH_ABSOLUTE_PROJECT, DIR_PATH_RELATIVE_BUILD_ASSETS_R4X),
		target: 'es2015',
		tsconfig: 'tsconfig.client.json'
	};
});
