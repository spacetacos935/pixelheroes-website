import { json } from '@sveltejs/kit';

import { supabase } from '$lib/supabase';

import type { RequestHandler } from './$types';

const columns = [
	'id',
	'totalPlayers',
	'activePlayers',
	'totalGuilds',
	'activeGuilds',
	'topGuildContributions',
	'topGuildPower',
	'topPlayerPower',
	'totalPower'
];

const regions = ['NA', 'EU'];

export const GET: RequestHandler = async ({ url }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const sortBy = url.searchParams.get('sortBy') ?? 'id';
	const sortDir = url.searchParams.get('sortDir') ?? 'asc';
	const query = url.searchParams.get('query');
	const region = url.searchParams.get('region');

	if (!region || !regions.includes(region)) {
		return json({ error: `regions must be one of ${regions.join(', ')}` }, { status: 400 });
	}

	if (isNaN(page) || page <= 0) {
		return json({ error: 'page must be a integer greater than or equal to 1' }, { status: 400 });
	}

	if (!columns.includes(sortBy)) {
		return json({ error: `sortBy must be one of ${columns.join(', ')}` }, { status: 400 });
	}

	if (sortDir !== 'desc' && sortDir !== 'asc') {
		return json({ error: 'sortDir must be one of desc, asc' }, { status: 400 });
	}

	if (query && query.length > 50) {
		return json({ error: 'query must be a string with a max length of 50' }, { status: 400 });
	}

	const take = 20;
	const skip = (page - 1) * take;

	const countQuery = supabase
		.from('cluster_statistics')
		.select('*', { count: 'exact', head: true })
		.eq('region', region);
	const fetchQuery = supabase.from('cluster_statistics').select().eq('region', region);

	if (query) {
		countQuery.ilike('name', `%${query}%`);
		fetchQuery.ilike('name', `%${query}%`);
	}

	const [{ count, error: countError }, { data: clusters, error: fetchError }] = await Promise.all([
		countQuery,
		fetchQuery.range(skip, skip + take - 1).order(sortBy === 'id' ? 'clusterStart' : sortBy, {
			ascending: sortDir === 'asc',
			nullsFirst: false
		})
	]);

	if (countError || fetchError) {
		console.error(countError ?? fetchError);
		return json({ error: 'failed to query database' }, { status: 500 });
	}

	return json({ total: count, clusters });
};
