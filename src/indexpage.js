import React from 'react';

import DyeList from './dyelist.js';
import DyeDetails from './dyedetails.js';
import DyeSearch from './search.js';
import VisitedDyeList from './visited.js';
import FAQ from './faq.js';

import './layout.css';
import './indexpage.css';


export default class GW2DyesIndexPage extends React.Component {
	render() {
		let {dyes, route} = this.props;

		let r = route.split('/');
		let selected_page = r[0];
		let selected_dye = false;
		if (selected_page === 'dye')
			selected_dye = r[1];

		return <div className="dye_app">
			<div className="top_panel">
				<div className="left_panel">
					<button onClick={e => window.location.hash = '#faq'}>back to the FAQ</button><br />
					<button onClick={e => window.location.hash = '#search'}>search dyes by RGB</button><br />
					<br />
					<DyeList dyes={dyes} />
				</div>
				<div className="right_panel">
					{(selected_page === 'search' && dyes)
						? <DyeSearch dyes={dyes} material={r[1]} rgb={r[2]}/>
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
