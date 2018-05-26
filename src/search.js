import React from 'react';

import SimilarDyeList from './similarlist.js';
import DyeRectangle from './dyerectangle.js';

import {MATERIAL_NAMES, MATERIAL_IDS} from './constants.js';

const RE_HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/;
const RE_RGB = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;

function parseColor(str) {
	str = str.toLowerCase();
	let match_hex = str.match(RE_HEX);
	if (match_hex) {
		return [
			parseInt(match_hex[1], 16),
			parseInt(match_hex[2], 16),
			parseInt(match_hex[3], 16),
		];
	}
	let match_rgb = str.match(RE_RGB);
	if (match_rgb) {
		return [
			parseInt(match_rgb[1], 10),
			parseInt(match_rgb[2], 10),
			parseInt(match_rgb[3], 10),
		];
	}
	return false;
}

export default class DyeSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search: props.rgb ? `rgb(${props.rgb})`: '',
			material: props.material ? props.material : MATERIAL_IDS[0]
		};
		this.onChangeSearch = this.onChange.bind(this, 'search');
		this.onChangeMaterial = this.onChange.bind(this, 'material');
	}

	onChange(key, e) {
		let obj = {};
		obj[key] = e.target.value;
		this.setState(obj);
	}

	render() {
		let {dyes} = this.props;
		let {search, material} = this.state;

		let rgb = parseColor(search);
		if (rgb)
			window.location.hash = '#search/' + material + '/' + rgb.join(',');

		return <div>
			Search similar dyes:
			<input type="text" onChange={this.onChangeSearch} value={search} placeholder='Accepted formats: #rrggbb or rgb(r, g, b)' /><br />
			<select onChange={this.onChangeMaterial} value={material}>
				{MATERIAL_NAMES.map((name, idx) => {
					let mat = MATERIAL_IDS[idx];
					return <option key={mat} value={mat}>{name}</option>;
				})}
			</select>
			<br />
			<br />
			{rgb === false
				? 'Hint: Looking for a dye to match your hair or weapon? Make a Screenshot in a well-lit area, open it in paint and use the color picker to get the RGB values!'
				: <div>
					<DyeRectangle rgb={rgb} text='Your color' />
					<SimilarDyeList
						mat={material} dyes={dyes} reference={{rgb: rgb}}
						metric='rgb'
						count={10}
					/>
				</div>
			}
		</div>;
	}
}
