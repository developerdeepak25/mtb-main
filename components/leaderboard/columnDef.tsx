import { ColumnDef } from "@tanstack/react-table";

export interface LeaderboardUser {
  id: string;
  name: string;
  category: string;
  jpEarned: number;
  jpSpent: number;
  jpTransaction: number;
  jpBalance: number;
  
}

export const columns: ColumnDef<LeaderboardUser>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "jpEarned",
    header: "JP Earned",
  },
  {
    accessorKey: "jpSpent",
    header: "JP Spent",
  },
  {
    accessorKey: "jpBalance",
    header: "JP Balance",
  },
  {
    accessorKey: "jpTransaction",
    header: "JP Transaction",
  },
];
