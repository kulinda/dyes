import React from 'react';
import ReactDOM from 'react-dom';

import {getDyeMatrix} from './dyecalc.js';

import GW2DyesIndexPage from './indexpage.js';

import {MATERIAL_IDS} from './constants.js';


function getCurrentHash() {
	return document.location.hash.replace(/^#/, '');
}

class GW2DyesLoader extends React.Component {
	constructor(props) {
		super(props);

		this.onHashChange = this.onHashChange.bind(this);
		window.addEventListener('hashchange', this.onHashChange, false);

		this.visited_scroll_start = 0;
		this.state = {
			dyes: undefined,
			dyes_by_name: undefined,
			route: getCurrentHash(),
		};
		if (!fetch) {
			this.onDyeFail();
			return;
		}
		fetch('https://api.guildwars2.com/v2/colors?ids=all&lang=en')
			.then(response => response.json())
			.then(this.onDyeLoad.bind(this))
			.catch(this.onDyeFail.bind(this))
		;
	}

	componentWillUnmount() {
		window.removeEventListener('hashchange', this.onHashChange, false);
	}

	onDyeLoad(data) {
		let dyes = {};
		let dyes_by_name = {};
		for (let i = 0; i < data.length; i++) {
			let dye = data[i];
			dyes[dye.id] = dye;
			dyes_by_name[dye.name] = dye.id;
			for (let mat of MATERIAL_IDS)
				dye[mat].matrix = getDyeMatrix(dye[mat]);
		}
		this.dumpDyeStats(dyes);
		this.setState({dyes: dyes, dyes_by_name: dyes_by_name});
	}

	dumpDyeStats(dyes) {
		// For debugging info only.
/*
		let min = {}, max = {};
		for (let id in dyes) {
			let dye = dyes[id];
			for (let mat of MATERIAL_IDS) {
				for (let prop of ['brightness', 'contrast', 'hue', 'saturation', 'lightness']) {
					let val = dye[mat][prop];
					if (min[prop] === undefined) {
						min[prop] = val;
						max[prop] = val;
					}
					else {
						min[prop] = Math.min(min[prop], val);
						max[prop] = Math.max(max[prop], val);
					}
				}
			}
		}
		console.log(min, max);
*/
	}

	onDyeFail(x) {
		console.log(x);
		this.setState({dyes: false})
	}

	onHashChange(e) {
		let hash = getCurrentHash();
		this.setState((state) => {
			if (hash === state.route)
				return;
			return {
				route: hash
			}
		});
	}

	render() {
		let {dyes, dyes_by_name, route} = this.state;

		return <GW2DyesIndexPage dyes={dyes} dyes_by_name={dyes_by_name} route={route} />;
	}
}

ReactDOM.render(<GW2DyesLoader />, document.getElementById('root'));
