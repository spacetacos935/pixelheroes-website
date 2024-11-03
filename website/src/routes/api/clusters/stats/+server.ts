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
			.from('cluster_statistics')
			.select()
			.eq('region', region)
			.eq('fullCluster', true)
			.order('activePlayers', { ascending: false })
			.limit(1)
			.single(),
		supabase
			.from('cluster_statistics')
			.select()
			.eq('region', region)
			.eq('fullCluster', true)
			.order('activePlayers', { ascending: true })
			.limit(1)
			.single()
	]);

	if (mostActiveError || leastActiveError) {
		console.error(mostActiveError || leastActiveError);
		return json({ error: 'failed to query database' }, { status: 500 });
	}

	return json({ stats: { mostActive, leastActive } });
};
