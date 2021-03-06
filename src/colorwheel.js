import React from 'react';

import getSimilarDyes from './similarity.js';

import DyeRectangle from './dyerectangle.js';


import './colorwheel.css';


export default function ColorWheel(props) {
	let {dyes, mat, reference} = props;

	let elements = [];
	for (let i = 0; i < 12; i++) {
		let hue = (reference.hue + (i * 360 / 12)) % 360;
		let target={
			hue: hue,
			saturation: reference.saturation,
			lightness: reference.lightness,
			brightness: reference.brightness
		}
		let dye = getSimilarDyes(dyes, mat, target, 'hslb', 1)[0].dye;

		let radius = 40;
		let x = 50 + radius * Math.sin(hue * Math.PI / 180);
		let y = 50 + radius * Math.cos(hue * Math.PI / 180);
		elements.push(<div key={i} className='colorwheel_color' style={{left: x+'%', top: y+'%'}}>
			<DyeRectangle className='colorwheel_color_rect' key={i}
				rgb={dye[mat].rgb} text={dye.name}
				link={dye.name}
			/>
		</div>);
	}

	return <div className='colorwheel'>
		<div className='colorwheel_help'><p>
			This colorwheel attempts to show 11 different
			dyes across the hue spectrum,<br />
			but with similar brightness and saturation.<br />
			<br />
			They should go well together for your new color scheme!
		</p></div>
		{elements}
	</div>;
}
