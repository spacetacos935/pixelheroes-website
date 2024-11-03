<script lang="ts">
	import { ModeWatcher, toggleMode } from 'mode-watcher';

	import SquareArrowOutUpRight from 'lucide-svelte/icons/external-link';
	import Menu from 'lucide-svelte/icons/menu';
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';

	import { page } from '$app/stores';

	import { title } from '$lib/stores/title';

	import { Button } from '$lib/components/ui/button';
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

<ModeWatcher />

<div class="dark:bg-background min-h-screen bg-[#f8f9fb]">
	<header
		class="bg-background sticky top-0 z-50 flex h-16 items-center gap-4 border-b px-4 md:px-28 dark:border-neutral-800 dark:bg-neutral-900"
	>
		<nav
			class="hidden flex-col gap-6 text-lg md:flex md:flex-row md:items-center md:gap-5 md:text-base lg:gap-6"
		>
			<img class="mx-auto flex h-12 items-center" src="/images/logo.png" alt="Pixel Heroes Logo" />
			{#each urls as { name, path, external }}
				{@const isActive = isActiveNav?.name === name}

				<a
					class="text-muted-foreground hover:text-foreground aria-current-page:text-primary dark:aria-current-page:text-neutral-100 dark:aria-current-page:font-medium inline-flex items-center font-medium transition-colors dark:font-normal dark:text-neutral-400 dark:hover:text-neutral-100"
					aria-current={`${isActive ? 'page' : 'false'}`}
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
				<Button
					variant="ghost"
					size="icon"
					class="shrink-0 md:hidden dark:border-neutral-700/80 dark:text-neutral-100"
					builders={[builder]}
				>
					<Menu class="h-5 w-5" />
					<span class="sr-only">Toggle navigation menu</span>
				</Button>
			</Sheet.Trigger>
			<Sheet.Content class="dark:bg-neutral-900" side="left">
				<nav class="grid gap-6 text-lg font-medium">
					<img class="items-center2 flex h-12" src="/images/logo.png" alt="Pixel Heroes Logo" />
					{#each urls as { name, path, external }}
						{@const isActive = isActiveNav?.name === name}

						<a
							class="text-muted-foreground hover:text-foreground aria-current-page:text-primary dark:aria-current-page:text-neutral-100 dark:aria-current-page:font-medium inline-flex items-center font-medium transition-colors dark:font-normal dark:text-neutral-400 dark:hover:text-neutral-100"
							aria-current={`${isActive ? 'page' : 'false'}`}
							href={path}
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

		<Button
			class="ml-auto dark:text-neutral-200 dark:hover:bg-neutral-800"
			on:click={toggleMode}
			variant="ghost"
			size="icon"
		>
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</header>
	<main class="mx-auto w-full max-w-[95rem] px-4 py-8 sm:px-6 lg:px-8">
		<slot />
	</main>
</div>

<svelte:head>
	<title>{$title}</title>
</svelte:head>
