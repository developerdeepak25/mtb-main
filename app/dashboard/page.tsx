"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmAction from "@/components/ConfirmAction";
import { getAxiosErrorMessage } from "@/utils/ax";
import { SpotlightStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";

// TODO remoce default useQuery retry to none of below 3 or 2
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: spotlight, isLoading } = useQuery({
    queryKey: ["spotlight", session?.user?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/user/spotlight`);
      return response.data;
    },
    retry: false,
    enabled: !!session?.user?.id,
  });

  console.log(spotlight);

  const createSpotlight = async () => {
    const response = await axios.post("/api/user/spotlight", {
      userId: session?.user?.id,
    });
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: createSpotlight,
    onSuccess: (data) => {
      console.log(data);
      toast.success("Spotlight application submitted successfully");
    },
    onError: (error) => {
      toast.error(getAxiosErrorMessage(error));
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-4">Welcome to your dashboard!</p>
        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/profile")}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Go to Profile
          </Button>

          <Button
            onClick={() => router.push("/leaderboard")}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded"
          >
            Go to Leaderboard
          </Button>
        </div>

        <ConfirmAction
          action={() => mutation.mutate()}
          isDisabled={mutation.isPending}
        >
          <Button
            disabled={status === "loading" || mutation.isPending}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Apply for Spotlight
          </Button>
        </ConfirmAction>

        {isLoading ? (
          // TODO: add shimmer/skeleton
          <p className="mt-4">Loading spotlight status...</p>
        ) : (
          spotlight && (
            <>
              <div className="mt-4 p-4  rounded-lg border-black border">
                <h2 className="text-xl font-semibold">Spotlight Status</h2>
                <p className="mt-2">
                  Status:{" "}
                  {spotlight?.status === SpotlightStatus.ACTIVE
                    ? "ACTIVE"
                    : spotlight?.status ?? "N/A"}{" "}
                </p>
                <p className="mt-1">
                  Applied on:{" "}
                  {new Date(spotlight?.appliedAt).toLocaleDateString()}
                </p>
              </div>
            </>
          )
        )}
      </div>
    </Layout>
  );
}
