import React from 'react';

import DyeRectangle from './dyerectangle.js';

import {REFERENCE_MATERIAL} from './constants.js';

export default function VisitedDyeList(props) {
	let { dyes, visited } = props;

	if (!dyes)
		return null;

	if (visited.size < 1) {
		return <div>
			You did not visit any dyes yet. Click on something pretty on the left!
		</div>
	}
	let arr = [];
	visited.forEach((id) => {
		arr.push(<DyeRectangle key={id} rgb={dyes[id][REFERENCE_MATERIAL].rgb} link={dyes[id].name} text={dyes[id].name} />);
	})
	return <div>
		These are all the dyes you've looked at today:<br />
		<br />
		{arr}
	</div>;
}
