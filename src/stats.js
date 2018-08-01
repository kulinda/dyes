import React from 'react';

import CanvasComponent from './canvas.js';
import {DYE_CATEGORIES, MATERIAL_IDS} from './constants.js';

// Hue
let by_hue = new WeakMap();
function get_by_hue(dyes) {
	if (!by_hue.has(dyes)) {
		let buckets = new Array(360);
		for (let i = 0; i < 360; i++)
			buckets[i] = 0;
		for (let id in dyes) {
			let dye = dyes[id];
			for (let mat of MATERIAL_IDS) {
				let h = Math.round(dye[mat].hue) % 360;
				buckets[h] += 1;
				//buckets[(h + 1) % 360] += 0.5;
				//buckets[(h + 359) % 360] += 0.5;
			}
		}
		by_hue.set(dyes, buckets);
	}
	return by_hue.get(dyes);
}

class ByHue extends CanvasComponent {
	paint(ctx) {
		let buckets = get_by_hue(this.props.dyes);
		let max = Math.max.apply(null, buckets);

		let w = ctx.canvas.width;
		let h = ctx.canvas.height;
		ctx.clearRect(0, 0, w, h);
		for (let x = 0; x < w; x++) {
			let hue = Math.floor(buckets.length * x / w); // 0 .. 359
			let v = buckets[hue];
			ctx.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
			ctx.beginPath();
			let y = Math.round(v / max * (h - 10));
			ctx.moveTo(x + 0.5, h - 0.5);
			ctx.lineTo(x + 0.5, h - 10.5 - y);
			ctx.stroke();
		}
	}
}

// Contrast
let by_contrast = new WeakMap();
function get_by_contrast(dyes) {
	if (!by_contrast.has(dyes)) {
		let buckets = new Array(100);
		for (let i = 0; i < buckets.length; i++)
			buckets[i] = 0;
		for (let id in dyes) {
			let dye = dyes[id];
			for (let mat of MATERIAL_IDS) {
				// 0 -> 0, 1 -> 50, 2 -> 100
				let c = Math.floor(dye[mat].contrast * buckets.length / 2);
				if (c < 0 || c >= buckets.length)
					console.log('Contrast out of bounds', dye.name, dye[mat].contrast);
				else
					buckets[c] += 1;
			}
		}
		by_contrast.set(dyes, buckets);
	}
	return by_contrast.get(dyes);
}

class ByContrast extends CanvasComponent {
	paint(ctx) {
		let buckets = get_by_contrast(this.props.dyes);
		let max = Math.max.apply(null, buckets);

		let w = ctx.canvas.width;
		let h = ctx.canvas.height;
		ctx.clearRect(0, 0, w, h);
		for (let x = 0; x < w; x++) {
			let c = Math.floor(buckets.length * x / w);
			let v = buckets[c];
			let y = Math.round(v / max * (h - 10));

			let mult = c / 50;
			let lighter = (128 + 64 * mult);
			let darker = (128 - 64 * mult);
			ctx.strokeStyle = `rgb(${darker},${darker},${darker})`;
			ctx.beginPath();
			ctx.moveTo(x + 0.5, h - 0.5);
			ctx.lineTo(x + 0.5, h - 5.5);
			ctx.stroke();
			ctx.strokeStyle = `rgb(${lighter},${lighter},${lighter})`;
			ctx.beginPath();
			ctx.moveTo(x + 0.5, h - 5.5);
			ctx.lineTo(x + 0.5, h - 10.5 - y);
			ctx.stroke();
		}
	}
}

// Luminance
// https://en.wikipedia.org/wiki/Luminance_%28relative%29
let by_luminance = new WeakMap();
function get_by_luminance(dyes) {
	if (!by_luminance.has(dyes)) {
		let buckets = new Array(100);
		for (let i = 0; i < buckets.length; i++)
			buckets[i] = 0;
		for (let id in dyes) {
			let dye = dyes[id];
			for (let mat of MATERIAL_IDS) {
				let rgb = dye[mat].rgb;
				let lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
				let l = Math.floor(lum / 256 * buckets.length);
				if (l < 0 || l >= buckets.length)
					console.log('Luminance out of bounds', dye.name, l, lum);
				else
					buckets[l] += 1;
			}
		}
		by_luminance.set(dyes, buckets);
	}
	return by_luminance.get(dyes);
}

class ByLuminance extends CanvasComponent {
	paint(ctx) {
		let buckets = get_by_luminance(this.props.dyes);
		let max = Math.max.apply(null, buckets);

		let w = ctx.canvas.width;
		let h = ctx.canvas.height;
		ctx.clearRect(0, 0, w, h);
		for (let x = 0; x < w; x++) {
			let c = Math.floor(buckets.length * x / w);
			let v = buckets[c];
			let y = Math.round(v / max * (h - 10));

			let lum = Math.floor(c * 200 / buckets.length) + 20;
			ctx.strokeStyle = `rgb(${lum},${lum},${lum})`;
			ctx.beginPath();
			ctx.moveTo(x + 0.5, h - 0.5);
			ctx.lineTo(x + 0.5, h - 10.5 - y);
			ctx.stroke();
		}
	}
}

// Other
function countByCategory(dyes, cat) {
	let count = 0;
	for (let id in dyes) {
		let dye = dyes[id];
		if (dye.categories.indexOf(cat) >= 0)
			count++;
	}
	return count;
}

export default class DyeStats extends React.Component {
	render() {
		let {dyes} = this.props;
		let exclusive = Object.keys(dyes).length - 1; // 'Dye Remover' has no category
		for (let i = 0; i < DYE_CATEGORIES.set.length - 1; i++)
			exclusive -= countByCategory(dyes, DYE_CATEGORIES.set[i]);
		return <div>
			<h1>Dye statistics</h1>
			There are {Object.keys(dyes).length} dyes, {exclusive} of which are exclusive.<br />
			<br />
			<h2>Dye Distribution by Hue</h2>
			<ByHue width={720} height={300} dyes={dyes} />
			<h2>Dye Distribution by Contrast</h2>
			<ByContrast width={720} height={300} dyes={dyes} />
			<h2>Dye Distribution by Luminance</h2>
			<ByLuminance width={720} height={300} dyes={dyes} />
		</div>;
	}
}
