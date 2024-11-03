<script lang="ts">
	import Check from 'lucide-svelte/icons/check';

	import { onMount } from 'svelte';

	import { cn } from '$lib/utils.js';

	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Separator } from '$lib/components/ui/separator';

	import type { Filter, FilterOptions } from '.';

	export let filterValues: string[] = [];

	export let title: Filter['title'];

	export let options: FilterOptions[] = [];

	export let initialValues: Filter['initialValues'];

	export let disabled = false;

	onMount(() => {
		if (initialValues) {
			filterValues = initialValues;
		}
	});

	let open = false;

	function handleSelect(currentValue: string) {
		const isArray = Array.isArray(filterValues);

		if (isArray && filterValues.includes(currentValue)) {
			filterValues = filterValues.filter((v) => v !== currentValue);
		} else {
			filterValues = [...(isArray ? filterValues : []), currentValue];
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			class="dark:bg-card h-8 border-gray-300 capitalize shadow-sm dark:border-neutral-700/80 dark:text-neutral-100 dark:ring-neutral-400 dark:hover:bg-neutral-800"
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

			{#if filterValues?.length > 0}
				<Separator class="mx-2 h-4 dark:bg-neutral-600" orientation="vertical" />
				<Badge
					class="bg-primary hover:bg-initial rounded-sm px-1 font-normal text-white lg:hidden dark:bg-white dark:text-black"
					variant="secondary"
				>
					{filterValues.length}
				</Badge>
				<div class="hidden space-x-1.5 lg:flex">
					{#if filterValues.length > 2}
						<Badge
							class="bg-primary hover:bg-initial rounded-sm px-1 text-white dark:bg-white dark:text-black"
							variant="secondary"
						>
							{filterValues.length} Selected
						</Badge>
					{:else}
						{#each filterValues as option}
							<Badge
								class="bg-primary hover:bg-initial rounded-sm px-1 text-white dark:bg-white dark:text-black"
								variant="secondary"
							>
								{options?.find((e) => e.value === option)?.label ?? 'Unknown'}
							</Badge>
						{/each}
					{/if}
				</div>
			{/if}
		</Button>
	</Popover.Trigger>
	<Popover.Content
		class="mt-1 w-[200px] border-gray-300 p-0 dark:border-neutral-700/80 dark:bg-neutral-900"
		align="start"
		side="bottom"
	>
		<Command.Root class="dark:bg-neutral-900" filter={(value, search) => +value.includes(search)}>
			<Command.Input placeholder="Filter" />
			<Command.List>
				<Command.Empty>No results found</Command.Empty>
				<Command.Group class="max-h-48 overflow-auto">
					{#each options as option}
						<Command.Item
							class="cursor-pointer  dark:text-neutral-100 dark:aria-selected:bg-neutral-800"
							value={option.label}
							onSelect={() => handleSelect(option.value)}
						>
							<div
								class={cn(
									'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border dark:border-gray-300',
									filterValues.includes(option.value)
										? 'bg-primary text-primary-foreground dark:border-gray-100 dark:bg-white'
										: 'opacity-50 [&_svg]:invisible'
								)}
							>
								<Check class="h-4 w-4" />
							</div>
							<span>
								{option.label}
							</span>
							<span
								class="ml-auto flex h-4 w-4 items-center justify-center pr-2.5 font-mono text-xs dark:text-neutral-400"
							>
								{option.count.toLocaleString('en-US')}
							</span>
						</Command.Item>
					{/each}
				</Command.Group>
				<Command.Separator />
				<Command.Item
					class="cursor-pointer justify-center text-center dark:aria-selected:bg-neutral-800"
					onSelect={() => (filterValues = [])}
					disabled={filterValues.length === 0}
				>
					Clear filters
				</Command.Item>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
