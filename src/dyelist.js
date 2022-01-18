import React from 'react';

import {DYE_CATEGORIES, CONTRASTS, REFERENCE_MATERIAL} from './constants.js';

import './dyelist.css';


export function navigateToDye(dye) {
	if (dye === undefined)
		return;
	window.location.hash = '#dye/' + encodeURIComponent(dye.name.replace(' ', '_'));
}

class DyeCategory extends React.Component {
	render() {
		let {category, material, dyes, filtered} = this.props;

		if (filtered.length === 0)
			return <div></div>;

		return <div>
			<h2 className='cat_header'>{category}</h2>
			<div className='cat_container'>
				{filtered.map(id => {
					let dye = dyes[id];
					let href = '#dye/' + encodeURIComponent(dye.name.replace(' ', '_'));
					return <a key={id} className='cat_dye' title={dye.name}
						style={{backgroundColor: 'rgb(' + dye[material].rgb.join(',') + ')'}}
						href={href}
					/>;
				})}
			</div>
		</div>;
	}
}


function isInCat_named(dye, category) {
	return dye.categories.indexOf(category) > -1;
}

function isInCat_contrast(dye, category, catidx) {
	let contrast = dye[REFERENCE_MATERIAL].contrast;
	return (contrast >= CONTRASTS[catidx] && contrast < CONTRASTS[catidx + 1]);
}


export default class DyeList extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			category: 'set',
			filter: ''
		};

		this.setCategory = this.setCategory.bind(this);
		this.setFilter = this.setFilter.bind(this);
	}

	setCategory(e) {
		let cat = e.target.value;
		if (DYE_CATEGORIES[cat]) {
			this.setState({
				category: cat
			});
		}
	}

	setFilter(e) {
		let filter = e.target.value;
		this.setState({
			filter: filter
		});
	}

	render() {
		let {dyes} = this.props;
		let {category, filter} = this.state;

		if (!dyes) {
			return null;
		}

		let cats = DYE_CATEGORIES[category];
		let dyes_by_cats = cats.map(cat => []);
		let isInCategory = isInCat_named;
		if (category === 'contrast')
			isInCategory = isInCat_contrast;

		let filter_lc = filter.toLowerCase();
		for (let id in dyes) {
			let dye = dyes[id];
			if (filter && dye.name.toLowerCase().indexOf(filter_lc) === -1)
				continue;

			let done = false;
			for (let c = 0; c < cats.length; c++) {
				if (isInCategory(dye, cats[c], c)) {
					dyes_by_cats[c].push(id);
					done = true;
					break;
				}
			}
			// Push into the last category
			if (!done)
				dyes_by_cats[cats.length - 1].push(id);
		}
		for (let i = 0; i < dyes_by_cats.length; i++)
			dyes_by_cats[i].sort();

		return <div>
			<select value={category} onChange={this.setCategory}>
				{Object.keys(DYE_CATEGORIES).map(name => <option key={name} value={name}>Group by {name}</option>)}
			</select><br />
			<input type="text" value={filter} onChange={this.setFilter} placeholder="Search dyes by name" /><br />
			{filter_lc === 'greenrose' ? <div style={{padding: '5px'}}>
				Roses are red,<br />
				Violets are blue,<br />
				but neither is green!<br />
				No Greenrose for you!<br />
				<br />
				<a href="#search/cloth/130,184,36">Search for similar dyes</a>
			</div> : null}
			{DYE_CATEGORIES[category].map((cat, idx) => <DyeCategory key={cat} category={cat}
				dyes={dyes} filtered={dyes_by_cats[idx]}
				material={REFERENCE_MATERIAL} />)}
		</div>;
	}
}
