
// Based on code written by Cliff Spradlin of ArenaNet.
// http://jsfiddle.net/cliff/jQ8ga/

// if these imports fail, see src/gl-matrix/readme.txt
import * as mat4 from './gl-matrix/mat4.js'
import * as vec4 from './gl-matrix/vec4.js'


export function getDyeMatrix(material) {
	let brightness = material.brightness / 128;
	let contrast = material.contrast;
	let hue = material.hue * Math.PI / 180; // convert to radians
	let saturation = material.saturation;
	let lightness = material.lightness;

	// 4x4 identity matrix
	let matrix = mat4.create();
	let mult = mat4.create();

	if (brightness !== 0 || contrast !== 1) {
		// process brightness and contrast
		let t = 128 * (2 * brightness + 1 - contrast);
		mat4.set(mult,
			contrast, 0, 0, t,
			0, contrast, 0, t,
			0, 0, contrast, t,
			0, 0, 0, 1
		);
		mat4.transpose(mult, mult);
		mat4.multiply(matrix, mult, matrix);
	}

	if (hue !== 0 || saturation !== 1 || lightness !== 1) {
		// transform to HSL
		mat4.set(mult,
			 0.707107, 0.0,      -0.707107, 0,
			-0.408248, 0.816497, -0.408248, 0,
			 0.577350, 0.577350,  0.577350, 0,
			 0,        0,         0,        1
		);
		mat4.transpose(mult, mult);
		mat4.multiply(matrix, mult, matrix);

		// process adjustments
		let cosHue = Math.cos(hue);
		let sinHue = Math.sin(hue);
		mat4.set(mult,
			cosHue * saturation,  sinHue * saturation, 0,         0,
			-sinHue * saturation, cosHue * saturation, 0,         0,
			0,                    0,                   lightness, 0,
			0,                    0,                   0,         1
		);
		mat4.transpose(mult, mult);
		mat4.multiply(matrix, mult, matrix);

		// transform back to RGB
		mat4.set(mult,
			 0.707107, -0.408248, 0.577350, 0,
			        0,  0.816497, 0.577350, 0,
			-0.707107, -0.408248, 0.577350, 0,
			 0,        0,         0,        1
		);
		mat4.transpose(mult, mult);
		mat4.multiply(matrix, mult, matrix);
	}

	return matrix;
}


// Note: this method is slow due to excessive allocations. See dyerender.js for a faster inline variant.
export function applyDyeMatrix(matrix, r, g, b) {
	// apply the color transformation
	let vin = vec4.fromValues(b, g, r, 1)
	let vout = vec4.create();
	vec4.transformMat4(vout, vin, matrix);

	// round and clamp the values
	let ob = Math.floor(Math.max(0, Math.min(255, Math.round(vout[0]))));
	let og = Math.floor(Math.max(0, Math.min(255, Math.round(vout[1]))));
	let or = Math.floor(Math.max(0, Math.min(255, Math.round(vout[2]))));

	return {
		r: or,
		g: og,
		b: ob
	};
}
