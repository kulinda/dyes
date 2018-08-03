
let api_cache = {};

/**
 * Returns the value if it's cached.
 * Otherwise executes the callback with the value when available.
 * On error, calls the onError function, or its global default.
 */
export default function fetchAPI(path, callback, onError) {
	if (!onError)
		onError = fetchAPI.onError;

	let url = 'https://api.guildwars2.com/v2/' + path;
	let p = null;
	if (api_cache[url] instanceof Promise) {
		p = api_cache[url];
	}
	else if (api_cache[url]) {
		let c = api_cache[url];
		if (c[0])
			throw new Error(c[0]);
		return c[1];
	}
	else {
		p = fetch(url)
			.then(response => {
				if (response.ok)
					return response.json();
				else
					throw new Error(response.statusText);
			})
			.then(
				v => {
					api_cache[url] = [null, v];
					return api_cache[url];
				},
				e => {
					console.log('GW2 API returned an error', e);
					api_cache[url] = [e, undefined];
					return api_cache[url];
				}
			)
		;
		api_cache[url] = p;
	}
	p.then(v => {
		if (v[0]) {
			onError(v[0], url);
			return;
		}
		callback(v[1]);
	});
	return false;
}

fetchAPI.onError = function(e, url) {
	console.warn(e, url);
};
