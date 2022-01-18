/*
Minimum values:
{
  "brightness": -68,
  "contrast": 0.5,
  "hue": 0,
  "saturation": 0,
  "lightness": 0
}
Maximum values:
{
  "brightness": 127,
  "contrast": 1.99219,
  "hue": 360,
  "saturation": 1.99219,
  "lightness": 1.99219
}

There are ~400 dyes

Base color is rgb(128, 26, 26) ~= hsl(0, 66.2%, 30.2%)
*/


// Helper for the hue, due to the wraparound
function huediff(a, b) {
	let diff = Math.abs(a.hue - b.hue);
	if (diff > 180)
		diff = 360 - diff;

	return diff / 180; // returns 0 .. 1
}
function lumdiff(a, b) {
	let ld = Math.abs(a.lightness - b.lightness) / 2;
	let bd = Math.abs(a.brightness - b.brightness) / 128;
	let cd = Math.abs(a.contrast - b.contrast) / 2;
	return (ld + bd + cd) / 3;
}

// Differences of the modifiers, with various weights
function hsl_h_diff(a, b) {
	// Get the differences, normalized to 0 .. 1
	let hd = huediff(a, b);
	let sd = Math.abs(a.saturation - b.saturation) / 2;
	let ld = lumdiff(a, b);

	return hd + (sd + ld) / 1000;
}
function hsl_hs_diff(a, b) {
	// Get the differences, normalized to 0 .. 1
	let hd = huediff(a, b);
	let sd = Math.abs(a.saturation - b.saturation) / 2;
	let ld = lumdiff(a, b);

	return hd + sd / 2 + ld / 1000;
}

function hsl_colorwheel_diff(a, b) {
	// Get the differences, normalized to -1 .. 1
	let hd = huediff(a, b);
	let sd = Math.abs(a.saturation - b.saturation) / 2;
	let ld = lumdiff(a, b);

	return (hd + sd + ld) / 3;
}

// comparisons of the reference color
function rgbdiff(a, b) {
	let diff = 0;
	for (let i = 0; i < 3; i++) {
		let d = a.rgb[i] - b.rgb[i]
		diff += d*d;
	}

	return diff;
}

function oklabdiff(a, b) {
	let diff = 0;
	diff += Math.abs(a.oklab.L - b.oklab.L);// / 2; // The range of L is 0..1, while the others are -0.25..0.25
	diff += Math.abs(a.oklab.a - b.oklab.a);
	diff += Math.abs(a.oklab.b - b.oklab.b);

	return diff;
}

const funcs = {
	rgb: rgbdiff,
	oklab: oklabdiff,
	hue: hsl_h_diff,
	huesat: hsl_hs_diff,
	hsl_colorwheel: hsl_colorwheel_diff,
};

function compare(a_score, a_id, b_score, b_id) {
	if (a_score !== b_score)
		return a_score - b_score;
	return a_id - b_id;
}

export default function getSimilarDyes(dyes, mat, reference, metric, count) {
	// The initial implementation would map the dyes into a score array, sort the array and slice the top elements.
	// This turned out to be somewhat slow for >500 dyes.

	// Instead, we're now implementing a partial sort.
	// We're introducing no object allocations except the returned data.
	// Runtime is O(n*k) instead of O(n log(n)) due to insertion sort,
	// but for practical values (small counts) this turns out to be twice as fast as the naive implementation.

	// We sort by id on equal score to guarantee stability.
	// When the user presses 'show more', the dyes should not move around.

	let _scorefunc = funcs[metric];
	if (!_scorefunc)
		throw new Error('Unknown metric', metric);
	
	function scorefunc(mat) {
		if (mat === reference)
			return -1;
		return _scorefunc(reference, mat);
	}

	let candidates = [];
	let idx = 0;
	for (let id in dyes) {
		let dye = dyes[id];
		let score = scorefunc(dye[mat]);

		// insert it at the correct point into the candidate list
		// if the candidate list isn't full, always insert.
		let insertpos = idx < count ? idx : false;
		for (let k = Math.min(idx, count) - 1; k >= 0; k--) {
			if (compare(candidates[k].score, candidates[k].dye.id, score, dye.id) > 0)
				insertpos = k;
			else
				break;
		}
		idx++;
		if (insertpos === false)
			continue;

		// Shuffle everything one to the back
		let last = Math.min(idx, count) - 1;
		let savedobj = candidates[last];
		for (let k = last; k > insertpos; k--) {
			candidates[k] = candidates[k - 1];
		}
		// Insert the new candidate, potentially reusing the object of the deleted candidate
		let newcandidate = savedobj;
		if (newcandidate) {
			newcandidate.dye = dye;
			newcandidate.score = score;
		}
		else {
			newcandidate = {
				dye: dye,
				score: score
			};
		}
		candidates[insertpos] = newcandidate;
	}

	return candidates;
}
