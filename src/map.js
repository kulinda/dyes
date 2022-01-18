import * as React from 'react';

import DyeRectangle from './dyerectangle';
import DyeRender from './dyerender';

import './map.css';
import RangeInput from './rangeinput.js';

export default function DyeMap(props) {
	let {dyes} = props;

	let ref = React.useRef(null);
	let a_ref = React.useRef(null);

	let [mat, setMat] = React.useState('cloth');
	let [hovered, setHovered] = React.useState(null);
	let [zoom, setZoom] = React.useState([0, 0, 0.5]);
	let [saturation, setSaturation] = React.useState([-100, 100]);
	let [contrast, setContrast] = React.useState([-100, 100]);

	let dots = React.useMemo(() => {
		let min_sat = saturation[0] / 100 + 1;
		let max_sat = saturation[1] / 100 + 1;
		let min_con = contrast[0] / 100 + 1;
		let max_con = contrast[1] / 100 + 1;
		let dots = [];
		for (let did in dyes) {
			let dye = dyes[did];
			let m = dye[mat];
			if (!m)
				continue;

			let { saturation, contrast } = m;
			if (saturation < min_sat || saturation > max_sat || contrast < min_con || contrast > max_con)
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
				b: b + 0.02, // they aren't centered very well, this is a hack to fix that
				zIndex: Math.floor(L * 1000),
			});
		}
		dots.sort((a, b) => a.zIndex - b.zIndex);
		return dots;
	}, [dyes, mat, saturation, contrast]);

	React.useEffect(() => {
		function wheel(e) {
			let target = e.currentTarget;
			if (!target || target.className !== 'dyemap_canvas')
				return;
	
			e.preventDefault();

			let rect = target.getBoundingClientRect();
			let { width, height } = rect;
			let smaller = Math.min(width, height);
			let delta = e.deltaY;
			let mousex = (e.clientX - rect.left - width/2) / smaller;
			let mousey = (e.clientY - rect.top - height/2) / smaller;

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
		let smaller = Math.min(width, height);
		canvas.width = width;
		canvas.height = height;

		ctx.clearRect(0, 0, width, height);
		
		let range = zoom[2];

		for (let dot of dots) {
			let { csscolor, size, a, b } = dot;

			let x = (a - zoom[0]) / range * smaller + width/2;
			let y = (b - zoom[1]) / range * smaller + height/2;

			let radius = smaller/25 * size / 2;

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

		function findDyeUnderCursor(e) {
			let rect = canvas.getBoundingClientRect();
			let { width, height } = rect;
			let smaller = Math.min(width, height);
			let mousex = e.clientX - rect.left;
			let mousey = e.clientY - rect.top;

			let best_match = null;
			for (let dot of dots) {
				let { dye, size, a, b } = dot;

				let x = (a - zoom[0]) / range * smaller + width/2;
				let y = (b - zoom[1]) / range * smaller + height/2;

				let dist = sq(mousex - x) + sq(mousey - y);
				let radius = smaller/25 * size / 2;
				if (dist < sq(radius))
					best_match = {
						id: dot.id,
						dye: dot.dye
					};
			}

			return best_match;
		}
		function pointermove(e) {
			let match = findDyeUnderCursor(e);
			setHovered(match ? match.id : null);
		}

		let options = {
			capture: true,
			passive: true,
		};
		canvas.addEventListener('pointermove', pointermove, options);
		return () => {
			canvas.removeEventListener('pointermove', pointermove, options);
		}
	}, [dots, zoom]);

	let hdye = hovered ? dyes[hovered] : null;
	let href = hdye ? '#dye/' + encodeURIComponent(hdye.name.replace(' ', '_')) : undefined;

	return <div className='content_fw dyemap_container' style={{textAlign: 'center'}}>
		<div className='dyemap_top'>
			{hdye ? <div className='dyemap_hover'>
				<DyeRender texture='shroom_color' matrix={hdye[mat].matrix} /><DyeRender matrix={hdye[mat].matrix} /><DyeRender texture='cauldron' matrix={hdye[mat].matrix} /><br />
				<DyeRectangle rgb={hdye[mat].rgb} text={hdye.name} /><br />
			</div> : <div>
				<h2>Map of all Dyes</h2>
				Hover over dyes for a preview, click a dye to see details.<br />
				Use mouse wheel to zoom, use these sliders to filter.<br />
				<table className='dyemap_filter'><tbody>
					<tr>
						<td>Saturation</td>
						<td><RangeInput min={-100} max={100} dist={10} value={saturation} setValue={setSaturation} /></td>
					</tr>
					<tr>
						<td>Contrast</td>
						<td><RangeInput min={-100} max={100} dist={10} value={contrast} setValue={setContrast} /></td>
					</tr>
				</tbody></table>
			</div>}
		</div>
		<div className='dyemap'>
			<a href={href} ref={a_ref}><canvas className='dyemap_canvas' ref={ref} /></a>
		</div>
	</div>;
}

function sq(a) {
	return a*a;
}