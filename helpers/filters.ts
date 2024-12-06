import {SetStateAction} from "react";

export interface SelectedFilters {
  courses: boolean;
  canvasEvents: boolean;
  gradescopeEvents: boolean;
  myEvents: boolean;
}

export function toggleFilter(
    filterKey: keyof SelectedFilters,
    setSelectedFilters: (value: SetStateAction<SelectedFilters>) => void
): void {
  setSelectedFilters((prev) => ({
    ...prev,
    [filterKey]: !prev[filterKey],
  }));
}
