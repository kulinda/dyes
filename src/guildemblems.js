import React from 'react';

import DyeRender from './dyerender.js';

import {MATERIAL_IDS} from './constants.js'; // TODO: is this correct?

import fetchAPI from './gw2api.js';

import './guildemblems.css';

class GuildEmblem extends React.Component {
	constructor(props) {
		super(props);
		this.api_callback = (v) => this.forceUpdate();
	}
	render() {
		let {guild, dyes, color, mat} = this.props;

		let bg = fetchAPI('emblem/backgrounds?id=' + guild.emblem.background.id, this.api_callback);
		let fg = fetchAPI('emblem/foregrounds?id=' + guild.emblem.foreground.id, this.api_callback);
		if (!bg || !fg)
			return <div className='guildemblem' style={{backgroundColor: color}}>loading..</div>;

		let dye_bg = guild.emblem.background.colors[0];
		let dyes_fg = guild.emblem.foreground.colors;
		return <div className='guildemblem' style={{backgroundColor: color}}>
			<DyeRender texture={bg.layers[0]} matrix={dyes[dye_bg][mat].matrix} />
			{/*<DyeRender texture={fg.layers[0]} />*/}
			<DyeRender texture={fg.layers[0]} mask={fg.layers[1]} matrix={dyes[dyes_fg[0]][mat].matrix} />
			<DyeRender texture={fg.layers[0]} mask={fg.layers[2]} matrix={dyes[dyes_fg[1]][mat].matrix} />
		</div>;
	}
}

function GuildEmblemRow(props) {
	let {mat, guild, dyes} = props;
	return <div>
		<small>{mat}</small><br />
		{['#000', '#777', '#fff'].map(c => <GuildEmblem key={c} mat={mat} guild={guild} dyes={dyes} color={c} />)}
	</div>;
}

function Guild(props) {
	let {guild, dyes} = props;

	// I have no idea which material is used, so show all of them.
	return <div className='guild'>
		{guild.name} [{guild.tag}]<br />
		{MATERIAL_IDS.map(mat => <GuildEmblemRow key={mat} mat={mat} guild={guild} dyes={dyes} />)}
		<br />
		{guild.emblem.flags.length > 0 ? <small>ignoring flags: {guild.emblem.flags.join(',')}</small> : null}
	</div>;
}

export default class EmblemChooser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			api_key: null,
			error: null
		};
		this.api_callback = (v) => this.forceUpdate();
		this.onError = this.onError.bind(this);
	}

	setAPIKey(key) {
		let k = key.trim();
		if (k.length !== 72) {
			this.setState({
				api_key: k,
				error: 'A valid API key has 72 characters.'
			});
			return;
		}

		this.setState({
			api_key: k,
			error: null
		});
	}

	onError(e) {
		this.setState({
			error: e.message ? e.message : e
		});
	}

	render() {
		let {dyes} = this.props;
		let {api_key, error} = this.state;

		if (api_key && !error) {
			let guilds = [];
			try {
				let account = fetchAPI('account?access_token=' + api_key, this.api_callback, this.onError);
				if (account) {
					for (let guild of account.guilds) {
						let guildinfo = fetchAPI('guild/' + guild, this.api_callback);
						if (guildinfo)
							guilds.push(guildinfo);
					}
				}
			}
			catch (e) {
				console.warn(e);
				error = e.message;
			}

			if (guilds.length < 1)
				return <div className='content loading'>loading..</div>;
			return <div className='content'>
				{guilds.map(g => <Guild key={g.id} guild={g} dyes={dyes} />)}
			</div>;
		}

		if (!api_key || error) {
			return <div className='content guildemblem_form'>
				<h2>Guild Emblems</h2>
				Note: This feature is for research. It allows comparisons between the game's rendering and this tool's rendering.<br />
				<br />
				<br />
				{error ? <div>There was an error. This usually means that the API key is invalid.<br />
					Error: <span style={{color: 'red'}}>{error}</span><br /><br /></div> : null}
				Enter an API key to render all your guilds' emblems.<br />
				<small>Only the <i>account</i> permission is required.</small>
				<form onSubmit={e => {e.preventDefault(); this.setAPIKey(e.target.apikey.value)}}>
					<input name="apikey" type="text" placeholder="API key" defaultValue="" />
					<input type="submit" value="Show all guilds" />
				</form>
				<small>The key will not be used for any other purpose. Don't worry, I'm not evil.</small>
			</div>;
		}
	}
}
