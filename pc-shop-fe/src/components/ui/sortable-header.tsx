import { Column } from "@tanstack/react-table";

interface SortableHeaderProps<TData, TValue> {
    column: Column<TData, TValue>;
    title: string;
}

export function SortableHeader<TData, TValue>({
    column,
    title,
}: SortableHeaderProps<TData, TValue>) {
    return (
        <div
            onClick={column.getToggleSortingHandler()}
            className="cursor-pointer flex items-center gap-1"
        >
            {title}
            {column.getCanSort() && (
                <span>
                    {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : "↕"}
                </span>
            )}
        </div>
    );
} 