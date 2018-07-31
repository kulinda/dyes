import React from 'react';

import DyeRectangle from './dyerectangle.js';

import {REFERENCE_MATERIAL, VISITED_LIST_LENGTH, VISITED_LIST_ENTRY_WIDTH} from './constants.js';

import './visited.css';


export default class VisitedDyeList extends React.Component {
	constructor(props) {
		super(props);

		this.visited_scroll_start = 0;
		this.visited_dyes = [false];
	}

	render() {
		let {dyes, selected_dye} = this.props;

		if (selected_dye !== false && this.visited_dyes.indexOf(selected_dye) === -1) {
			if (this.visited_dyes.length > VISITED_LIST_LENGTH) {
				this.visited_scroll_start++;
				let removed = this.visited_dyes.length - VISITED_LIST_LENGTH;
				this.visited_dyes = this.visited_dyes.slice(removed);
			}
			this.visited_dyes.push(selected_dye);
		}

		if (!dyes)
			return null;

		return <div className='visited_dye' style={{
			left: `calc(${-this.visited_scroll_start - 1} * ${VISITED_LIST_ENTRY_WIDTH})`
		}}>
			{this.visited_dyes.map((id, idx) => id === false ? null : <div key={id} className='visited_dye_inner' style={{
				left: `calc(${this.visited_scroll_start + idx} * ${VISITED_LIST_ENTRY_WIDTH})`,
				width: VISITED_LIST_ENTRY_WIDTH
			}}>
				<DyeRectangle rgb={dyes[id][REFERENCE_MATERIAL].rgb} link={dyes[id].name} text={dyes[id].name} />
			</div>)}
		</div>;
	}
}
