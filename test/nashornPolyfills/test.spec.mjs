import { expect } from 'chai';
import { file } from 'chai-files';
import {join} from 'path';


const DIR_NAME = join(process.cwd(), 'test', 'nashornPolyfills');
//console.log('DIR_NAME:', JSON.stringify(DIR_NAME, null, 2));

const BUILD_RESOURCES_MAIN = join(DIR_NAME, 'build', 'resources', 'main');

describe('nashornPolyfills', ()=>{
	it('make a file', ()=>{
		expect(file(join(BUILD_RESOURCES_MAIN, 'assets/react4xp/nashornPolyfills.userAdded.js'))).to.exist;
	});
});
