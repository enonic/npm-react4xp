import manifestPlugin from 'esbuild-plugin-manifest';
import { isAbsolute, join } from 'path';
// import { print } from 'q-i';
import { defineConfig, type Options } from 'tsup';
import { LIBRARY_NAME } from './src/constants.runtime';
import getAppName from './src/util/getAppName';
import { camelize } from './src/util/camelize';
import { ucFirst } from './src/util/ucFirst';


interface MyOptions extends Options {
	env?: {
		APP_NAME?: string
		BUILD_ENV?: 'development'|'production'
		DIR_PATH_ABSOLUTE_PROJECT?: string
		LIBRARY_NAME?: string
	}
}


export default defineConfig((options: MyOptions) => {
	// print(process.env, { maxItems: Infinity });
	// print(options, { maxItems: Infinity });
	const {
		env: {
			BUILD_ENV = 'production',
			DIR_PATH_ABSOLUTE_PROJECT
		} = {}
	} = options;
	if (!DIR_PATH_ABSOLUTE_PROJECT || !isAbsolute(DIR_PATH_ABSOLUTE_PROJECT)) {
		throw new Error(`env.DIR_PATH_ABSOLUTE_PROJECT:${DIR_PATH_ABSOLUTE_PROJECT} not an absolute path!`);
	}

	const appName = getAppName(DIR_PATH_ABSOLUTE_PROJECT);
	// print(appName);
	// print(LIBRARY_NAME);
	if (!options.env) {
		options.env = {};
	}
	options.env.APP_NAME = appName;
	options.env.LIBRARY_NAME = LIBRARY_NAME;
	// print(options, { maxItems: Infinity });

	return {
		globalName: `${ucFirst(camelize(appName, /\./g))}${LIBRARY_NAME}Client`,
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
		outDir: join(DIR_PATH_ABSOLUTE_PROJECT, 'build/resources/main/assets/react4xp/'),
		target: 'es2015',
		tsconfig: 'tsconfig.client.json'
	};
});
