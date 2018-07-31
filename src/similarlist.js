import React from 'react';

import getSimilarDyes from './similarity.js';

import DyeRectangle from './dyerectangle.js';
import DyeRender from './dyerender.js';

import './similarlist.css';

const COUNT_PER_PAGE = 10;

export default class SimilarDyeList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			count: COUNT_PER_PAGE
		};
		this.more = this.more.bind(this);
	}

	more() {
		this.setState(state => {return {
			count: state.count + COUNT_PER_PAGE
		}});
	}

	render() {
		let {dyes, mat, reference, metric} = this.props;
		let {count} = this.state;

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
			<button onClick={this.more}>show more</button>
		</div>;
	}
}
