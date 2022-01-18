import React from 'react';

import DyeRectangle from './dyerectangle.js';

import {REFERENCE_MATERIAL} from './constants.js';

import './visited.css';


export default function VisitedDyeList(props) {
	let { dyes, visited } = props;

	if (!dyes)
		return null;

	if (visited.size < 1) {
		return <div className='visiteddyes'>
			You did not visit any dyes yet. Click on something pretty on the left!
		</div>
	}
	let arr = [];
	visited.forEach((id) => {
		arr.push(<DyeRectangle key={id} className='visiteddye' rgb={dyes[id][REFERENCE_MATERIAL].rgb} link={dyes[id].name} text={dyes[id].name} />);
	})
	return <div className='content visiteddyes'>
		These are all the dyes you've looked at today:<br />
		<br />
		<div className='visiteddyeslist'>
			{arr}
		</div>
	</div>;
}
