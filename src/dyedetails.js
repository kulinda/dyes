import * as React from 'react';

import DyeRectangle from './dyerectangle.js';
import DyeRender from './dyerender.js';
import SimilarDyeList from './similarlist.js';
import ColorWheel from './colorwheel.js';

import {MATERIAL_NAMES, MATERIAL_IDS} from './constants.js';
import formatDyeProperty from './format.js';

import './dyedetails.css';



export function MenuItem(props) {
	let {section, setSection, name, className = '', children} = props;

	return <div className={(section === name ? 'active' : '') + ' ' + className} onClick={() => setSection(name)}>
		{children}
		<div className="underline" />
	</div>;
}


export default function DyeDetails(props) {
	let [section, setSection] = React.useState('materials');

	let {dyes, dye, material, setMaterial} = props;

	return <div className='content dyedetails'>
		<div className='dyedetails_header'>
			<div className='dyedetails_name'>
				<div>
					<b>{dye.name}</b><br />
					{dye.id !== 1 ? <small><a href={'https://wiki.guildwars2.com/wiki/' + dye.name.replace(' ', '_') + '_Dye'} target='_blank'>GW2W</a></small> : null}<br/>
				</div>
			</div>
			<div className="menu dyedetails_menu">
				<MenuItem section={section} name='materials' setSection={setSection}>
					Materials
				</MenuItem>
				<MenuItem section={section} name='similar' setSection={setSection}>
					Similar Dyes
				</MenuItem>
				<MenuItem section={section} name='colorwheel' setSection={setSection}>
					Color Wheel
				</MenuItem>
			</div>
			<div />
		</div>
		<br />
		<br />

		{section === 'materials' ? <Materials dye={dye} />
		: section === 'similar' ? <SimilarDyes dyes={dyes} dye={dye} material={material} setMaterial={setMaterial} />
		: section === 'colorwheel' ? <ColorWheelSection dyes={dyes} dye={dye} material={material} setMaterial={setMaterial} />
		: null}
	</div>;
}

function Materials(props) {
	let {dye} = props;

	return <table width="90%"><tbody>
		<tr>
			{MATERIAL_NAMES.map((mat) => <th key={mat}>{mat}</th>)}
		</tr>
		<tr>
			{MATERIAL_IDS.map((mat) => {
				let d = dye[mat];
				return <td key={mat}>
					<DyeRectangle rgb={d.rgb} text={'rgb(' + d.rgb.join(', ') + ')'} /><br />
					<DyeRender texture='smudge' matrix={d.matrix} /><br />
					<DyeRender texture='cauldron' matrix={d.matrix} /><br />
					<DyeRender texture='shroom_color' matrix={d.matrix} /><br />
				</td>;
			})}
		</tr>
		<tr>
			{MATERIAL_IDS.map(mat => {
				let d = dye[mat];
				return <td key={mat}>
					Hue: {formatDyeProperty('hue', d.hue)}<br />
					Saturation: {formatDyeProperty('saturation', d.saturation)}<br />
					Lightness: {formatDyeProperty('lightness', d.lightness)}<br />
					Brightness: {formatDyeProperty('brightness', d.brightness)}<br />
					Contrast: {formatDyeProperty('contrast', d.contrast)}<br />
			</td>;})}
		</tr>
	</tbody></table>;
}

function SimilarDyes(props) {
	let {dyes, dye, material, setMaterial} = props;

	let [metric, setMetric] = React.useState('oklab');

	return <div>
		Similar dyes, on
		<select value={material} onChange={(e) => setMaterial(e.target.value)}>
			{MATERIAL_IDS.map((mat, idx) => {
				let name = MATERIAL_NAMES[idx];
				return <option value={mat} key={mat}>{name}</option>;
			})}
		</select>, sorted by
		<select value={metric} onChange={(e) => setMetric(e.target.value)}>
			<option value='oklab'>reference color</option>
			<option value='hue'>hue</option>
			<option value='huesat'>hue and saturation</option>
		</select>:<br />
		<br />
		<SimilarDyeList
			mat={material} dyes={dyes} reference={false ? {rgb: dye.base_rgb} : dye[material]}
			metric={metric}
		/>
	</div>;
}


function ColorWheelSection(props) {
	let {dyes, dye, material, setMaterial} = props;

	return <div>
		Color Wheel, on
		<select value={material} onChange={(e) => setMaterial(e.target.value)}>
			{MATERIAL_IDS.map((mat, idx) => {
				let name = MATERIAL_NAMES[idx];
				return <option value={mat} key={mat}>{name}</option>;
			})}
		</select>:<br />
		<br />
		<ColorWheel mat={material} dyes={dyes} reference={dye[material]} />
	</div>;
}