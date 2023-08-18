import {
	describe,
	// expect,
	test as it
} from '@jest/globals';
import { expect } from 'chai';
import { execSync } from 'node:child_process';


describe('components', () => {
	it('throws when an entry collides with a chunkdir (case insensitive)', () => {
		try {
			execSync('cross-env-shell NO_COLOR=true NODE_ENV=development R4X_APP_NAME=com.enonic.app.whatever R4X_BUILD_LOG_LEVEL=INFO R4X_DIR_PATH_ABSOLUTE_PROJECT=$INIT_CWD/test/caseCollision TERM=vt220 yarn webpack:components', {
				stdio: 'pipe'
			});
		} catch (e) {
			expect(e.message.split(/\r?\n/)[1]).to.equal('[webpack-cli] Error: Entry name collision:ChUnKdIr!');
		}
	});
});
