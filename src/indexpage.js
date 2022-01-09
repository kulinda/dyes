import React from 'react';

import DyeList from './dyelist.js';
import DyeDetails from './dyedetails.js';
import DyeStats from './stats.js';
import GuildEmblems from './guildemblems.js';
import DyeSearch from './search.js';
import VisitedDyeList from './visited.js';
import FAQ from './faq.js';

import './kulinda.css';
import './layout.css';
import './indexpage.css';


export default class GW2DyesIndexPage extends React.Component {
	render() {
		let {dyes, dyes_by_name, route} = this.props;

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
					selected_page = '';
				}
			}
		}

		return <div className="dye_app">
			<div className="top_panel">
				<div className="left_panel fw_inputs">
					<h2 style={{textAlign: 'center'}}>Dye Browser</h2>
					<button onClick={e => window.location.hash = '#faq'}>Dye FAQ</button><br />
					<button onClick={e => window.location.hash = '#stats'}>Dye statistics</button><br />
					{/*<button onClick={e => window.location.hash = '#guildemblems'}>Show guild emblems</button><br />*/}
					<button onClick={e => window.location.hash = '#search'}>Search by RGB or Screenshot</button><br />
					<br />
					<DyeList dyes={dyes} />
				</div>
				<div className="right_panel">
					{(selected_page === 'search' && dyes)
						? <DyeSearch dyes={dyes} material={r[1]} rgb={r[2]}/>
						: (selected_page === 'stats' && dyes)
						? <DyeStats dyes={dyes} />
						: (selected_page === 'guildemblems' && dyes)
						? <GuildEmblems dyes={dyes} />
						: (selected_page === 'faq' || selected_page === '')
						? <FAQ dyes={dyes} />
						: (dyes)
						? <DyeDetails dyes={dyes} dye={dyes[selected_dye]} />
						: <div>loading..</div>
					}
				</div>
			</div>
			<div className="bottom_panel">
				<VisitedDyeList dyes={dyes} selected_dye={selected_dye} />
			</div>
		</div>;
	}
}
