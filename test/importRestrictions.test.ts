import type { Environment } from '../src/index.d';

import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import webpack from 'webpack';
import buildWebpackOptions from '../src/webpack.config.components';
// import { print } from 'q-i';

process.env.NODE_ENV='development';
process.env.R4X_APP_NAME='com.enonic.app.whatever';
process.env.R4X_DIR_PATH_ABSOLUTE_PROJECT=`${process.env.INIT_CWD}/test/importRestrictions`;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('components', () => {
	afterEach(async () => {
		console.info('Sleeping 2 seconds in order to avoid ReferenceError: You are trying to `import` a file after the Jest environment has been torn down.');
		await sleep(2000);
	});
	test('import restrictions', () => {
		// console.log(process.env.R4X_DIR_PATH_ABSOLUTE_PROJECT);
		const options = buildWebpackOptions(process.env as Environment);
		// print(options);
		webpack(options, function(err, stats) {
			expect(stats.toJson().errorsCount).toBe(3);
			// if (err) {
			// 	console.error(err.stack || err);
			// 	return;
			// } else if (stats.hasErrors()) {
			// 	// print(stats);
			// 	print(stats.toJson());
			// 	// console.error(stats.toString());
			// 	return;
			// } else {
			// 	const files = stats.toJson().assets.map(x => x.name);
			// 	print(files);
			// }
		}); // webpack
	}); // test
}); // describe
