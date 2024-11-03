import {
	createTable as createHeadlessTable,
	type AnyPlugins,
	type Column,
	type HeaderLabel
} from 'svelte-headless-table';
import {
	addPagination,
	addSortBy,
	addTableFilter,
	type addColumnFilters,
	type SortByColumnOptions,
	type TableFilterColumnOptions,
	type TableFilterPropSet,
	type TableFilterState,
	type TablePlugin
} from 'svelte-headless-table/plugins';

import type { Writable } from 'svelte/store';

type Plugins = {
	filter: TablePlugin<
		any,
		TableFilterState<any>,
		TableFilterColumnOptions<any>,
		TableFilterPropSet
	>;
	sort: ReturnType<typeof addSortBy>;
	pagination: ReturnType<typeof addPagination>;
};

export type ColumnDef = {
	header: string;
	id?: string;
	accessor: keyof any | ((item: any) => unknown);
	plugins?: {
		sort?: SortByColumnOptions;
		filter?: TableFilterColumnOptions<any>;
	};
};

export function createTable(data: Writable<any[]>, total: Writable<number>) {
	return createHeadlessTable(data, {
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
			// initialSortKeys: defaultSortyKeys,
			toggleOrder: ['asc', 'desc']
		})
	});
}
