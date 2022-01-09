import CanvasComponent from './canvas.js';

import * as vec4 from 'gl-matrix/esm/vec4.js'

function createImage(url, crossorigin) {
	let img = document.createElement('img');
	if (crossorigin)
		img.crossOrigin = 'anonymous';
	img.src = url;
	return img;
}

const named_textures = {
	// smudge - background 1
	'smudge': 'https://render.guildwars2.com/file/936BEB492B0D2BD77307FCB10DBEE51AFB5E6C64/59599.png',
	// shroom - foreground 206
	'shroom_color': 'https://render.guildwars2.com/file/7558BC02ED4FA7987642029FD2A89EAD09431105/1301362.png',
	'shroom_mask0': 'https://render.guildwars2.com/file/00E61FD649629440D040B9AC2CEE2A2DC07B5464/1301578.png',
	'shroom_mask1': 'https://render.guildwars2.com/file/E7EA7D420E0EE56EC47BCE1F59A50EADC67393AC/1301580.png',
	// flower - foreground 199
	'flower': 'https://render.guildwars2.com/file/F7214A0215E21976E89E1708EF80716E0A68CCBC/1301346.png',
	// cauldron - foreground 93
	'cauldron': 'https://render.guildwars2.com/file/D0C010FAE925A3F04E9578EC717BDA0EBFF3011E/455005.png',
};

const textures = {
};


export default class DyeRender extends CanvasComponent {
	getTexture(name) {
		name = name || 'smudge';
		let url = named_textures[name] || name;
		if (!textures[url])
			textures[url] = createImage(url, true);
		return textures[url];
	}
	paint(ctx) {
		let texture = this.waitForImage(this.getTexture(this.props.texture));
		if (!texture)
			return;

		let mask = null;
		if (this.props.mask)
			mask = this.waitForImage(this.getTexture(this.props.mask));

		let matrix = this.props.matrix;
		let w = ctx.canvas.width;
		let h = ctx.canvas.height;

		let maskdata = null;
		if (mask) {
			ctx.clearRect(0, 0, w, h);
			ctx.drawImage(mask, 0, 0);
			maskdata = ctx.getImageData(0, 0, w, h).data;
		}

		ctx.clearRect(0, 0, w, h);
		ctx.drawImage(texture, 0, 0);

		if (matrix) {
			let imagedata = ctx.getImageData(0, 0, w, h);
			//ctx.clearRect(0, 0, w, h); // just in case.

			// We inline applyDyeMatrix for performance reasons.
			// We reuse these vectors to avoid allocations in the inner loop.
			// Benchmark:
			// applyDyeMatrix:        ~40
			// pre-allocated vectors: ~10
			// without clamping:       ~5
			// inline:               ~2-3
			let vin = vec4.create();
			let vout = vec4.create();

			let data = imagedata.data; // layout is rgba, rgba, ...
			for (let i = 0; i < data.length; i += 4) {
				if (maskdata) {
					// There is no documentation about the application of masks.
					// It seems obvious for fully transparent or fully opaque pixels, but the masks contain all shades.
					// I've decided to do a multiplication. It looks alright.
					data[i+3] = Math.round((data[i+3] / 255) * (maskdata[i+3] / 255) * 255);
				}
				vec4.set(vin, data[i+2], data[i+1], data[i], 1);
				vec4.transformMat4(vout, vin, matrix);
				// No need to round or clamp; assigning to the Uint8ClampedArray will do that automatically.
				data[i] = vout[2];
				data[i+1] = vout[1];
				data[i+2] = vout[0];
			}

			ctx.putImageData(imagedata, 0, 0);
		}
	}
}
