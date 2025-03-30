"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import ConfirmAction from "@/components/ConfirmAction";
import { getAxiosErrorMessage } from "@/utils/ax";

const SpotlightDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const updateStatus = async ({
    status,
  }: {
    status: "APPROVED" | "DISAPPROVED";
  }) => {
    const response = await axios.put(`/api/admin/spotLight/${id}`, { status });
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      toast.success("Status updated successfully");
      router.push("/admin/spotlight");
    },
    onError: (error) => {
      console.log(error);
      toast.error(getAxiosErrorMessage(error, "Failed to update status"));
    },
  });

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Spotlight Application Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6">Application ID: {id}</p>
        <div className="flex gap-4">
          <ConfirmAction
            action={() => mutation.mutate({ status: "APPROVED" })}
            isDisabled={mutation.isPending}
            description="Are you sure you want to approve this application?"
          >
            <Button
              // onClick={() => mutation.mutate({ status: "APPROVED" })}
              className="bg-green-600 hover:bg-green-700"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Processing..." : "Approve"}
            </Button>
          </ConfirmAction>
          <ConfirmAction
            action={() => mutation.mutate({ status: "DISAPPROVED" })}
            isDisabled={mutation.isPending}
            description="Are you sure you want to disapprove this application?"
          >
            <Button
              // onClick={() => mutation.mutate({ status: "DISAPPROVED" })}
              variant="destructive"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Processing..." : "Disapprove"}
            </Button>
          </ConfirmAction>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpotlightDetailsPage;
