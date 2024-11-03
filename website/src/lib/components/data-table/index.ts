import DataTable from './data-table.svelte';

export type Filter = {
	title: string;
	column: string;
	options?: FilterOptions[];
	initialValues?: any[];
};

export type FilterOptions = {
	label: string;
	value: string;
	count: number;
};

export { DataTable };
