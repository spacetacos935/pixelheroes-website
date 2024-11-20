<script lang="ts">
	// import { intervalToDuration } from 'date-fns';

	import { createTable } from 'svelte-headless-table';
	import {
		addColumnFilters,
		addHiddenColumns,
		addPagination,
		addSortBy,
		addTableFilter,
		type SortKey
	} from 'svelte-headless-table/plugins';

	import CircleHelp from 'lucide-svelte/icons/circle-help';

	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	import { title as titleStore } from '$lib/stores';
	import type { Views } from '$lib/supabase';
	import { convertServerId, debounce } from '$lib/utils';

	import Alert from '$lib/components/alert.svelte';
	import { DataTable, type Filter } from '$lib/components/data-table';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tooltip from '$lib/components/ui/tooltip';

	titleStore.set('Players');

	type User = Views<'user_rankings'>;

	const defaultPlayers: User[] = Array(6)
		.fill(null)
		.map(() => ({
			globalPowerRank: 0,
			serverId: BigInt(0),
			name: '',
			level: 0,
			power: BigInt(0),
			guilds: { name: '' },
			guildPost: 0
		})) as unknown as User[];

	let players = writable<User[]>(defaultPlayers);
	let total = writable(0);

	const defaultSortyKeys: SortKey[] = [{ id: 'globalPowerRank', order: 'asc' }];

	const table = createTable(players, {
		hide: addHiddenColumns({
			initialHiddenColumnIds: ['region', 'serverPowerRank']
		}),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase()),
			serverSide: true
		}),
		colFilter: addColumnFilters({ serverSide: true }),
		pagination: addPagination({
			serverItemCount: total,
			serverSide: true,
			initialPageSize: 20,
			initialPageIndex: 1
		}),
		sort: addSortBy({
			disableMultiSort: true,
			serverSide: true,
			initialSortKeys: defaultSortyKeys,
			toggleOrder: ['asc', 'desc']
		})
	});

	// function dateDiffHuman({ start, end }: { start: number; end: number }) {
	// 	const duration = intervalToDuration({ start, end });

	// 	if (duration.days && duration.days > 0) {
	// 		return `${duration.days} day${duration.days > 1 ? 's' : ''}`;
	// 	}

	// 	const hours = duration.hours || 0;
	// 	const minutes = duration.minutes || 0;
	// 	const seconds = duration.seconds || 0;

	// 	if (hours > 0) {
	// 		return `${hours} hour${hours > 1 ? 's' : ''}`;
	// 	}

	// 	if (minutes > 0) {
	// 		return `${minutes} minute${minutes > 1 ? 's' : ''}`;
	// 	}

	// 	return `${seconds} second${seconds !== 1 ? 's' : ''}`;
	// }

	// const now = new Date('2024-10-18T00:00:00Z');

	const columns = table.createColumns([
		table.column({
			accessor: 'region',
			header: 'region'
		}),
		table.column({
			accessor: 'globalPowerRank',
			header: 'Global Rank',
			cell: ({ value }) => value.toLocaleString('en-US')
		}),
		table.column({
			accessor: 'serverPowerRank',
			header: 'Server Rank',
			cell: ({ value }) => value.toLocaleString('en-US')
		}),
		table.column({
			id: 'serverId',
			header: 'Server',
			accessor: ({ region, serverId }) => `${region}-${convertServerId(region, serverId)}`
		}),
		table.column({
			accessor: 'name',
			header: 'Name'
		}),
		table.column({
			accessor: 'level',
			header: 'Level'
		}),
		table.column({
			accessor: 'power',
			header: 'Power',
			cell: ({ value }) => value.toLocaleString('en-US')
		}),
		table.column({
			accessor: 'vip',
			header: 'VIP',
			cell: ({ value }) => (value ? value : 'N/A')
		}),
		// table.column({
		// 	accessor: 'offlineTime',
		// 	header: 'Last Online',
		// 	cell: ({ value }) => dateDiffHuman({ start: new Date(value), end: now })
		// }),
		table.column({
			accessor: 'guildName',
			header: 'Guild'
		}),
		table.column({
			accessor: 'guildPost',
			header: 'Guild Position',
			cell: ({ value }) => {
				switch (value) {
					case 0:
						return 'Member';
					case 1:
						return 'Leader';
					case 2:
						return 'Vice';
					case 3:
						return 'Elder';
					default:
						return 'N/A';
				}
			}
		})
	]);

	const viewModel = table.createViewModel(columns);
	const { pluginStates } = viewModel;
	const { pageIndex } = pluginStates.pagination;
	const { sortKeys } = pluginStates.sort;
	const { filterValue } = pluginStates.filter;
	const { filterValues } = pluginStates.colFilter as {
		filterValues: Writable<Record<string, any[]>>;
	};
	const { hiddenColumnIds } = pluginStates.hide;

	let loading = true;
	let initialLoad = false;

	async function fetchPlayers() {
		loading = true;

		const startTime = Date.now();
		const minLoadTime = 500;

		const params = new URLSearchParams({
			page: $pageIndex.toString(),
			sortBy: $sortKeys.length > 0 ? $sortKeys[0].id : defaultSortyKeys[0].id,
			sortDir: $sortKeys.length > 0 ? $sortKeys[0].order : defaultSortyKeys[0].order
		});

		if ($filterValue) {
			params.append('query', $filterValue);
		}

		const filter = Object.fromEntries(
			Object.entries($filterValues).filter(([, value]) => value.length > 0)
		);
		if (Object.keys(filter).length > 0) {
			params.append('filters', JSON.stringify(filter));

			if (filter.region.length === 1) {
				$hiddenColumnIds = ['region', 'globalPowerRank'];
			} else {
				$hiddenColumnIds = ['region', 'serverPowerRank'];
			}
		}

		const resp = await fetch(`/api/players?${params.toString()}`);
		const { total, players }: { total: number; players: User[] } = await resp.json();

		$total = total;
		$players = $total > 0 ? players : defaultPlayers;

		const elapsedTime = Date.now() - startTime;
		const remainingTime = Math.max(0, minLoadTime - elapsedTime);

		if (remainingTime > 0) {
			await new Promise((resolve) => setTimeout(resolve, remainingTime));
		}

		initialLoad = true;
		loading = false;
	}

	let stats: {
		total?: number;
		totalRegions?: { count: number; region: string }[];
		topPower?: User;
		topLevel?: User;
		activePlayers?: number;
		activePlayersRegions?: { count: number; region: string }[];
	} = {};

	async function fetchStats() {
		const resp = await fetch('/api/players/stats');
		const json = await resp.json();
		stats = json.stats;
	}

	let filters: Filter[] = [
		{
			title: 'Region',
			column: 'region',
			options: [
				{ label: 'North America', value: 'NA', count: 0 },
				{ label: 'Europe', value: 'EU', count: 0 }
			],
			initialValues: ['NA', 'EU']
		},
		{ title: 'Server', column: 'serverId', options: [] },
		{ title: 'Level', column: 'level' },
		{ title: 'Power', column: 'power' },
		{ title: 'VIP', column: 'vip' },
		{
			title: 'Guild Position',
			column: 'guildPost',
			options: [
				{ label: 'Member', value: '0', count: 0 },
				{ label: 'Leader', value: '1', count: 0 },
				{ label: 'Vice', value: '2', count: 0 },
				{ label: 'Elder', value: '3', count: 0 }
			]
		}
	];

	async function fetchFilters() {
		const resp = await fetch('/api/players/filters');
		const json = await resp.json();
		filters[0].options = json.filters.region;
		filters[1].options = json.filters.serverId;
		filters[5].options = json.filters.guildPost;
	}

	let debounced = debounce(fetchPlayers, 300);

	let tableContainer: HTMLDivElement;
	let debouncedScroll = debounce(() => {
		if (window.scrollY > tableContainer.getBoundingClientRect().top + window.scrollY) {
			tableContainer.scrollIntoView();
		}
	}, 300);

	onMount(() => {
		fetchStats();
		fetchFilters();
		debounced();

		const subscriptions = [
			pageIndex.subscribe(() => {
				debouncedScroll();
				debounced();
			}),
			filterValue.subscribe(() => {
				$pageIndex = 1;
				$sortKeys = defaultSortyKeys;
				// initialLoad = false;

				debouncedScroll();
				debounced();
			}),
			filterValues.subscribe(() => {
				$pageIndex = 1;
				$sortKeys = defaultSortyKeys;
				initialLoad = false;

				debouncedScroll();
				debounced();
			}),
			sortKeys.subscribe(() => {
				$pageIndex = 1;

				debouncedScroll();
				debounced();
			})
		];

		return () => {
			subscriptions.forEach((unsub) => unsub());
		};
	});
</script>

<div>
	<h1 class="text-3xl font-bold leading-tight text-gray-900 dark:text-white">👾 Players</h1>
	<p class="text-muted-foreground mt-1 max-w-4xl text-base dark:text-neutral-400">
		A list of all players that belong to a guild. This data is updated every day at reset.
	</p>

	<Alert
		title="Limited Data Available"
		description="This data currently only includes North America and Europe. SEA will be added in the future."
	/>
</div>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	<Card.Root class="border-gray-300 dark:border-neutral-700/80">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
			<Card.Title class="text-primary text-base font-medium dark:text-sky-400">
				Total Players
			</Card.Title>
		</Card.Header>
		<Card.Content class="p-4 pt-0">
			{#if stats.total && stats.totalRegions}
				<div class="text-2xl font-bold dark:text-neutral-100">
					{stats.total.toLocaleString('en-US')} Players
				</div>
				<p class="text-muted-foreground mt-1 text-sm font-medium dark:text-neutral-400">
					{#each stats.totalRegions as item, index}
						{#if index > 0}
							&nbsp;&#x2022;
						{/if}
						{item.region}: {item.count.toLocaleString('en-US')}
					{/each}
				</p>
			{:else}
				<div class="animate-pulse">
					<div class="mt-2 h-2.5 w-32 rounded bg-slate-200 dark:bg-neutral-700" />
					<div class="mt-4 h-2 w-12 rounded bg-slate-200 dark:bg-neutral-700" />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
	<Card.Root class="border-gray-300 dark:border-neutral-700/80">
		<Card.Header class="flex flex-row items-center space-y-0 p-4 pb-2">
			<Card.Title class="text-base font-medium text-purple-500 dark:text-violet-400">
				Active Players
			</Card.Title>
			<Tooltip.Root openDelay={200}>
				<Tooltip.Trigger asChild let:builder>
					<Button class="ml-2 h-fit w-fit" builders={[builder]} variant="ghost" size="icon">
						<CircleHelp class="text-muted-foreground h-4 w-4 dark:text-neutral-500" />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content class="dark:border-neutral-700/80 dark:bg-neutral-900">
					<p class="dark:text-neutral-100">Players with more than 0 guild weekly contributions</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Card.Header>
		<Card.Content class="p-4 pt-0">
			{#if stats.activePlayers && stats.activePlayersRegions}
				<div class="text-2xl font-bold dark:text-neutral-100">
					{stats.activePlayers.toLocaleString('en-US')} Players
				</div>
				<p class="text-muted-foreground mt-1 text-sm font-medium dark:text-neutral-400">
					{#each stats.activePlayersRegions as item, index}
						{#if index > 0}
							&nbsp;&#x2022;
						{/if}
						{item.region}: {item.count.toLocaleString('en-US')}
					{/each}
				</p>
			{:else}
				<div class="animate-pulse">
					<div class="mt-2 h-2.5 w-32 rounded bg-slate-200 dark:bg-neutral-700" />
					<div class="mt-4 h-2 w-12 rounded bg-slate-200 dark:bg-neutral-700" />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
	<Card.Root class="border-gray-300 dark:border-neutral-700/80">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
			<Card.Title class="text-base font-medium text-red-500 dark:text-red-400">
				Most Powerful
			</Card.Title>
		</Card.Header>
		<Card.Content class="p-4 pt-0">
			{#if stats.topPower}
				<div class="text-2xl font-bold dark:text-neutral-100">
					{stats.topPower.region}-{convertServerId(stats.topPower.region, stats.topPower.serverId)}
					{stats.topPower.name}
				</div>
				<p class="text-muted-foreground mt-1 text-sm font-medium dark:text-neutral-400">
					Power: {stats.topPower.power.toLocaleString('en-US')}
				</p>
			{:else}
				<div class="animate-pulse">
					<div class="mt-2 h-2.5 w-32 rounded bg-slate-200 dark:bg-neutral-700" />
					<div class="mt-4 h-2 w-12 rounded bg-slate-200 dark:bg-neutral-700" />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
	<Card.Root class="border-gray-300 dark:border-neutral-700/80">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
			<Card.Title class="text-base font-medium text-green-600 dark:text-emerald-500">
				Highest Level
			</Card.Title>
		</Card.Header>
		<Card.Content class="p-4 pt-0">
			{#if stats.topLevel}
				<div class="text-2xl font-bold dark:text-neutral-100">
					{stats.topLevel.region}-{convertServerId(stats.topLevel.region, stats.topLevel.serverId)}
					{stats.topLevel.name}
				</div>
				<p class="text-muted-foreground mt-1 text-sm font-medium dark:text-neutral-400">
					Level: {stats.topLevel.level.toLocaleString('en-US')}
				</p>
			{:else}
				<div class="animate-pulse">
					<div class="mt-2 h-2.5 w-32 rounded bg-slate-200 dark:bg-neutral-700" />
					<div class="mt-4 h-2 w-12 rounded bg-slate-200 dark:bg-neutral-700" />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<div class="scroll-mt-32" bind:this={tableContainer}>
	<DataTable
		{viewModel}
		{total}
		{loading}
		{initialLoad}
		enableSearch={true}
		boldedColumns={['name']}
		perPage={20}
		searchPlaceholder="Search for a player or guild name"
		{filters}
	/>
</div>
