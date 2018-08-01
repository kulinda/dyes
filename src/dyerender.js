import CanvasComponent from './canvas.js';

// if these imports fail, see src/gl-matrix/readme.txt
import * as vec4 from './gl-matrix/vec4.js'

import smudge from './textures/59599.png';
import shroom_color from './textures/1301362.png';
import shroom_mask0 from './textures/1301578.png';
import shroom_mask1 from './textures/1301580.png';
//import flower from './textures/1301346.png';
import cauldron from './textures/455005.png';


function createImage(url) {
	let img = document.createElement('img');
	img.src = url;
	return img;
}

const textures = {
	smudge: createImage(smudge),
	shroom_color: createImage(shroom_color),
	shroom_mask0: createImage(shroom_mask0),
	shroom_mask1: createImage(shroom_mask1),
	//flower: createImage(flower),
	cauldron: createImage(cauldron),
};


export default class DyeRender extends CanvasComponent {
	paint(ctx) {
		let texture = this.waitForImage(textures[this.props.texture || 'smudge']);
		if (!texture)
			return;

		let mask = null;
		if (this.props.mask)
			mask = this.waitForImage(textures[this.props.mask]);

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
