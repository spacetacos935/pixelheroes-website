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

const inColumns = ['region', 'serverId'];

const rangeColumns = ['level', 'experience', 'power', 'totalMembers', 'contributions'];

export const GET: RequestHandler = async ({ url }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const sortBy = url.searchParams.get('sortBy') ?? 'globalPowerRank';
	const sortDir = url.searchParams.get('sortDir') ?? 'asc';
	const query = url.searchParams.get('query');
	const filters = url.searchParams.get('filters');

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

	if (filters) {
		try {
			const parsed = JSON.parse(filters);

			for (const [key, value] of Object.entries(parsed)) {
				if (!Array.isArray(value)) {
					throw new Error('value is not an array');
				}

				if (inColumns.includes(key)) {
					countQuery.in(key, value as string[]);
					fetchQuery.in(key, value as string[]);
				} else if (rangeColumns.includes(key)) {
					if (value[0]) {
						countQuery.gte(key, value[0]);
						fetchQuery.gte(key, value[0]);
					}

					if (value[1]) {
						countQuery.gte(key, value[1]);
						fetchQuery.lte(key, value[1]);
					}
				} else {
					throw new Error('invald key');
				}
			}
		} catch (error) {
			return json({ error: `invalid filters json: ${error}` }, { status: 400 });
		}
	}

	if (query) {
		countQuery.or(`name.ilike.%${query}%, notice.ilike.%${query}%`);
		fetchQuery.or(`name.ilike.%${query}%, notice.ilike.%${query}%`);
	}

	const [{ count, error: countError }, { data: guilds, error: fetchError }] = await Promise.all([
		countQuery,
		fetchQuery.range(skip, skip + take - 1).order(sortBy, { ascending: sortDir === 'asc' })
	]);

	if (countError || fetchError) {
		console.error(countError ?? fetchError);
		return json({ error: 'failed to query database' }, { status: 500 });
	}

	return json({ total: count, guilds });
};
