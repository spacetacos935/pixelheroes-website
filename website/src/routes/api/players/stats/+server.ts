import { json } from '@sveltejs/kit';

import { supabase } from '$lib/supabase';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const [
		{ data: totalRegions, count: total, error: totalRegionsError },
		{ data: topPower, error: topPowerError },
		{ data: topLevel, error: topLevelError },
		{ data: activePlayersRegions, count: activePlayers, error: activePlayersError }
	] = await Promise.all([
		supabase
			.from('user_rankings')
			.select('count(),region', { count: 'exact' })
			.order('region', { ascending: false }),
		supabase
			.from('user_rankings')
			.select()
			.order('globalPowerRank', { ascending: true })
			.limit(1)
			.single(),
		supabase.from('user_rankings').select().order('level', { ascending: false }).limit(1).single(),
		supabase
			.from('user_rankings')
			.select('count(),region', { count: 'exact' })
			.gt('guildContributionsWeek', 0)
			.order('region', { ascending: false })
		// .or(`offlineTime.gte.${new Date('2024-10-16T00:00:00Z').toISOString()},offlineTime.is.null`)
	]);

	if (totalRegionsError || topPowerError || topLevelError || activePlayersError) {
		if (totalRegionsError) console.log(totalRegionsError);
		if (topPowerError) console.log(topPowerError);
		if (topLevelError) console.log(topLevelError);
		if (activePlayersError) console.log(activePlayersError);

		return json({ error: 'failed to query database' }, { status: 500 });
	}

	return json({
		stats: { total, totalRegions, topPower, topLevel, activePlayers, activePlayersRegions }
	});
};
