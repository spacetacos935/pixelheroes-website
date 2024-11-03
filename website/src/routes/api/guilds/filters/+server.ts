import { convertServerId } from '@/utils';
import { json } from '@sveltejs/kit';

import { regionsMap } from '$lib/data';
import { supabase } from '$lib/supabase';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const [{ data: regions, error: regionsError }, { data: servers, error: serversError }] =
		await Promise.all([
			supabase
				.from('guild_rankings')
				.select('count(),region', { count: 'exact' })
				.order('region', { ascending: false })
				.returns<{ region: 'NA' | 'EU'; count: number }[]>(),
			supabase
				.from('guild_rankings')
				.select('count(),serverId,region', { count: 'exact' })
				.order('serverId', { ascending: true })
				.returns<{ serverId: number; region: string; count: number }[]>()
		]);

	if (regionsError || serversError) {
		console.error(regionsError || serversError);
		return json({ error: 'failed to query database' }, { status: 500 });
	}

	return json({
		filters: {
			region: regions.map(({ region, count }) => ({
				label: regionsMap[region] ?? 'Unknown',
				value: region,
				count: count
			})),
			serverId: servers.map(({ region, serverId, count }) => ({
				label: `${region}-${convertServerId(region, serverId)}`,
				value: serverId.toString(),
				count: count
			}))
		}
	});
};
