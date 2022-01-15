import React from 'react';

import DyeRender from './dyerender.js';

import {REFERENCE_MATERIAL} from './constants.js';

import './faq.css';
import { getDyeMatrix } from './dyecalc.js';
import formatDyeProperty from './format.js';

function A(props) {
	return <a href={props.href} target="_blank" rel="noopener noreferrer">{props.children}</a>;
}

export default function FAQ(props) {
	return <div><div className="faq">
		<h1>Kulinda's GuildWars 2 Dye Browser</h1>
		These are some unmodified textures from the game:<br />
		<table className='faq_example darkened'><tbody><tr>
		<td>
			<DyeRender texture='shroom_color' /><br />
			Color information<br />
			Reference = <span style={{color: 'rgb(128,26,26)'}}>rgb(128,26,26)</span>
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
		We can color-shift these textures according to a dye and a mask:<br />
		<table className='faq_example darkened'><tbody><tr>
			{[1305,133,126].map(did => <td key={did}>{(props.dyes && props.dyes[did] && props.dyes[did][REFERENCE_MATERIAL].matrix) ? <div><DyeRender key={did} texture='shroom_color' mask='shroom_mask0' matrix={props.dyes[did][REFERENCE_MATERIAL].matrix} /><DyeRender key={'a'+did} texture='shroom_color' mask='shroom_mask1' matrix={props.dyes[did][REFERENCE_MATERIAL].matrix} /><br />{props.dyes[did].name}</div> : null}</td>)}
		</tr></tbody></table>
		<br />
		Note that the original texture uses different shades of red for the stems and caps, so they turn into different shades even for the same dye.<br />
		<h2>What's in a dye?</h2>
		According to <a href="https://wiki.guildwars2.com/wiki/API:2/colors">the official API</a>, a dye has
		<ul>
			<li>A color modifier, specified as Hue, Saturation and Lightness</li>
			<li>A brightness modifier</li>
			<li>A contrast modifier</li>
		</ul>
		Let's take a look at how these modifiers affect the color, with the unmodified red in the middle:<br />
		<Gradient name='Hue' prop='hue' min={-180} max={180} />
		<Gradient name='Saturation' prop='saturation' min={0} max={2} />
		<Gradient name='Lightness' prop='lightness' min={0} max={2} />
		<Gradient name='Brightness' prop='brightness' min={-128} max={128} />
		<Gradient name='Contrast' prop='contrast' min={0} max={2} />

		<h2>What's a material?</h2>

		As you've seen on the mushroom above (and probably ingame), a skin can have multiple dye channels: Two for guild symbols, up to four for armor skins, backpacks, gliders and mounts.<br />
		<br />
		Each dye slot on each skin is assigned one of three materials: Cloth, Leather or Metal.
		For example, a chest armor skin might have two "Cloth" dye slots for a shirt and a vest, a third "Metal" dye slot for some ornaments, and leave the fourth possible dye slot unused.<br />
		<br />
		Dyes have separate modifiers per material, for example Perseverance Dye:<br />
		<table className='faq_example'><tbody>
		{props.dyes ? <tr>
			<td>
				<DyeRender texture='shroom_color' matrix={props.dyes[1267].cloth.matrix} />
				<DyeRender texture='cauldron' matrix={props.dyes[1267].cloth.matrix} />
				<br />Cloth
			</td><td>
				<DyeRender texture='shroom_color' matrix={props.dyes[1267].leather.matrix} />
				<DyeRender texture='cauldron' matrix={props.dyes[1267].leather.matrix} />
				<br />Leather
			</td><td>
				<DyeRender texture='shroom_color' matrix={props.dyes[1267].metal.matrix} />
				<DyeRender texture='cauldron' matrix={props.dyes[1267].metal.matrix} />
				<br />Metal
			</td>
		</tr> : <tr><td /></tr>}
		</tbody></table>
		<br />
		As you can see, the differences are minor, even on a dye I hand-picked to show the difference.<br />
		<br />
		There's a fourth material, Fur, but it doesn't appear to be used on any armor skins, so I will ignore it. For most dyes, the Fur modifiers are identical to Cloth anyway.<br />
		<br />
		Ingame (and in the list to the left), you can group dyes by material (Vibrant, Leather, Other).
		Those are just categories assigned by the developers and independent of the actual materials I talked about.
		They have no meaning for the appearance of a dye.<br />

		<h2>How are dyes applied?</h2>
		The formulas behind all this were researched and published by <A href="https://forum-en.gw2archive.eu/members/Cliff-Spradlin-3512/showposts">Cliff Spradlin on the old official forums</A>. Here's a copy of the important bits:<br />
		<blockquote cite="https://forum-en.gw2archive.eu/forum/community/api/API-Suggestion-Colors/page/1#post2140079">
			Brightness should be added to or subtracted from each component of the color<br />
			Contrast should used as a multiplier for each component of the color ((color – 128) * contrast + 128)<br />
			<br />
			Hue is a value from 0-360 degrees. Saturation and Lightness are both multipliers of the original S &amp; L values.<br />
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
		Based on that information, I wrote my own dye renderer. The source code can be found on <a href="https://github.com/kulinda/dyes/">https://github.com/kulinda/dyes/</a>.<br />

		<h2>What about colors for skins, hair and eyes?</h2>
		These are not documented in the official API (they were documented in an earlier version of the API, but with incomplete information, and I don't have a copy). They also use a different base color, which has never been documented. I've spent quite a bit of time trying to reverse engineer these, but have gotten nowhere. If you know more, contact me.<br />
		(Don't waste time trying to dump direct3d shaders. Dyes are not applied by a direct3d shader.)<br />

		<h2>There are some special dyes that result in multiple colors!</h2>
		No, there aren't. Some textures, especially the fiery mount skins, have base textures whose colors deviate a lot from the reference red they're supposed to use.
		If the base texture contains multiple colors (like red and orange), then the dyed texture will have multiple colors as well.<br />
		<br />
		What you're seeing is one of two things:
		<ul>
			<li>an amplification of the perceived difference, because hue space isn't perceptually uniform</li>
			<li>a numerical instability around very bright or very dark colors, because their hue isn't well defined</li>
		</ul>
		These effects are stronger on some dyes, but that doesn't mean that those dyes are special. Every dye has the same modifiers, as explained above.<br />

		<h2>What is this oklab I see?</h2>
		It's a color space designed to be perceptually uniform. Searching similar dyes by oklab should give you better color matches than searching by RGB.
		But in either case, we're trying to determine similarity of a five-dimensional transformation by comparing a single three-dimensional value (the result of the reference color),
		which ignores contrast, and no search will be perfect.
		That's why I'm giving you options, try them all until you find a dye you like.
		<br />
		If you want to know details, see the article <A href="https://bottosson.github.io/posts/oklab/">A perceptual color space for image processing</A> by Björn Ottosson.<br />

		<h2>Is there a "neutral" color in the game, showing unmodified textures?</h2>
		You can <a href="#search/cloth/128,26,26">search for dyes similar to rgb(128, 26, 26)</a>, but none of them are an exact match.<br />

		<h2>Why guild symbols? Why don't you use armor textures?</h2>
		I'd love to use armor textures, but unlike guild symbols, they're not published in the official API. If a dataminer wants to help me out, that'd be appreciated.<br />

		<h2>This tool has helped me a lot. How can I thank you?</h2>
		Be excellent to each other. Avoid toxicity and negativity. Help new players. Organize events. Tag up at metas and provide explanations. Listen to your commanders.<br />
		It's in every player's power to make the game a better place for everyone. I'm doing my part with research and programming. You go do yours.<br />

		<h2>Copyright, legal notices and contact</h2>
		See <a href="https://kulinda.github.io/" target="_blank" rel="noopener noreferrer">kulinda.github.io</a>.
	</div></div>;
}

function Gradient(props) {
	let {name, prop, min, max} = props;
	let range = max - min;
	let neutral_dye = {
		brightness: 0,
		contrast: 1,
		hue: 0,
		saturation: 1,
		lightness: 1,
	};
	let entries = [];
	let steps = 8;
	for (let p = 0; p <= steps; p++) {
		let v = min + (p / steps) * range;
		let dye = {
			...neutral_dye,
			[prop]: v
		};
		let matrix = getDyeMatrix(dye);
		entries.push(<td key={v}><DyeRender texture='shroom_color' matrix={matrix} width={64} height={64} /><br />{formatDyeProperty(prop, v)}</td>);
	}

	return <table className='faq_gradient darkened'><tbody>
		<tr><th colSpan={steps + 1}>{name}</th></tr>
		<tr>{entries}</tr>
	</tbody></table>;
}