import manifestPlugin from 'esbuild-plugin-manifest';
import { isAbsolute, join } from 'path';
// import { print } from 'q-i';
import { defineConfig, type Options } from 'tsup';
import getAppName from './src/util/getAppName';
import { LIBRARY_NAME } from './src/constants.runtime';


interface MyOptions extends Options {
	env?: {
		APP_NAME?: string
		DIR_PATH_ABSOLUTE_PROJECT?: string
		LIBRARY_NAME?: string
	}
}


export default defineConfig((options: MyOptions) => {
	// print(options, { maxItems: Infinity });
	const {
		env: {
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
		entry: {
			'executor': 'src/executor.ts'
		},
		esbuildPlugins: [
			manifestPlugin({
				extensionless: 'input',
				filename: 'executor.manifest.json',
				generate: (entries) => {
					return {
						'executor.js': entries['executor']
					};
				},
				shortNames: true
			})
		],
		platform: 'browser',
		outDir: join(DIR_PATH_ABSOLUTE_PROJECT, 'build/resources/main/assets/react4xp/'),
		target: 'es2015',
		tsconfig: 'tsconfig.executor.json'
	};
});
