import React from 'react';

import DyeRectangle from './dyerectangle.js';
import DyeRender from './dyerender.js';
import SimilarDyeList from './similarlist.js';
import ColorWheel from './colorwheel.js';

import {MATERIAL_NAMES, MATERIAL_IDS} from './constants.js';


function signed(num) {
	num = Math.round(num * 100) / 100;
	let s = '' + num;
	if (num >= 0)
		s = '+' + s;
	return s;
}


export default class DyeDetails extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			section: false,
			material: false,
		};
	}

	navigate(section, material) {
		this.setState({
			section: section,
			material: material,
		});
	}

	render() {
		let {dyes, dye} = this.props;
		let {section, material} = this.state;

		return <div>
			<b>{dye.name}</b><br />
			{dye.id !== 1 ? <small><a href={'https://wiki.guildwars2.com/wiki/' + dye.name.replace(' ', '_') + '_Dye'} target='_blank'>GW2W</a></small> : null}<br/>
			<br />

			<table className='fw_inputs'><tbody>
			<tr>
				{MATERIAL_NAMES.map(mat => <th key={mat}>{mat}</th>)}
			</tr>
			<tr>
				{MATERIAL_IDS.map(mat => <td key={mat}>
					<DyeRectangle rgb={dye[mat].rgb} text={'rgb(' + dye[mat].rgb.join(', ') + ')'} /><br />
					<DyeRender matrix={dye[mat].matrix} /><DyeRender texture='cauldron' matrix={dye[mat].matrix} />
				</td>)}
			</tr>
			<tr><td colSpan={MATERIAL_IDS.length}>
				<button onClick={this.navigate.bind(this, 'details', '')}>Show details</button>
			</td></tr>
			<tr>
				{MATERIAL_IDS.map(mat => <td key={mat}>
					<button onClick={this.navigate.bind(this, 'similar_rgb', mat)}>Show similar dyes (RGB)</button><br />
					<button onClick={this.navigate.bind(this, 'similar_hsl', mat)}>Show similar dyes (HSL)</button><br />
					<button onClick={this.navigate.bind(this, 'similar_hue', mat)}>Show similar dyes (hue)</button><br />
					<button onClick={this.navigate.bind(this, 'colorwheel', mat)}>Show color wheel</button><br />
					<br />
				</td>)}
			</tr>

			{section === 'details' ? <tr>
				<th colSpan={MATERIAL_IDS.length}>Color Information</th>
			</tr> : null}
			{section === 'details' ? <tr>
				{MATERIAL_IDS.map(mat => {
					let d = dye[mat];
					return <td key={mat}>
						Brightness: {signed(d.brightness)}<br />
						Contrast: {signed((d.contrast - 1) * 100)}%<br />
						Hue: {d.hue}<br />
						Saturation: {signed((d.saturation - 1) * 100)}%<br />
						Lightness: {signed((d.lightness - 1) * 100)}%<br />
				</td>;})}
			</tr> : null}

			{section === 'similar_rgb' ? <tr>
				<th colSpan={MATERIAL_IDS.length}>Similar dyes (based on RGB), on {material}</th>
			</tr> : null}
			{section === 'similar_rgb' ? <tr><td colSpan={MATERIAL_IDS.length}>
				<SimilarDyeList
					mat={material} dyes={dyes} reference={false ? {rgb: dye.base_rgb} : dye[material]}
					metric='rgb'
				/>
			</td></tr> : null}

			{section === 'similar_hsl' ? <tr>
				<th colSpan={MATERIAL_IDS.length}>Similar dyes (based on HSL), on {material}</th>
			</tr> : null}
			{section === 'similar_hsl' ? <tr><td colSpan={MATERIAL_IDS.length}>
				<SimilarDyeList
					mat={material} dyes={dyes} reference={false ? {rgb: dye.base_rgb} : dye[material]}
					metric='hsl'
				/>
			</td></tr> : null}

			{section === 'similar_hue' ? <tr>
				<th colSpan={MATERIAL_IDS.length}>Similar dyes (based on hue), on {material}</th>
			</tr> : null}
			{section === 'similar_hue' ? <tr><td colSpan={MATERIAL_IDS.length}>
				<SimilarDyeList
					mat={material} dyes={dyes} reference={dye[material]}
					metric='hue'
				/>
			</td></tr> : null}

			{section === 'colorwheel' ? <tr>
				<th colSpan={MATERIAL_IDS.length}>Color wheel, on {material}</th>
			</tr> : null}
			{section === 'colorwheel' ? <tr><td colSpan={MATERIAL_IDS.length}>
				<ColorWheel
					mat={material} dyes={dyes} reference={dye[material]}
				/>
			</td></tr> : null}
			</tbody></table>
		</div>;
	}
}
