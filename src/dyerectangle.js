import React from 'react';

import './dyerectangle.css';


export default function DyeRectangle(props) {
	let {rgb, text, title, link} = props;
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

	let className = 'dyerectangle';
	if (props.className)
		className += ' ' + props.className;

	let href = undefined;
	if (link !== undefined) {
		style.cursor = 'pointer';
		href = '#dye/' + encodeURIComponent(link.replace(' ', '_'));
	}
	
	return <a className={className} href={href} title={title} style={style}>
		<div className='text'>
			{text}
		</div>
	</a>;
}
