import React from 'react';
import Button from '../../../react4xp/shared/Button';
import Header from '../../../react4xp/shared/Header';
import AComponentInAChunkDirInsideReact4xpDir from '../../../react4xp/aChunkDirInsideReact4xpDir/AComponentInAChunkDirInsideReact4xpDir';
import AComponentInAChunkDirOutsideReact4xpDir from '../../../aChunkDirOutsideReact4xpDir/AComponentInAChunkDirOutsideReact4xpDir';
import AnEntryInAnEntryDirInsideR4xDir from '../../../react4xp/anEntryDirInsideR4xDir/anEntryInAnEntryDirInsideR4xDir'
import AnEntryInAnEntryDirOutsideR4xDir from '../../../anEntryDirOutsideR4xDir/anEntryInAnEntryDirOutsideR4xDir'
import lodashArray from 'lodash/array'; // This makes a vendors file because it doesn't match externals nor globals, which is fine.

var _ = require('lodash');


export default class JsExample {
	render () {
		_.camelCase('Foo Bar');
		lodashArray.concat([1], 2, [3], [[4]]);
		return (
			<>
				<AComponentInAChunkDirInsideReact4xpDir/>
				<AComponentInAChunkDirOutsideReact4xpDir/>
				<AnEntryInAnEntryDirInsideR4xDir/>
				<AnEntryInAnEntryDirOutsideR4xDir/>
				<Button/>
				<Header/>
			</>
		);
	}
};
