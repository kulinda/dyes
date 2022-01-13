
import * as React from 'react';
import './rangeinput.css';

export default function RangeInput(props) {
	let {min, max, dist = 1, value, setValue} = props;

	let range = max - min;

	let left0 = (value[0] - min) / range * 100;
	let left1 = (value[1] - min) / range * 100;

	function onPointerDown(e, idx) {
		e.preventDefault();

		let target = e.currentTarget;
		let container = target.parentElement;
		let pointerId = e.pointerId;

		function move(e) {
			if (e.pointerId !== pointerId)
				return;
			
			let { left, width } = container.getBoundingClientRect();
			let fraction = (e.clientX - left) / width;
			let value = Math.round(min + fraction * range);

			setValue((prev) => {
				let next = [...prev];
				if (idx === 0)
					value = Math.min(next[1] - dist, value);
				else
					value = Math.max(next[0] + dist, value);
				value = Math.min(max, Math.max(min, value));
				if (next[idx] === value)
					return prev;
				next[idx] = value;
				return next;
			});
		}
		let ended = false;
		function end(e) {
			if (e.pointerId !== pointerId)
				return;
			if (ended)
				return;
			ended = true;

			target.removeEventListener('pointermove', move);
			target.removeEventListener('pointercancel', end);
			target.removeEventListener('pointerup', end);	
		}

		target.addEventListener('pointermove', move);
		target.addEventListener('pointercancel', end);
		target.addEventListener('pointerup', end);
		target.setPointerCapture(e.pointerId);
	}

	return <div className='rangeinput'>
		<div className='horiz_bg' />
		<div className='horiz_active' style={{left: left0 + '%', right: (100 - left1) + '%'}} />
		<div className='rangethumb' style={{left: left0 + '%'}} onPointerDown={(e) => onPointerDown(e, 0)} />
		<div className='rangethumb' style={{left: left1 + '%'}} onPointerDown={(e) => onPointerDown(e, 1)} />
	</div>;
}
