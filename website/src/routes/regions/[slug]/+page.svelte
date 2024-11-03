<script lang="ts">
	import { createTable } from 'svelte-headless-table';
	import {
		addPagination,
		addSortBy,
		addTableFilter,
		type SortKey
	} from 'svelte-headless-table/plugins';

	import CircleAlert from 'lucide-svelte/icons/circle-alert';

	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	import { onNavigate } from '$app/navigation';

	import type { Views } from '$lib/supabase';
	import { convertServerId, debounce } from '$lib/utils';

	import DataTable from '$lib/components/data-table.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	import type { PageData } from './$types';

	export let data: PageData;
	$: region = data.region;

	type Server = Views<'server_statistics'>;
	type Cluster = Views<'cluster_statistics'>;
	type ServerCluster = Server | Cluster;

	const defaultResults: ServerCluster[] = Array(6)
		.fill(null)
		.map(() => ({
			serverId: 0,
			clusterId: 0,
			clusterStart: 0,
			clusterEnd: 0,
			totalPlayers: 0,
			activePlayers: 0,
			totalGuilds: 0,
			activeGuilds: 0,
			topGuildIdByContributions: 0,
			topGuildNameByContributions: '',
			topGuildContributions: 0,
			topGuildIdByPower: 0,
			topGuildNameByPower: '',
			topGuildPower: 0,
			topPlayerId: 0,
			topPlayerName: '',
			topPlayerPower: 0,
			totalPower: 0
		})) as unknown as ServerCluster[];

	let results = writable<ServerCluster[]>(defaultResults);
	let total = writable(0);

	// let tab: 'Clusters' | 'Servers' = 'Clusters';
	// let oldTab: 'Clusters' | 'Servers' = tab;

	let tab = writable<'Clusters' | 'Servers'>('Clusters');

	const defaultSortyKeys: SortKey[] = [{ id: 'id', order: 'asc' }];

	const table = createTable(results, {
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase()),
			serverSide: true
		}),
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

	const columns = table.createColumns([
		table.column({
			id: 'id',
			header: 'Servers',
			// @ts-ignore
			accessor: ({ region, clusterStart, clusterEnd, serverId }) => {
				if ($tab === 'Clusters' && clusterStart && clusterEnd) {
					return `${convertServerId(region, clusterStart)} - ${convertServerId(region, clusterEnd)}`;
				} else if (serverId) {
					return convertServerId(region, serverId);
				}
			}
		}),
		table.column({
			accessor: 'totalPlayers',
			header: 'Players',
			cell: ({ value }) => value.toLocaleString('en-US')
		}),
		table.column({
			accessor: 'activePlayers',
			header: 'Active Players',
			cell: ({ value }) => value.toLocaleString('en-US')
		}),
		table.column({
			accessor: 'totalGuilds',
			header: 'Guilds',
			cell: ({ value }) => value.toLocaleString('en-US')
		}),
		table.column({
			accessor: 'activeGuilds',
			header: 'Active Guilds',
			cell: ({ value }) => value.toLocaleString('en-US')
		}),
		table.column({
			accessor: 'totalPower',
			header: 'Total Power',
			cell: ({ value }) => value.toLocaleString('en-US')
		}),
		table.column({
			id: 'topGuildContributions',
			header: 'Most Active Guild',
			accessor: ({ topGuildNameByContributions, topGuildContributions }) =>
				`${topGuildNameByContributions} (${topGuildContributions.toLocaleString('en-US')})`
		}),
		table.column({
			id: 'topGuildPower',
			header: 'Most Powerful Guild',
			accessor: ({ topGuildNameByPower, topGuildPower }) =>
				`${topGuildNameByPower} (${topGuildPower.toLocaleString('en-US')})`
		}),
		table.column({
			id: 'topPlayerPower',
			header: 'Most Powerful Player',
			accessor: ({ topPlayerName, topPlayerPower }) =>
				`${topPlayerName} (${topPlayerPower.toLocaleString('en-US')})`
		})
	]);

	const viewModel = table.createViewModel(columns);
	const { pluginStates } = viewModel;
	const { pageIndex } = pluginStates.pagination;
	const { sortKeys } = pluginStates.sort;

	let loading = true;
	let initialLoad = false;

	async function fetchData() {
		loading = true;

		const startTime = Date.now();
		const minLoadTime = 500;

		const params = new URLSearchParams({
			region: region.code,
			page: $pageIndex.toString(),
			sortBy: $sortKeys.length > 0 ? $sortKeys[0].id : defaultSortyKeys[0].id,
			sortDir: $sortKeys.length > 0 ? $sortKeys[0].order : defaultSortyKeys[0].order
		});

		const resp = await fetch(
			`${$tab === 'Clusters' ? '/api/clusters' : '/api/servers'}?${params.toString()}`
		);
		const data: { total: number; clusters: Cluster[]; servers: Server[] } = await resp.json();

		$total = data.total;

		if ($total > 0) {
			$results = $tab === 'Clusters' ? data.clusters : data.servers;
		} else {
			$results = defaultResults;
		}

		const elapsedTime = Date.now() - startTime;
		const remainingTime = Math.max(0, minLoadTime - elapsedTime);

		if (remainingTime > 0) {
			await new Promise((resolve) => setTimeout(resolve, remainingTime));
		}

		initialLoad = true;
		loading = false;
	}

	let serverStats: { mostActive?: Server; leastActive?: Server } = {};

	let clusterStats: { mostActive?: Cluster; leastActive?: Cluster } = {};

	async function fetchServerStats() {
		const resp = await fetch(`/api/servers/stats?region=${region.code}`);
		const json = await resp.json();
		serverStats = json.stats;
	}

	async function fetchClusterStats() {
		const resp = await fetch(`/api/clusters/stats?region=${region.code}`);
		const json = await resp.json();
		clusterStats = json.stats;
	}

	let debouncedFetchData = debounce(fetchData, 300);
	let debouncedFetchServerStats = debounce(fetchServerStats, 300);
	let debouncedFetchClusterStats = debounce(fetchClusterStats, 300);

	let tableContainer: HTMLDivElement;
	let debouncedScroll = debounce(() => {
		if (window.scrollY > tableContainer.getBoundingClientRect().top + window.scrollY) {
			tableContainer.scrollIntoView();
		}
	}, 300);

	onMount(() => {
		fetchServerStats();
		fetchClusterStats();
		fetchData();

		const subscriptions = [
			pageIndex.subscribe(() => {
				debouncedScroll();
				debouncedFetchData();
			}),
			sortKeys.subscribe(() => {
				$pageIndex = 1;

				debouncedScroll();
				debouncedFetchData();
			}),
			tab.subscribe(() => {
				$pageIndex = 1;

				debouncedScroll();
				debouncedFetchData();
			})
		];

		return () => {
			subscriptions.forEach((unsub) => unsub());
		};
	});

	onNavigate(() => {
		$tab = 'Clusters';
		$pageIndex = 1;
		$sortKeys = defaultSortyKeys;
		initialLoad = false;
		serverStats = {};
		clusterStats = {};

		debouncedFetchData();
		debouncedFetchServerStats();
		debouncedFetchClusterStats();
	});

	// $: if ($pageIndex || $sortKeys || tab) {
	// 	if (browser) {
	// 		if (oldTab !== tab) {
	// 			$pageIndex = 1;
	// 			$sortKeys = defaultSortyKeys;
	// 			oldTab = tab;
	// 			initialLoad = false;
	// 		}

	// 		debouncedFetchData();
	// 	}
	// }
</script>

<div>
	<h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900">
		{region.code === 'NA' ? '🌎' : '🌍'}
		{region.name}
		({region.code})
	</h1>
	<p class="text-muted-foreground mt-1 max-w-4xl text-base">
		Statistics are computed per guild, server, and cluster. This data is updated every day at reset.
	</p>

	<Alert.Root class="my-8 border-blue-200 bg-blue-100">
		<CircleAlert class="h-4 w-4 !text-blue-800" />
		<Alert.Title class="font-semibold tracking-normal text-blue-700">
			Activity Calculation
		</Alert.Title>
		<Alert.Description class="text-blue-700">
			Activity is based on a player's weekly guild contribution. This is then summed up per guild,
			server, and cluster. Each cluster consists of 5 servers starting from 1.
		</Alert.Description>
	</Alert.Root>
</div>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	<Card.Root class="border-gray-300">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
			<Card.Title class="text-primary text-base font-medium">Most Active Server</Card.Title>
		</Card.Header>
		<Card.Content class="p-4 pt-0">
			{#if serverStats.mostActive}
				<div class="text-2xl font-bold">
					{convertServerId(serverStats.mostActive.region, serverStats.mostActive.serverId)}
				</div>
				<p class="text-muted-foreground mt-1 text-sm font-medium">
					{serverStats.mostActive.activePlayers.toLocaleString('en-US')} Active Players &#x2022;
					{serverStats.mostActive.activeGuilds.toLocaleString('en-US')} Active Guilds
				</p>
			{:else}
				<div class="animate-pulse">
					<div class="mt-2 h-2.5 w-32 rounded bg-slate-200" />
					<div class="mt-4 h-2 w-12 rounded bg-slate-200" />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
	<Card.Root class="border-gray-300">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
			<Card.Title class="text-base font-medium text-red-600">Least Active Server</Card.Title>
		</Card.Header>
		<Card.Content class="p-4 pt-0">
			{#if serverStats.leastActive}
				<div class="text-2xl font-bold">
					{convertServerId(serverStats.leastActive.region, serverStats.leastActive.serverId)}
				</div>
				<p class="text-muted-foreground mt-1 text-sm font-medium">
					{serverStats.leastActive.activePlayers.toLocaleString('en-US')} Active Players &#x2022;
					{serverStats.leastActive.activeGuilds.toLocaleString('en-US')} Active Guilds
				</p>
			{:else}
				<div class="animate-pulse">
					<div class="mt-2 h-2.5 w-32 rounded bg-slate-200" />
					<div class="mt-4 h-2 w-12 rounded bg-slate-200" />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
	<Card.Root class="border-gray-300">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
			<Card.Title class="text-primary text-base font-medium">Most Active Cluster</Card.Title>
		</Card.Header>
		<Card.Content class="p-4 pt-0">
			{#if clusterStats.mostActive}
				<div class="text-2xl font-bold">
					{convertServerId(clusterStats.mostActive.region, clusterStats.mostActive.clusterStart)} - {convertServerId(
						clusterStats.mostActive.region,
						clusterStats.mostActive.clusterEnd
					)}
				</div>
				<p class="text-muted-foreground mt-1 text-sm font-medium">
					{clusterStats.mostActive.activePlayers.toLocaleString('en-US')} Active Players &#x2022;
					{clusterStats.mostActive.activeGuilds.toLocaleString('en-US')} Active Guilds
				</p>
			{:else}
				<div class="animate-pulse">
					<div class="mt-2 h-2.5 w-32 rounded bg-slate-200" />
					<div class="mt-4 h-2 w-12 rounded bg-slate-200" />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
	<Card.Root class="border-gray-300">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
			<Card.Title class="text-base font-medium text-red-600">Least Active Cluster</Card.Title>
		</Card.Header>
		<Card.Content class="p-4 pt-0">
			{#if clusterStats.leastActive}
				<div class="text-2xl font-bold">
					{convertServerId(clusterStats.leastActive.region, clusterStats.leastActive.clusterStart)} -
					{convertServerId(clusterStats.leastActive.region, clusterStats.leastActive.clusterEnd)}
				</div>
				<p class="text-muted-foreground mt-1 text-sm font-medium">
					{clusterStats.leastActive.activePlayers.toLocaleString('en-US')} Active Players &#x2022;
					{clusterStats.leastActive.activeGuilds.toLocaleString('en-US')} Active Guilds
				</p>
			{:else}
				<div class="animate-pulse">
					<div class="mt-2 h-2.5 w-32 rounded bg-slate-200" />
					<div class="mt-4 h-2 w-12 rounded bg-slate-200" />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<Tabs.Root bind:value={$tab} class="mb-2 mt-6 rounded-md border border-gray-300 shadow-sm">
	<Tabs.List class="grid h-11 w-full grid-cols-2">
		<Tabs.Trigger
			class="data-[state=active]:bg-primary disabled text-base data-[state=active]:font-medium data-[state=active]:text-white"
			value="Clusters"
			disabled={!initialLoad}
		>
			Clusters
		</Tabs.Trigger>
		<Tabs.Trigger
			class="data-[state=active]:bg-primary disabled text-base data-[state=active]:text-white"
			value="Servers"
			disabled={!initialLoad}
		>
			Servers
		</Tabs.Trigger>
	</Tabs.List>
</Tabs.Root>

<div class="scroll-mt-32" bind:this={tableContainer}>
	<DataTable
		{viewModel}
		{total}
		{loading}
		{initialLoad}
		boldedColumns={['id']}
		perPage={20}
		searchPlaceholder="Search for a guild name or description"
	/>
</div>
