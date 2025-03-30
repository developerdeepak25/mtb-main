"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
import { DataTable } from "@/components/leaderboard/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { columns, LeaderboardUser } from "@/components/leaderboard/columnDef";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_LEADERBOARD_PAGE,
  DEFAULT_LEADERBOARD_PAGE_LIMIT,
} from "@/lib/constant";

type SortKey = "jpEarned" | "jpSpent" | "jpBalance" | "jpTransaction";

const LeaderboardContent = () => {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || DEFAULT_LEADERBOARD_PAGE;
  const limit =
    Number(searchParams.get("limit")) || DEFAULT_LEADERBOARD_PAGE_LIMIT;
  const orderBy = (searchParams.get("orderBy") as SortKey) || "jpEarned";
  const router = useRouter();

  const fetchLeaderboardData = async () => {
    const { data } = await axios.get(
      `/api/user/leaderboard?limit=${limit}&page=${page}&orderBy=${orderBy}`
    );
    return data;
  };
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", page, limit],
    queryFn: fetchLeaderboardData,
  });
  console.log(data);
  const { users } = data || [];
  const totalPages = data?.totalPages || 1;

  // const [sortBy, setSortBy] = useState<SortKey>("jpEarned");

  // Memoize sortedUsers to ensure proper re-renders
  const sortedUsers = useMemo(() => {
    if (!users) return [];
    return [...users].sort(
      (a: LeaderboardUser, b: LeaderboardUser) => b[orderBy] - a[orderBy]
    );
  }, [users, orderBy]);
  console.log("sortedUsers", sortedUsers);
  console.log("sortedUsers[0]", sortedUsers?.[0]);

  if (isLoading) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Leaderboard</CardTitle>
        <Select
          onValueChange={(value) =>
            router.push(
              `/leaderboard?orderBy=${value}&page=${page}&limit=${limit}`
            )
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by JP Type" defaultValue={orderBy} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jpEarned">JP Earned</SelectItem>
            <SelectItem value="jpSpent">JP Spent</SelectItem>
            <SelectItem value="jpBalance">JP Balance</SelectItem>
            <SelectItem value="jpTransaction">JP Transaction</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={sortedUsers}
          totalPages={totalPages}
        />
      </CardContent>
    </Card>
  );
};

const LeaderboardPage = () => {
  return (
    <Suspense
      fallback={
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
};

export default LeaderboardPage;
