import { writable } from 'svelte/store';

function createTitle() {
	const { subscribe, set } = writable('');

	return {
		subscribe,
		set: (value: string) => {
			set(`${value} - Pixel Heroes Guide`);
		},
		clear: () => {
			set('Pixel Heroes Guide');
		}
	};
}

export const title = createTitle();
