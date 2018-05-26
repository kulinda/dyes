import React from 'react';

import DyeRender from './dyerender.js';

import {REFERENCE_MATERIAL} from './constants.js';

import './faq.css';

function A(props) {
	return <a href={props.href} target="_blank" rel="noopener noreferrer">{props.children}</a>;
}

export default function FAQ(props) {
	return <div className="faq">
		<h1>Kulinda's GuildWars 2 dye browser</h1>
		These are some unmodified textures from the game:<br />
		<table className='faq_example darkened'><tbody><tr>
		<td>
			<DyeRender texture='shroom_color' /><br />
			Color information<br />
			Reference = rgb(128,26,26)
		</td>
		<td>
			<DyeRender texture='shroom_mask0' /><br />
			Dye channel 1
		</td>
		<td>
			<DyeRender texture='shroom_mask1' /><br />
			Dye channel 2
		</td>
		</tr></tbody></table>
		<br />
		Color-shifted:<br />
		<table className='faq_example darkened'><tbody><tr>
			{[1305,133,126].map(did => <td key={did}>{(props.dyes && props.dyes[did] && props.dyes[did][REFERENCE_MATERIAL].matrix) ? <div><DyeRender key={did} texture='shroom_color' mask='shroom_mask0' matrix={props.dyes[did][REFERENCE_MATERIAL].matrix} /><DyeRender key={'a'+did} texture='shroom_color' mask='shroom_mask1' matrix={props.dyes[did][REFERENCE_MATERIAL].matrix} /><br />{props.dyes[did].name}</div> : null}</td>)}
		</tr></tbody></table>
		<br />
		Note that the original texture uses different shades of red for the stems and caps, so they turn into different shades even for the same dye.<br />
		<br />
		For details, see below. Or click a dye on the left and start browsing!<br />
		<br />
		<br />

		<h1>How are dyes applied in GW2?</h1>
		According to the API, a dye has
		<ul>
			<li>A color modifier, specified as Hue, Saturation and Lightness</li>
			<li>A brightness modifier</li>
			<li>A contrast modifier</li>
		</ul>
		Most of the information was researched and published by <A href="https://forum-en.gw2archive.eu/members/Cliff-Spradlin-3512/showposts">Cliff Spradlin on the old official forums</A>. Here's a copy of the important bits:<br />
		<blockquote cite="https://forum-en.gw2archive.eu/forum/community/api/API-Suggestion-Colors/page/1#post2140079">
			Brightness should be added to or subtracted from each component of the color<br />
			Contrast should used as a multiplier for each component of the color ((color – 128) * contrast + 128)<br />
			<br />
			Hue is a value from 0-360 degrees. Saturation and Lightness are both multipliers of the original S & L values.<br />
			<br />
			The order of operations is:<br />
			1) Take the base (RGB) color<br />
			2) Apply brightness and contrast<br />
			3) Convert color to HSL space<br />
			4) Apply HSL shift<br />
			5) Convert color back to RGB space (this is the final color value)<br />
		</blockquote>
		<blockquote cite="https://forum-en.gw2archive.eu/forum/community/api/How-To-Colors-API/page/1#post2148826">
		I also created a javascript version of our internal color shifting algorithm here: <A href="http://jsfiddle.net/cliff/jQ8ga/">http://jsfiddle.net/cliff/jQ8ga/</A> . This example code uses the sylvester javascript matrix library for math.<br />
		<br />
		The way it works is pretty different than the processes previously described — it calculates a transformation matrix which is then applied to the color in one pass.<br />
		</blockquote>
		<br />
		<br />
		<b>What about colors for skins, hair and eyes?</b><br />
		These are not documented in the official API (they were documented in an earlier version of the API, but with incomplete information, and I don't have a copy). They also use a different base color, which has never been documented. I've spent quite a bit of time trying to reverse engineer these, but have gotten nowhere. If you know more, contact me.<br />
		(Don't waste time trying to dump direct3d shaders. Dyes are not applied by a direct3d shader.)<br />
		<br />
		<br />
		<b>Is there a "neutral" color in the game, showing unmodified textures?</b><br />
		You can <a href="#search/cloth/128,26,26">search for dyes similar to rgb(128, 26, 26)</a>, but none of them are an exact match.<br />
		<br />
		<br />
		<b>Why guild symbols? Why don't you use armor textures?</b><br />
		I'd love to use armor textures, but unlike guild symbols, they're not published in the official API. If a dataminer wants to help me out, that'd be appreciated.<br />
		<br />
		<br />
		<b>How can I thank you / help you / give feedback?</b><br />
		The source code is available on github, pull requests welcome.<br />
		You can find me on <A href="https://www.reddit.com/u/Kulinda">reddit/u/Kulinda</A>.<br />
		<br />
		<br />

		<h1>Copyright and legal notices</h1>
		This tool was written by Kulinda. The source code and its license can be found on <A href="https://github.com/kulinda/dyes/">github.com/kulinda</A>.<br />
		<br />
		The favicon and all example textures are © ArenaNet, LLC; this project is using them as allowed per the <A href="https://www.guildwars2.com/en/legal/guild-wars-2-content-terms-of-use/">Guild Wars 2 Content Terms of Use</A>.<br />
		<br />
		<i>Guild Wars 2</i> is a trademark or registered trademark of NCSOFT Corporation. This tool is a fan project, and neither affiliated with ArenaNet nor NCSOFT.<br />
		<br />
		This tool uses code from the following open source projects: <A href="https://reactjs.org/">React</A> (MIT license), <A href="http://glmatrix.net/">glMatrix</A> (MIT license).<br />
		<br />
		<br />
	</div>;
}
