import { json } from '@sveltejs/kit';

import { supabase } from '$lib/supabase';

import type { RequestHandler } from './$types';

const columns = [
	'globalPowerRank',
	'serverId',
	'name',
	'notice',
	'level',
	'experience',
	'power',
	'totalMembers',
	'contributions'
];

export const GET: RequestHandler = async ({ url }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const sortBy = url.searchParams.get('sortBy') ?? 'globalPowerRank';
	const sortDir = url.searchParams.get('sortDir') ?? 'asc';
	const query = url.searchParams.get('query');

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

	const countQuery = supabase.from('guild_rankings').select('*', { count: 'exact', head: true });
	const fetchQuery = supabase.from('guild_rankings').select();

	if (query) {
		countQuery.or(`name.ilike.%${query}%, notice.ilike.%${query}%`);
		fetchQuery.or(`name.ilike.%${query}%, notice.ilike.%${query}%`);
	}

	const [{ count, error: countError }, { data: guilds, error: fetchError }] = await Promise.all([
		countQuery,
		fetchQuery.range(skip, skip + take - 1).order(sortBy, { ascending: sortDir === 'asc' })
	]);

	if (countError || fetchError) {
		console.log(countError ?? fetchError);
		return json({ error: 'failed to query database' }, { status: 500 });
	}

	return json({ total: count, guilds });
};
