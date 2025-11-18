import { CommonModule } from "@angular/common";
import { Component, input, InputSignal, WritableSignal, ModelSignal, model, signal, effect } from "@angular/core";
import { Checkbox } from "@shared/components/checkbox/checkbox";
import { Input } from "@shared/components/input/input";
import { FilterType } from "@shared/types/FilterType";
import { FilterValueType } from "@shared/types/FilterValueType";
import { RouterLink } from "@angular/router";

type SelectedFilterType = FilterValueType & { filterId: string };
type ExpandedFilterType = FilterType & {
    isOpened: boolean,
    filtersAmount: number,
    filtersCheckedAmount: number,
    searchValue: string,
    filtersShownValues: FilterValueType[]
};

@Component({
    selector: "category-filters",
    imports: [CommonModule, Checkbox, Input, RouterLink],
    templateUrl: "./filters.html",
    styleUrl: "./filters.css"
})
export class Filters {
    public readonly filters: InputSignal<FilterType[]> = input<FilterType[]>([]);
    protected expandedFilters: WritableSignal<ExpandedFilterType[]> = signal<ExpandedFilterType[]>([]);

    public selectedFilters: ModelSignal<SelectedFilterType[]> = model<SelectedFilterType[]>([]);

    public state: ModelSignal<"loading" | "loaded"> = model<"loading" | "loaded">("loaded");

    constructor() {
        effect(() => {
            this.expandedFilters.update((expandedFilters: ExpandedFilterType[]) => this.filters()
                .map((filter: FilterType) => {
                    const existingFilter: ExpandedFilterType | undefined = expandedFilters.find((expandedFilter: ExpandedFilterType) => expandedFilter.id === filter.id);

                    if (existingFilter) {
                        return {
                            ...filter,
                            isOpened: existingFilter.isOpened,
                            filtersAmount: filter.filterValues.length,
                            filtersCheckedAmount: existingFilter.filtersCheckedAmount,
                            searchValue: "",
                            filtersShownValues: filter.filterValues
                        };
                    }

                    return {
                        ...filter,
                        isOpened: true,
                        filtersAmount: filter.filterValues.length,
                        filtersCheckedAmount: 0,
                        searchValue: "",
                        filtersShownValues: filter.filterValues
                    }
                }));
        });

        effect(() => {
            const selectedFilters: SelectedFilterType[] = this.selectedFilters();

            this.expandedFilters.update((filters: ExpandedFilterType[]) => filters.map((filter: ExpandedFilterType) => ({
                ...filter,
                filtersCheckedAmount: selectedFilters.filter((selectedFilter: SelectedFilterType) => selectedFilter.filterId === filter.id).length
            })));
        });
    }

    protected isValueSelected(valueId: string): boolean {
        return this.selectedFilters().some((filterValue: SelectedFilterType) => filterValue.id === valueId);
    }

    protected toggleFilter(filterId: string): void {
        this.expandedFilters.update((filters: ExpandedFilterType[]) => (
            filters.map((filter: ExpandedFilterType) => {
                if (filter.id === filterId) {
                    return {
                        ...filter,
                        isOpened: !filter.isOpened
                    };
                }
                return filter;
            })));
    }

    protected onCheckboxChange(filterId: string, value: FilterValueType): void {
        this.selectedFilters.update((selectedFilters: SelectedFilterType[]) => {
            if (this.isValueSelected(value.id)) {
                return selectedFilters.filter((filterValue: SelectedFilterType) => filterValue.id !== value.id);
            }
            return [...selectedFilters, { ...value, filterId }];
        });
    }

    protected onFilterSearchValueChange(filterId: string, value: string | number): void {
        this.expandedFilters.update((filters: ExpandedFilterType[]) => (
            filters.map((filter: ExpandedFilterType) => {
                if (filter.id === filterId) {
                    return {
                        ...filter,
                        searchValue: value.toString(),
                        filtersShownValues: filter.filterValues.filter((filterValue: FilterValueType) => (
                            filterValue.name.toLowerCase().includes(value.toString().toLowerCase())
                        ))
                    };
                }
                return filter;
            })
        ));
    }
}