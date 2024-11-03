<script lang="ts">
	import { onMount } from 'svelte';

	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import { Separator } from '$lib/components/ui/separator';

	import type { Filter } from '.';

	export let filterValues: [null | number, null | number] = [null, null];

	export let title: Filter['title'];

	export let initialValues: Filter['initialValues'];

	export let disabled = false;

	onMount(() => {
		if (initialValues) {
			filterValues = initialValues as [null | number, null | number];
		} else {
			filterValues = [null, null];
		}
	});

	let open = false;
</script>

<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			class="dark:bg-card h-8 border-gray-300 shadow-sm dark:border-neutral-700/80 dark:text-neutral-100 dark:ring-neutral-400 dark:hover:bg-neutral-800"
			variant="outline"
			size="sm"
			{disabled}
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
				class="text-muted-foreground mr-2 h-4 w-4 dark:text-neutral-400"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path
					d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z"
				/>
			</svg>

			{title}

			{#if filterValues[0] || filterValues[1]}
				<Separator class="mx-2 h-4 dark:bg-neutral-600" orientation="vertical" />
				<Badge
					class="bg-primary hover:bg-initial rounded-sm px-1 font-normal text-white lg:hidden dark:bg-white dark:text-black"
					variant="secondary"
				>
					{filterValues.filter((e) => e).length}
				</Badge>
				<div class="hidden space-x-1.5 lg:flex">
					{#if filterValues[0]}
						<Badge
							class="bg-primary hover:bg-initial rounded-sm px-1 text-white dark:bg-white dark:text-black"
							variant="secondary"
						>
							Min: {filterValues[0]}
						</Badge>
					{/if}
					{#if filterValues[1]}
						<Badge
							class="bg-primary hover:bg-initial rounded-sm px-1 text-white dark:bg-white dark:text-black"
							variant="secondary"
						>
							Max: {filterValues[1]}
						</Badge>
					{/if}
				</div>
			{/if}
		</Button>
	</Popover.Trigger>
	<Popover.Content
		class="mt-1 w-[200px] border-gray-300 dark:border-neutral-700/80 dark:bg-neutral-900"
		align="start"
		side="bottom"
	>
		<div class="grid gap-2">
			<div class="grid grid-cols-3 items-center gap-4">
				<Label class="dark:text-neutral-100" for="min">Min</Label>
				<Input
					bind:value={filterValues[0]}
					class="dark:bg-input col-span-2 h-8 dark:border-neutral-700/80 dark:text-neutral-200 dark:ring-neutral-400"
					id="min"
					type="number"
					autocomplete="off"
				/>
			</div>
			<div class="grid grid-cols-3 items-center gap-4">
				<Label class="dark:text-neutral-100" for="max">Max</Label>
				<Input
					bind:value={filterValues[1]}
					class="dark:bg-input col-span-2 h-8 dark:border-neutral-700/80 dark:text-neutral-200 dark:ring-neutral-400"
					id="max"
					type="number"
					autocomplete="off"
				/>
			</div>
		</div>
		<Button
			class="mt-4 h-8 w-full dark:bg-neutral-100"
			size="sm"
			on:click={() => (filterValues = [null, null])}
			disabled={!filterValues[0] && !filterValues[1]}
		>
			Reset
		</Button>
	</Popover.Content>
</Popover.Root>
