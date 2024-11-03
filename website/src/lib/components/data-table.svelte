<script lang="ts">
	import { Render, Subscribe, type Column, type TableViewModel } from 'svelte-headless-table';
	import { mediaQuery } from 'svelte-legos';

	import ArrowDownWideNarrow from 'lucide-svelte/icons/arrow-down-wide-narrow';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import ArrowUpNarrowWide from 'lucide-svelte/icons/arrow-up-narrow-wide';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import Search from 'lucide-svelte/icons/search';

	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';

	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Popover from '$lib/components/ui/popover';
	import * as Table from '$lib/components/ui/table';

	export let viewModel: TableViewModel<any, any>;

	export let total: Readable<number>;

	export let perPage: number;

	export let loading = true;

	export let initialLoad = false;

	export let enableSearch = false;

	export let searchPlaceholder = '';

	export let boldedColumns: string[] = [];

	export let columns: Column[] = [];

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = viewModel;
	const { pageIndex } = pluginStates.pagination;
	const { filterValue } = pluginStates.filter;

	const isDesktop = mediaQuery('(min-width: 768px)');

	$: showBlur = loading || $total === 0;

	let tableTop: HTMLDivElement;
	let tableContainer: HTMLDivElement;
	let isIntersecting = false;
	let shouldStick = false;

	// $: headerClass =
	// 	showBlur || !shouldStick
	// 		? ''
	// 		: isIntersecting
	// 			? 'md:top-0'
	// 			: 'md:sticky md:top-[3.9rem] md:shadow';

	let headerClass = '';

	onMount(() => {
		// Check if table is wider than its container
		const checkTableWidth = () => {
			if (tableContainer) {
				const table = tableContainer.querySelector('table');
				if (table) {
					shouldStick = table.scrollWidth <= tableContainer.clientWidth;
				}
			}
		};

		// Initial check
		checkTableWidth();

		// Recheck on window resize
		window.addEventListener('resize', checkTableWidth);

		// Setup intersection observer only if we should stick
		const observer = new IntersectionObserver(
			([entry]) => {
				isIntersecting = entry.isIntersecting;
			},
			{
				threshold: 0,
				rootMargin: '-64px 0px 0px 0px'
			}
		);

		if (tableTop && shouldStick) {
			observer.observe(tableTop);
		}

		return () => {
			window.removeEventListener('resize', checkTableWidth);
			if (tableTop) {
				observer.unobserve(tableTop);
			}
		};
	});
</script>

{#if enableSearch}
	<div class="relative mt-6 w-full">
		<div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
			<Search class="text-muted-foreground h-5 w-5" />
		</div>
		<Input
			class="bg-background h-11 rounded-lg border-gray-300 pl-10 text-base shadow-sm md:w-[200px] lg:w-full"
			type="text"
			placeholder={searchPlaceholder}
			autocomplete="off"
			maxlength={50}
			bind:value={$filterValue}
		/>
	</div>
{/if}

<div class="relative {$$restProps.class || ''}">
	{#if loading}
		<div
			class="absolute inset-0 z-50 mt-[48px] flex flex-col items-center justify-center bg-gray-50 bg-opacity-50"
		>
			<LoaderCircle class="text-primary h-12 w-12 animate-spin" />
		</div>
	{:else if $total === 0}
		<div
			class="absolute inset-0 z-50 mt-[48px] flex flex-col items-center justify-center bg-gray-50 bg-opacity-50"
		>
			<p class="text-xl font-semibold text-black">No Results Found</p>
			<p class="mt-1 font-medium text-gray-600">Your search didn't match any entries</p>
		</div>
	{/if}

	<div bind:this={tableTop} class="h-px w-full" />

	<div
		bind:this={tableContainer}
		class="mt-4 rounded-md border border-gray-300 bg-white shadow-sm"
		class:select-none={showBlur}
		class:overflow-auto={showBlur || !shouldStick}
	>
		<Table.Root {...$tableAttrs}>
			<Table.Header class="w-[90rem]">
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row class="bg-muted hover:bg-muted {headerClass}">
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs let:props props={cell.props()}>
									<Table.Head {...attrs}>
										<div class="flex items-center">
											<!-- <Popover.Root>
												<Popover.Trigger class="mr-2">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="24"
														height="24"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
														class="h-4 w-4"
														><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
															d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z"
														/></svg
													>
												</Popover.Trigger>
												<Popover.Content>Place content for the popover here.</Popover.Content>
											</Popover.Root> -->
											<!-- <Button
												class="mr-2 p-0"
												variant="ghost"
												disabled={loading}
												on:click={props.sort.toggle}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="h-4 w-4"
													><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
														d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z"
													/></svg
												>
											</Button> -->
											<div class="font-semibold text-black">
												<Render of={cell.render()} />
											</div>
											<Button
												class="ml-auto p-0"
												variant="ghost"
												disabled={loading}
												on:click={props.sort.toggle}
											>
												{#if props.sort.order === 'desc'}
													<ArrowDownWideNarrow class="text-primary h-4 w-4" />
												{:else if props.sort.order === 'asc'}
													<ArrowUpNarrowWide class="text-primary h-4 w-4" />
												{:else}
													<ArrowUpDown class="h-4 w-4" />
												{/if}
											</Button>
										</div>
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>

			<Table.Body class={`${showBlur && 'blur-sm'}`} {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell {...attrs}>
										<div
											class="whitespace-pre-wrap"
											class:font-semibold={boldedColumns.includes(cell.id)}
										>
											<Render of={cell.render()} />
										</div>
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>

{#if initialLoad && $total > 0}
	<div class="flex flex-col items-center justify-between gap-y-4 py-4 md:flex-row">
		<p class="text-muted-foreground text-sm font-medium">
			Showing entries {(($pageIndex - 1) * 20 + 1).toLocaleString('en-US')} to
			{(($pageIndex - 1) * 20 + 21).toLocaleString('en-US')} out of
			{$total.toLocaleString('en-US')} total
		</p>

		<Pagination.Root
			class="mx-0 w-fit"
			count={$total}
			siblingCount={$isDesktop ? 1 : 0}
			{perPage}
			bind:page={$pageIndex}
			let:pages
		>
			<Pagination.Content class="gap-[initial] md:gap-1">
				<Pagination.Item>
					<Pagination.PrevButton />
				</Pagination.Item>
				{#each pages as page (page.key)}
					{@const isCurrent = $pageIndex === page.value}

					{#if page.type === 'ellipsis'}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item isVisible={isCurrent}>
							<Pagination.Link
								class="w-fit px-4"
								{page}
								isActive={isCurrent}
								on:click={() => ($pageIndex = page.value)}
							>
								{page.value.toLocaleString('en-US')}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton />
				</Pagination.Item>
			</Pagination.Content>
		</Pagination.Root>
	</div>
{/if}
