
export function signed(num) {
	num = Math.round(num * 100) / 100;
	let s = '' + num;
	if (num >= 0)
		s = '+' + s;
	return s;
}

function percent(v) {
	return signed((v - 1) * 100) + '%';
}

function none(v) {
	return '' + v;
}

const formats = {
	brightness: signed,
	contrast: percent,
	hue: none,
	saturation: percent,
	lightness: percent,
}

export default function formatDyeProperty(property, value) {
	return (formats[property] || none)(value);
}