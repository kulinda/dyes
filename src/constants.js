

export const DYE_CATEGORIES = {
	'hue': ['Gray', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Other'],
	'material': ['Vibrant', 'Leather', 'Metal', 'Other'],
	'set': ['Starter', 'Common', 'Uncommon', 'Rare', 'Other'],
	'contrast': ['Reduced', 'Neutral', 'Increased (0% to 25%)', 'Increased (25% to 50%)', 'Increased (>50%)', 'Other'],
};

export const CONTRASTS = [
	-Infinity, 1, 1.0000001, 1.25, 1.5, Infinity
];

// "The dye picker in the game uses the cloth material"
// https://forum-en.gw2archive.eu/forum/community/api/How-To-Colors-API/first
export const REFERENCE_MATERIAL = 'cloth';

export const MATERIAL_NAMES = ['Cloth', 'Leather', 'Metal'];
export const MATERIAL_IDS = MATERIAL_NAMES.map(n => n.toLowerCase());
