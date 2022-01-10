import React from 'react';
import ReactDOM from 'react-dom';

import { toOklab } from '@butterwell/oklab';

import fetchAPI from './gw2api.js';

import {getDyeMatrix} from './dyecalc.js';

import GW2DyesIndexPage from './indexpage.js';

import {MATERIAL_IDS} from './constants.js';


function getCurrentHash() {
	return document.location.hash.replace(/^#/, '');
}

function GW2DyesLoader() {
	let [route, setRoute] = React.useState(getCurrentHash);
	let [dye_data, setDyeData] = React.useState(null);
	let [error, setError] = React.useState(null);

	if (!fetch) {
		setError('Your browser is too old');
	}

	React.useEffect(() => {
		function onHashChange(e) {
			let hash = getCurrentHash();
			setRoute(hash);
		}
		window.addEventListener('hashchange', onHashChange, false);
		return () => {
			window.removeEventListener('hashchange', onHashChange, false);
		};
	}, []);

	React.useEffect(() => {
		if (error)
			return;

		let onErrorBak = fetchAPI.onError;
		fetchAPI.onError = (e, url) => {
			console.warn(e, url);
			let msg = typeof e === 'string' ? e : e.message;
			setError(`Error loading ${url}: ${msg}`);
		};

		fetchAPI('colors?ids=all&lang=en', (data) => {
			setDyeData(parseDyeData(data));
		});

		return () => {
			fetchAPI.onError = onErrorBak;
		};
	}, [error]);

	if (error) {
		return <div style={{width: '500px', margin: '100px auto'}}>
			<h1>Kulinda's GW2 Dye Browser</h1>
			There was an error when contacting the GW2 API.<br />
			Check your internet connection, and check if the API is up.<br />
			<br />
			Error: <span style={{color: 'red'}}>{error}</span>
		</div>;
	}

	let dyes = null;
	let dyes_by_name = null;
	if (dye_data) {
		dyes = dye_data.dyes;
		dyes_by_name = dye_data.dyes_by_name;
	}
	return <GW2DyesIndexPage dyes={dyes} dyes_by_name={dyes_by_name} route={route} />;
}

function parseDyeData(data) {
	let dyes = {};
	let dyes_by_name = {};
	for (let i = 0; i < data.length; i++) {
		let dye = data[i];
		dyes[dye.id] = dye;
		dyes_by_name[dye.name] = dye.id;
		for (let m of MATERIAL_IDS) {
			let mat = dye[m];
			mat.matrix = getDyeMatrix(mat);
			let rgb = mat.rgb;
			mat.oklab = toOklab({
				r: rgb[0],
				g: rgb[1],
				b: rgb[2],
			});
		}
	}
	//dumpDyeStats(dyes);
	return {
		dyes: dyes,
		dyes_by_name: dyes_by_name
	};
}

function dumpDyeStats(dyes) {
	// For debugging info only.
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
}

ReactDOM.render(<GW2DyesLoader />, document.getElementById('root'));
