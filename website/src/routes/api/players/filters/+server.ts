import { convertServerId } from '@/utils';
import { json } from '@sveltejs/kit';

import { guildPositionsMap, regionsMap } from '$lib/data';
import { supabase } from '$lib/supabase';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const [
		{ data: regions, error: regionsError },
		{ data: servers, error: serversError },
		{ data: guildPosts, error: guildPostsError }
	] = await Promise.all([
		supabase
			.from('user_rankings')
			.select('count(),region', { count: 'exact' })
			.order('region', { ascending: false })
			.returns<{ region: 'NA' | 'EU'; count: number }[]>(),
		supabase
			.from('user_rankings')
			.select('count(),serverId,region', { count: 'exact' })
			.order('serverId', { ascending: true })
			.returns<{ serverId: number; region: string; count: number }[]>(),
		supabase
			.from('user_rankings')
			.select('count(),guildPost', { count: 'exact' })
			.order('guildPost', { ascending: true })
			.returns<{ guildPost: number; count: number }[]>()
	]);

	if (regionsError || serversError || guildPostsError) {
		if (regionsError) console.error(regionsError);
		if (serversError) console.error(serversError);
		if (guildPostsError) console.error(guildPostsError);

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
			})),
			guildPost: guildPosts.map(({ guildPost, count }) => ({
				label: guildPositionsMap[guildPost] ?? 'Unknown',
				value: guildPost,
				count: count
			}))
		}
	});
};
