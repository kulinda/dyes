import * as React from 'react';

import DyeList from './dyelist.js';
import DyeDetails from './dyedetails.js';
import DyeStats from './stats.js';
import DyeMap from './map.js';
import GuildEmblems from './guildemblems.js';
import DyeSearch from './search.js';
import VisitedDyeList from './visited.js';
import FAQ from './faq.js';

import { MATERIAL_IDS } from './constants.js';

import './kulinda.css';
import './layout.css';
import './indexpage.css';


export default function GW2DyesIndexPage(props) {
	let {dyes, dyes_by_name, route} = props;

	let [material, setMaterial] = React.useState(MATERIAL_IDS[0]);

	let visited_ref = React.useRef(new Set());

	let r = route.split('/');
	let selected_page = r[0];
	let selected_dye = false;
	if (selected_page === 'dye' && dyes) {
		selected_dye = decodeURIComponent(r[1]);
		if (!dyes[selected_dye]) {
			let name = selected_dye.replace('_', ' ');
			selected_dye = String(dyes_by_name[name]);
			if (!dyes[selected_dye]) {
				selected_dye = false;
				//selected_page = '';
			}
		}
	}

	if (selected_dye && visited_ref.current) {
		visited_ref.current.add(selected_dye);
	}

	if (selected_page === '')
		selected_page = 'faq';

	let has_left_panel = selected_page === 'faq' || selected_page === 'dye' || selected_page === 'visited';

	return <div className="dye_app">
		<div className="menu mainmenu">
			<MenuItem selected_page={selected_page} page='' className='_kulinda_menu' onClick={(e) => e.preventDefault()}>
				<img src="https://kulinda.github.io/kulinda_head.png" alt="" />
				Kulinda's GW2 Stuff
			</MenuItem>
			<MenuItem selected_page={selected_page} page='dye'>
				<img src="./dyelist.png" alt="" />
				Dye List
			</MenuItem>
			<MenuItem selected_page={selected_page} page='map'>
				<img src="./dyemap.png" alt="" />
				Dye Map
			</MenuItem>
			<MenuItem selected_page={selected_page} page='stats'>
				<img src="./statistics.png" alt="" />
				Statistics
			</MenuItem>
			<MenuItem selected_page={selected_page} page='faq'>
				FAQ
			</MenuItem>
			<MenuItem selected_page={selected_page} page='search'>
				Search by RGB or Screenshot
			</MenuItem>
			{visited_ref.current && visited_ref.current.size > 0 ? <MenuItem selected_page={selected_page} page='visited'>
				Visited Dyes
			</MenuItem> : null}
			{/*<MenuItem selected_page={selected_page} page='guildemblems'>
				Show guild emblems
			</MenuItem>*/}
		</div>
		<div className="main_panel">
			{has_left_panel ? <div className="left_panel"><div className="left_panel_inner fw_inputs">
				<DyeList dyes={dyes} />
			</div></div> : null}
			<div className="right_panel">
				{(selected_page === 'search' && dyes)
					? <DyeSearch dyes={dyes} material={r[1] || material} rgb={r[2]}/>
					: (selected_page === 'stats' && dyes)
					? <DyeStats dyes={dyes} />
					: (selected_page === 'map' && dyes)
					? <DyeMap dyes={dyes} material={material} setMaterial={setMaterial} />
					: (selected_page === 'guildemblems' && dyes)
					? <GuildEmblems dyes={dyes} />
					: (selected_page === 'faq')
					? <FAQ dyes={dyes} />
					: (selected_page === 'visited')
					? <VisitedDyeList dyes={dyes} visited={visited_ref.current} />
					: (dyes && selected_dye && dyes[selected_dye])
					? <DyeDetails dyes={dyes} dye={dyes[selected_dye]} material={material} setMaterial={setMaterial} />
					: (!dyes)
					? <div className='loading'>Loading Dyes..</div>
					: null
				}
			</div>
		</div>
	</div>;
}

export function MenuItem(props) {
	let {selected_page, page, className = '', children, onClick} = props;

	return <a href={'#' + page} onClick={onClick} className={(selected_page === page ? 'active' : '') + ' ' + className}>
		{children}
		<div className="underline" />
	</a>;
}