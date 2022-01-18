import * as React from 'react';

import getSimilarDyes from './similarity.js';

import DyeRectangle from './dyerectangle.js';
import DyeRender from './dyerender.js';

import './similarlist.css';

const COUNT_PER_PAGE = 10;
const MAX_COUNT = 50;

export default function SimilarDyeList(props) {
	let [count, setCount] = React.useState(COUNT_PER_PAGE);

	function more() {
		setCount((prev) => Math.min(MAX_COUNT, prev + COUNT_PER_PAGE));
	}

	let {dyes, mat, reference, metric} = props;

	let candidates = getSimilarDyes(dyes, mat, reference, metric, count);

	let left = [];
	let middle = [];
	let right = [];
	for (let i = 0; i < candidates.length; i++) {
		let dye = candidates[i].dye;
		let m = dye[mat];
		middle.push(<DyeRectangle className='slist_rect' key={i} rgb={m.rgb} text={dye.name} link={dye.name} />);
		let target = i % 2 ? right : left;
		target.push(<div key={i} className='slist_row'>
			<DyeRender matrix={m.matrix} /><DyeRender texture='cauldron' matrix={m.matrix} />
		</div>);
	}

	return <div>
		<div className='slist_outer'>
			<div className='slist_column left'>{left}</div>
			<div className='slist_column middle'>{middle}</div>
			<div className='slist_column right'>{right}</div>
		</div>
		{count < MAX_COUNT ? <button onClick={more}>show more</button> : null}
	</div>;
}
