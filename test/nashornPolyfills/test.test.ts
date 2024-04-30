import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import {join} from 'path';
import {existsSync} from 'fs';


const DIR_NAME = join(process.cwd(), 'test', 'nashornPolyfills');
//console.log('DIR_NAME:', JSON.stringify(DIR_NAME, null, 2));

const BUILD_RESOURCES_MAIN = join(DIR_NAME, 'build', 'resources', 'main');

describe('nashornPolyfills', ()=>{
	it('make a file', ()=>{
		const exists = existsSync(join(BUILD_RESOURCES_MAIN, 'lib', 'enonic', 'react4xp', 'nashornPolyfills.userAdded.js'));
		expect(exists).toBeTruthy();
	});
});
