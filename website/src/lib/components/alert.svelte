<script lang="ts">
	import CircleAlert from 'lucide-svelte/icons/circle-alert';

	import * as Alert from '$lib/components/ui/alert';

	export let title: string;

	export let description: string;
</script>

<Alert.Root class="my-8 border-blue-200 bg-blue-100 dark:border-blue-900/80 dark:bg-blue-900/30">
	<CircleAlert class="h-4 w-4 !text-blue-800 dark:!text-sky-300" />
	<Alert.Title class="font-semibold tracking-normal text-blue-700 dark:text-sky-300">
		{title}
	</Alert.Title>
	<Alert.Description class="text-blue-700 dark:text-sky-300">
		{description}
	</Alert.Description>
</Alert.Root>
