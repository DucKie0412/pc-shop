"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "./button";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [pageSize, setPageSize] = useState(5); // Default rows per page

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: { pagination: { pageSize } },
    });

    return (
        <div className="w-full">
            {/* Table Wrapper */}
            <div className="rounded-md border overflow-x-auto">
                <Table className="w-full">
                    {/* Table Headings */}
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-gray-100 dark:bg-gray-800">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                    key={header.id}
                                    className="text-center cursor-pointer"
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {header.isPlaceholder ? null : (
                                        <div className="flex items-center justify-center space-x-1">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}

                                        </div>
                                    )}
                                </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4 py-2 truncate max-w-[200px]" title={String(cell.getValue())}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between py-4">
                {/* Page Size Dropdown */}
                <div className="flex items-center space-x-2">
                    <span>Rows per page:</span>
                    <select
                        className="border rounded p-1"
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                            table.setPageSize(Number(e.target.value));
                        }}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                    </select>
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
                        First
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        Previous
                    </Button>
                    <span>
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>
                        Last
                    </Button>
                </div>
            </div>
        </div>
    );
}
