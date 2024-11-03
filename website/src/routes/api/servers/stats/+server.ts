import { json } from '@sveltejs/kit';

import { supabase } from '$lib/supabase';

import type { RequestHandler } from './$types';

const regions = ['NA', 'EU'];

export const GET: RequestHandler = async ({ url }) => {
	const region = url.searchParams.get('region');

	if (!region || !regions.includes(region)) {
		return json({ error: `regions must be one of ${regions.join(', ')}` }, { status: 400 });
	}

	const [
		{ data: mostActive, error: mostActiveError },
		{ data: leastActive, error: leastActiveError }
	] = await Promise.all([
		supabase
			.from('server_statistics')
			.select()
			.eq('region', region)
			.order('activePlayers', { ascending: false })
			.limit(1)
			.single(),
		supabase
			.from('server_statistics')
			.select()
			.eq('region', region)
			.order('activePlayers', { ascending: true })
			.limit(1)
			.single()
	]);

	if (mostActiveError || leastActiveError) {
		console.log(mostActiveError || leastActiveError);

		return json({ error: 'failed to query database' }, { status: 500 });
	}

	return json({ stats: { mostActive, leastActive } });
};
