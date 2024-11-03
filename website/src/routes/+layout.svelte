<script lang="ts">
	import SquareArrowOutUpRight from 'lucide-svelte/icons/external-link';
	import Menu from 'lucide-svelte/icons/menu';

	import { page } from '$app/stores';

	import { title } from '$lib/stores/title';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet';

	import '../app.css';

	const urls = [
		{
			name: 'Guilds',
			path: '/guilds',
			external: false
		},
		{
			name: 'Players',
			path: '/players',
			external: false
		},
		{
			name: 'North America',
			path: '/regions/north-america',
			external: false
		},
		{
			name: 'Europe',
			path: '/regions/europe',
			external: false
		},
		{
			name: "Jake's Guide",
			path: 'https://www.jakespixelguide.com',
			external: true
		}
	];

	$: isActiveNav = urls.find(({ path }) => $page.url.pathname.startsWith(path));

	let sideNavOpen = false;
</script>

<div class="min-h-screen bg-[#f8f9fb]">
	<header
		class="bg-background sticky top-0 z-50 flex h-16 items-center gap-4 border-b px-4 md:px-28"
	>
		<nav
			class="hidden flex-col gap-6 text-lg md:flex md:flex-row md:items-center md:gap-5 md:text-base lg:gap-6"
		>
			<img class="mx-auto flex h-12 items-center" src="/images/logo.png" alt="Pixel Heroes Logo" />
			{#each urls as { name, path, external }}
				{@const isActive = isActiveNav?.name === name}

				<a
					class="text-primary hover:text-foreground inline-flex items-center font-medium transition-colors"
					class:text-primary={isActive}
					class:text-muted-foreground={!isActive}
					class:font-semibold={isActive}
					href={path}
				>
					{name}

					{#if external}
						<SquareArrowOutUpRight class="ml-1.5 h-4 w-4" />
					{/if}
				</a>
			{/each}
		</nav>
		<Sheet.Root bind:open={sideNavOpen}>
			<Sheet.Trigger asChild let:builder>
				<Button variant="outline" size="icon" class="shrink-0 md:hidden" builders={[builder]}>
					<Menu class="h-5 w-5" />
					<span class="sr-only">Toggle navigation menu</span>
				</Button>
			</Sheet.Trigger>
			<Sheet.Content side="left">
				<nav class="grid gap-6 text-lg font-medium">
					<img class="items-center2 flex h-12" src="/images/logo.png" alt="Pixel Heroes Logo" />
					{#each urls as { name, path, external }}
						{@const isActive = isActiveNav?.name === name}

						<a
							class="text-primary hover:text-foreground inline-flex items-center font-medium transition-colors"
							class:text-primary={isActive}
							class:text-muted-foreground={!isActive}
							class:font-semibold={isActive}
							href={path}
							target={`${external ? '_blank' : '_self'}`}
						>
							{name}

							{#if external}
								<SquareArrowOutUpRight class="ml-1.5 h-4 w-4" />
							{/if}
						</a>
					{/each}
				</nav>
			</Sheet.Content>
		</Sheet.Root>
	</header>
	<main class="mx-auto w-full max-w-[95rem] px-4 py-8 sm:px-6 lg:px-8">
		<slot />
	</main>
</div>

<svelte:head>
	<title>{$title}</title>
</svelte:head>
