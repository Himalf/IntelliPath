interface SortableTableHeaderProps {
  label: string;
  column: string;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

export function SortableTableHeader({
  label,
  column,
  sortColumn,
  sortDirection,
  onSort,
}: SortableTableHeaderProps) {
  return (
    <th
      className={`px-4 py-3 cursor-pointer text-left text-xs uppercase text-gray-500 border-b border-gray-200 ${
        sortColumn === column
          ? sortDirection === "asc"
            ? "text-blue-500"
            : "text-red-500"
          : ""
      }`}
      onClick={() => onSort(column)}
    >
      {label}
      {sortColumn === column && (sortDirection === "asc" ? " ↑" : " ↓")}
    </th>
  );
}
