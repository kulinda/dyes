import React from 'react';

import './dyerectangle.css';


function navigateToDye(id) {
	if (id === undefined)
		return;
	window.location.hash = '#dye/' + id;
}

export default function DyeRectangle(props) {
	let {rgb, text, link} = props;
	let style = {
		color: 'black',
		backgroundColor: 'rgb(' + rgb.join(',') + ')',
	};
	if (props.width)
		style.width = props.width;
	if (props.height)
		style.height = props.height;

	// Formula for perceived brightness according to:
	// https://www.w3.org/TR/AERT/#color-contrast
	// This yields a number between 0 and 255.
	let brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
	if (brightness <= 128)
		style.color = 'white';

	if (link !== undefined)
		style.cursor = 'pointer';

	let className = 'dyerectangle';
	if (props.className)
		className += ' ' + props.className;

	return <div className={className} onClick={navigateToDye.bind(null, link)} style={style}>
		<div className='text'>
			{text}
		</div>
	</div>;
}
