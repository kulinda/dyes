import React from 'react';

import {MATERIAL_IDS} from './constants.js';
import { navigateToDye } from './dyelist';
import DyeRectangle from './dyerectangle';
import DyeRender from './dyerender';

import './map.css';

export default function DyeMap(props) {
	let {dyes} = props;

	let ref = React.useRef(null);

	let [mat, setMat] = React.useState('cloth');
	let [hovered, setHovered] = React.useState(null);
	let [zoom, setZoom] = React.useState([0, 0, 0.5]);

	let dots = React.useMemo(() => {
		let dots = [];
		for (let did in dyes) {
			let dye = dyes[did];
			let m = dye[mat];
			if (!m)
				continue;

			// The range of oklab's a and b is not documented
			// but, experimentally, they're somewhere between -0.25 and 0.25
			// while L is between 0 and 1
			let {a, b, L} = m.oklab;

			dots.push({
				id: did,
				dye: dye,
				csscolor: 'rgb(' + m.rgb.join(', ') + ')',
				size: 2 * sq(1.0 - 0.6 * L),
				a: a,
				b: b,
				zIndex: Math.floor(L * 1000),
			});
		}
		dots.sort((a, b) => a.zIndex - b.zIndex);
		return dots;
	}, [dyes, mat]);

	React.useEffect(() => {
		function wheel(e) {
			let target = e.currentTarget;
			if (!target || target.className !== 'dyemap_canvas')
				return;
	
			e.preventDefault();

			let rect = target.getBoundingClientRect();
			let delta = e.deltaY;
			let mousex = ((e.clientX - rect.left) / rect.width) - 0.5;
			let mousey = ((e.clientY - rect.top) / rect.height) - 0.5;

			setZoom((prev) => {
				let [cx, cy, range] = prev;

				let range_new = delta < 0 ? range / 1.5 : range * 1.5;
				range_new = Math.min(0.5, Math.max(0.01, range_new));

				// these are the a/b values the mouse is pointing at
				let a = cx + mousex * range;
				let b = cy + mousey * range;

				let cx_new = a - (mousex * range_new);
				let cy_new = b - (mousey * range_new);

				// make sure the centers are within the proper bounds
				let bb = 0.25 - range_new / 2;
				cx_new = Math.min(bb, Math.max(-bb, cx_new));
				cy_new = Math.min(bb, Math.max(-bb, cy_new));

				return [cx_new, cy_new, range_new];
			});
		}

		let e = ref.current;
		if (!e)
			return;
		let options = {
			capture: true,
			passive: false,
		};
		e.addEventListener('wheel', wheel, options);
		return () => {
			e.removeEventListener('wheel', wheel, options);
		}
	});

	React.useEffect(() => {
		let canvas = ref.current;
		if (!canvas)
			return;
		let ctx = canvas.getContext('2d');
		if (!ctx)
			return;
		
		let { width, height } = canvas.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;

		ctx.clearRect(0, 0, width, height);
		
		let range = zoom[2];
		let top = zoom[1] - range/2;
		let left = zoom[0] - range/2;

		for (let dot of dots) {
			let { csscolor, size, a, b } = dot;

			let x = (a - left) / range * width;
			let y = (b - top) / range * height;

			let radius = width/25 * size / 2;

			ctx.fillStyle = csscolor;
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI);
			ctx.fill();
		}
	}, [dots, zoom]);

	React.useEffect(() => {
		let canvas = ref.current;
		if (!canvas)
			return;

		let range = zoom[2];
		let top = zoom[1] - range/2;
		let left = zoom[0] - range/2;

		function findDyeUnderCursor(e) {
			e.preventDefault();

			let rect = canvas.getBoundingClientRect();
			let { width, height } = rect;
			let mousex = e.clientX - rect.left;
			let mousey = e.clientY - rect.top;

			let best_match = null;
			for (let dot of dots) {
				let { dye, size, a, b } = dot;

				let x = (a - left) / range * width;
				let y = (b - top) / range * height;

				let dist = sq(mousex - x) + sq(mousey - y);
				let radius = width/25 * size / 2;
				if (dist < sq(radius))
					best_match = {
						id: dot.id,
						dye: dot.dye
					};
			}

			return best_match;
		}
		function mousemove(e) {
			let match = findDyeUnderCursor(e);
			setHovered(match ? match.id : null);
		}
		function click(e) {
			let match = findDyeUnderCursor(e);
			if (!match)
				return;
			
			navigateToDye(match.dye);
		}

		let options = {
			capture: true,
			passive: true,
		};
		canvas.addEventListener('mousemove', mousemove, options);
		canvas.addEventListener('click', click, options);
		return () => {
			canvas.removeEventListener('mousemove', mousemove, options);
			canvas.removeEventListener('click', click, options);
		}
	}, [dots, zoom]);

	let hdye = hovered ? dyes[hovered] : null;

	return <div style={{textAlign: 'center'}}>
		<h1>A map of all the dyes</h1>
		<div className='dyemap'>
			<canvas className='dyemap_canvas' ref={ref} />
		</div>
		{hdye ? <div className='dyemap_hover'>
			<DyeRectangle rgb={hdye[mat].rgb} text={hdye.name} /><br />
			<DyeRender texture='shroom_color' matrix={hdye[mat].matrix} /><DyeRender matrix={hdye[mat].matrix} /><DyeRender texture='cauldron' matrix={hdye[mat].matrix} />
		</div> : <div><br />Hover over dyes to see details, use mouse wheel to zoom.</div>}
	</div>;
}

function sq(a) {
	return a*a;
}