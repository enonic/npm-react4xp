import type { Environment } from '../src/index.d';

import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';
import { rspack } from '@rspack/core';
import buildWebpackOptions from '../dist/webpack.config.components';
// import { print } from 'q-i';

process.env.NODE_ENV='development';
process.env.R4X_APP_NAME='com.enonic.app.whatever';
process.env.R4X_DIR_PATH_ABSOLUTE_PROJECT=`${process.env.INIT_CWD}/test/importRestrictions`;

const DIR_R4X = join(process.env.R4X_DIR_PATH_ABSOLUTE_PROJECT, 'build/resources/main/r4xAssets');

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
		rspack(options, function(err, stats) {
			expect(stats.toJson({}).errors.length).toBe(3);
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
			const entriesJson = readFileSync(join(DIR_R4X, 'entries.json')).toString();
			const entriesArray = JSON.parse(entriesJson) as string[];
			expect(entriesArray).toContain('site/parts/allowedFunctionalJsx/entry');
			expect(entriesArray).toContain('site/parts/allowedFunctionalTsx/entry');

			const statsJson = readFileSync(join(DIR_R4X, 'stats.components.json')).toString();
			const statsObject = JSON.parse(statsJson) as {
				assetsByChunkName: Record<string, string[]>;
				entrypoints: Record<string, {
					assets: {
						name: string
					}[]
				}>;
			};
			expect(statsObject.assetsByChunkName['site/parts/allowedFunctionalJsx/entry']).toStrictEqual([
				"site/parts/allowedFunctionalJsx/entry.css",
				"site/parts/allowedFunctionalJsx/entry.js"
			]);
			expect(statsObject.assetsByChunkName['site/parts/allowedFunctionalTsx/entry']).toStrictEqual([
				"site/parts/allowedFunctionalTsx/entry.css",
				"site/parts/allowedFunctionalTsx/entry.js"
			]);
			expect(statsObject.entrypoints['site/parts/allowedFunctionalJsx/entry'].assets).toStrictEqual([
				{ "name": "runtime.js" },

				{ "name": "vendors.js" }, // rspack added this line

				// Rspack swapped the order of these two lines:
				{ "name": "site/parts/allowedFunctionalJsx/entry.js" },
				{ "name": "site/parts/allowedFunctionalJsx/entry.css" },
			]);
			expect(statsObject.entrypoints['site/parts/allowedFunctionalTsx/entry'].assets).toStrictEqual([
				{ "name": "runtime.js" },

				{ "name": "vendors.js" }, // rspack added this line

				// Rspack swapped the order of these two lines:
				{ "name": "site/parts/allowedFunctionalTsx/entry.js" },
				{ "name": "site/parts/allowedFunctionalTsx/entry.css" },
			]);
			const css = `.bold {
  font-weight: bold;
}
.italic{font-style:italic}
.red {
  color: red;
}
.underline {
  text-decoration: underline;
}
`;
			const minifiedCss = `.bold{font-weight:bold}
.italic{font-style:italic}
.red{color:red}
.underline{text-decoration:underline}
`;

			expect(readFileSync(join(DIR_R4X, 'site/parts/allowedFunctionalJsx/entry.css')).toString()).toBe(css);
			expect(readFileSync(join(DIR_R4X, 'site/parts/allowedFunctionalTsx/entry.css')).toString()).toBe(css);
		}); // webpack
	}); // test
}); // describe
