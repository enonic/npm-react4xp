import {
	describe,
	expect,
	test,
} from '@jest/globals';
import { spawnSync } from 'child_process';
import { mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const PROJECT_PATH = 'test/importRestrictions';
const DIR_R4X = join(process.cwd(), PROJECT_PATH, 'build/resources/main/r4xAssets');

describe('components', () => {
	test('import restrictions', () => {
		const statsPath = join(mkdtempSync(join(tmpdir(), 'r4x-importRestrictions-')), 'stats.json');
		const rspackBin = join(process.cwd(), 'node_modules', '@rspack', 'cli', 'bin', 'rspack.js');
		const result = spawnSync(
			process.execPath,
			[rspackBin, '--config', 'dist/webpack.config.components.js', `--json=${statsPath}`],
			{
				cwd: process.cwd(),
				env: {
					...process.env,
					NODE_ENV: 'development',
					R4X_APP_NAME: 'com.enonic.app.whatever',
					R4X_PROJECT_PATH: PROJECT_PATH,
					TS_NODE_PROJECT: 'tsconfig.browserAndGraalJS.json',
				},
				encoding: 'utf-8',
				maxBuffer: 64 * 1024 * 1024,
			}
		);
		if (result.error) {
			throw result.error;
		}

		const stats = JSON.parse(readFileSync(statsPath).toString()) as { errors: unknown[] };
		expect(stats.errors.length).toBe(3);

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

			{ "name": "site/parts/allowedFunctionalJsx/entry.css" },
			{ "name": "site/parts/allowedFunctionalJsx/entry.js" },
		]);
		expect(statsObject.entrypoints['site/parts/allowedFunctionalTsx/entry'].assets).toStrictEqual([
			{ "name": "runtime.js" },

			{ "name": "vendors.js" }, // rspack added this line

			{ "name": "site/parts/allowedFunctionalTsx/entry.css" },
			{ "name": "site/parts/allowedFunctionalTsx/entry.js" },
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

		expect(readFileSync(join(DIR_R4X, 'site/parts/allowedFunctionalJsx/entry.css')).toString()).toBe(css);
		expect(readFileSync(join(DIR_R4X, 'site/parts/allowedFunctionalTsx/entry.css')).toString()).toBe(css);
	}); // test
}); // describe
