import { json } from '@sveltejs/kit';

import { supabase } from '$lib/supabase';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const [
		{ data: totalRegions, count: total, error: totalRegionsError },
		{ data: topPower, error: topPowerError },
		{ data: topLevel, error: topLevelError },
		{ data: topContributions, error: topContributionsError }
	] = await Promise.all([
		supabase
			.from('guild_rankings')
			.select('count(),region', { count: 'exact' })
			.order('region', { ascending: false }),
		supabase
			.from('guild_rankings')
			.select()
			.order('globalPowerRank', { ascending: true })
			.limit(1)
			.single(),
		supabase.from('guild_rankings').select().order('level', { ascending: false }).limit(1).single(),
		supabase
			.from('guild_rankings')
			.select()
			.order('globalContributionRank', { ascending: true })
			.limit(1)
			.single()
	]);

	if (totalRegionsError || topPowerError || topLevelError || topContributionsError) {
		if (totalRegionsError) console.error(totalRegionsError);
		if (topPowerError) console.error(topPowerError);
		if (topLevelError) console.error(topLevelError);
		if (topContributionsError) console.error(topContributionsError);

		return json({ error: 'failed to query database' }, { status: 500 });
	}

	return json({ stats: { total, totalRegions, topPower, topLevel, topContributions } });
};
