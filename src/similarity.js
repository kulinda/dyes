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
	//diff += Math.abs(a.oklab.L - b.oklab.L);
	diff += Math.abs(a.oklab.a - b.oklab.a);
	diff += Math.abs(a.oklab.b - b.oklab.b);

	return diff;
}

function huediff(a, b) {
	let diff = Math.abs(a.hue - b.hue);
	if (diff > 180)
		diff = 360 - diff;

	return diff;
}

function hsldiff(a, b) {
	let hdiff = huediff(a, b);
	hdiff /= 5;

	let sdiff = (a.saturation - b.saturation) / 0.2;

	let ldiff = (a.lightness - b.lightness) / 0.2;

	let diff = hdiff * hdiff + sdiff * sdiff + ldiff * ldiff;

	return diff;
}

function hslbdiff(a, b) {
	// Hue
	let hdiff = huediff(a, b);
	hdiff /= 5; // range is 180, ~5 is ok, max: 36

	// Saturation
	let sdiff = (a.saturation - b.saturation) / 0.2; // range is 2, 0.2 is ok, max: 10

	// Lightness and Brightness
	let ldiff = (a.lightness - b.lightness) / 0.2; // range is 2, 0.2 is ok, max: 10
	let bdiff = (a.brightness - b.brightness) / 20; // range is ~200, 20 is ok, max: 10
	let lbdiff = (Math.abs(ldiff) + Math.abs(bdiff)) / 2; // max: 10

	let diff = hdiff * hdiff + sdiff * sdiff + lbdiff * lbdiff;

	return diff;
}


const funcs = {
	rgb: rgbdiff,
	oklab: oklabdiff,
	hue: huediff,
	hsl: hsldiff,
	hslb: hslbdiff,
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

	console.time('getSimilar');
	let scorefunc = funcs[metric].bind(null, reference);

	let candidates = new Array(count);
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

	if (idx < count)
		candidates = candidates.slice(0, idx);

	console.timeEnd('getSimilar');
	return candidates;
}
