import { error } from '@sveltejs/kit';

import { title as titleStore } from '$lib/stores';

import type { PageLoad } from './$types';

const regions = {
	'north-america': {
		name: 'North America',
		code: 'NA'
	},
	europe: {
		name: 'Europe',
		code: 'EU'
	}
};

export const load: PageLoad = ({ params }) => {
	// @ts-ignore
	const region = regions[params.slug];
	if (!region) {
		error(404, 'Not found');
	}

	titleStore.set(`${region.name} Statistics`);

	return { region };
};
