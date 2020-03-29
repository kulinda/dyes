import React from 'react';

import CanvasComponent from './canvas.js';
import SimilarDyeList from './similarlist.js';
import DyeRectangle from './dyerectangle.js';

import {MATERIAL_NAMES, MATERIAL_IDS} from './constants.js';

import './search.css';

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

function colorToString(r, g, b) {
	return `rgb(${r},${g},${b})`;
}

class ImageMouseOver extends CanvasComponent {
	constructor(props) {
		super(props);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this.onClick = this.onClick.bind(this);
	}
	getColorAtPosition(e) {
		let ctx = this.ctx;
		let img = this.waitForImage(this.props.img);
		if (!this.ctx || !img)
			return null;
		let rect = ctx.canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		x = (x / rect.width) * img.width;
		y = (y / rect.height) * img.height;

		let pixels = ctx.getImageData(x, y, 1, 1).data;
		let r = pixels[0];
		let g = pixels[1];
		let b = pixels[2];
		return colorToString(r, g, b);
	}
	onClick(e) {
		let color = this.getColorAtPosition(e);
		console.log(e, color);
		if (color)
			this.props.setColor(color);
	}
	onMouseMove(e) {
		let color = this.getColorAtPosition(e);
		if (color)
			this.props.setColorMO(color);
	}
	onMouseOut(e) {
		this.props.setColorMO(null);
	}
	paint(ctx) {	
		let img = this.waitForImage(this.props.img);
		if (!img) {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			return;
		}

		let w = img.width;
		let h = img.height;
		ctx.canvas.width = w;
		ctx.canvas.height = h;

		ctx.drawImage(img, 0, 0, w, h);
	}
}

export default class DyeSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			material: props.material ? props.material : MATERIAL_IDS[0],
			search: props.rgb ? `rgb(${props.rgb})`: '',
			search_mo: null,
			img: null,
		};
		this.onChangeSearch = this.onChange.bind(this, 'search');
		this.onChangeSearchMO = this.onChangeSearchMO.bind(this);
		this.onChangeMaterial = this.onChange.bind(this, 'material');
		this.onChangeFile = this.onChangeFile.bind(this);
	}

	onChange(key, e) {
		let obj = {};
		obj[key] = e.target ? e.target.value : e;
		this.setState(obj);
	}

	onChangeSearchMO(color) {
		this.setState({
			search_mo: color
		});
	}

	onChangeFile(e) {
		let file = e.target.files[0];
		e.target.value = null;

		if (file && file.type.match(/image\/.*/)) {
			let img = document.createElement('img');
			img.src = URL.createObjectURL(file);
			this.setState({
				img: img,
			});
			return;
		}

		this.setState({
			img: null
		});
	}

	render() {
		let {dyes} = this.props;
		let {material, img} = this.state;
		let search = this.state.search_mo || this.state.search;

		let rgb = parseColor(search);
		if (rgb && !this.state.search_mo)
			window.location.hash = '#search/' + material + '/' + rgb.join(',');

		if (!rgb && img) {
			rgb = [0, 0, 0];
		}

		return <div>
			<div className='searchselection'>
				<div>
					<label>Material:</label>
					<select onChange={this.onChangeMaterial} value={material}>
						{MATERIAL_NAMES.map((name, idx) => {
							let mat = MATERIAL_IDS[idx];
							return <option key={mat} value={mat}>{name}</option>;
						})}
					</select>
				</div>
				<div>
					<label>Search dyes by RGB:</label>
					<input type="text" onChange={this.onChangeSearch} value={search} placeholder='Accepted formats: #rrggbb or rgb(r, g, b)' /><br />
				</div>
				<div>
					<label>Search dyes by Screenshot:</label>
					<div>
						<input id='dye_search_upload' type="file" onChange={this.onChangeFile} value="" /><br />
						<small>No worries - the file won't leave your computer.</small>
					</div>
				</div>
			</div>
			<br />
			{img ? <div className='screenshot'><ImageMouseOver img={img} setColor={this.onChangeSearch} setColorMO={this.onChangeSearchMO} /></div> : null}
			<div className='searchresult'>
				{rgb ? <div>
					<DyeRectangle rgb={rgb} text='Your color' />
					<SimilarDyeList
						mat={material} dyes={dyes} reference={{rgb: rgb}}
						metric='rgb'
						count={10}
					/>
				</div> : null}
			</div>
		</div>;
	}
}
