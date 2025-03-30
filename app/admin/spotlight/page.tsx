"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SpotlightStatus } from "@prisma/client";
import { useEffect } from "react";
import { toast } from "sonner";
import { getAxiosErrorMessage } from "@/utils/ax";

interface SpotlightApplication {
  id: string;
  user: {
    name: string;
    email: string;
  };
  status: SpotlightStatus;
  appliedAt: string;
}

const fetchSpotlightApplications = async () => {
  const { data } = await axios.get("/api/admin/spotLight/application");
  return data;
};

const updateSpotlightStatus = async (id: string) => {
  const response = await axios.put(`/api/admin/spotLight/${id}`, {
    status: "IN_REVIEW",
  });
  return response.data;
};

const getStatusBadgeVariant = (
  status: SpotlightStatus
): "default" | "destructive" | "secondary" | "outline"  => {
  switch (status) {
    case "APPROVED":
      return "secondary";
    case "DISAPPROVED":
      return "destructive";
    case "IN_REVIEW":
      return "outline";
    case "ACTIVE":
      return "default";
    case "EXPIRED": // here it means spotlight is remove after being showed on the home
      return "default";
    default:
      return "outline";
  }
};

const DashboardPage = () => {
  const router = useRouter();
  const { data: applications, isLoading } = useQuery({
    queryKey: ["spotlightApplications"],
    queryFn: fetchSpotlightApplications,
  });

  const mutation = useMutation({
    mutationFn: updateSpotlightStatus,
    onSuccess: (_, id) => {
      router.push(`/admin/spotlight/${id}`);
      toast.success("Status updated to IN_REVIEW");
    },
    onError: (error) => {
      toast.error(getAxiosErrorMessage(error, "Failed to update status"));
      console.error(error);
    },
  });

  useEffect(() => {
    console.log(applications);
  });

  const handleReview = (
    spotlightId: string,
    currentStatus: SpotlightStatus
  ) => {
    if (currentStatus === "APPLIED") {
      mutation.mutate(spotlightId);
    } else {
      router.push(`/admin/spotlight/${spotlightId}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Spotlight Applications</CardTitle>
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
      <CardHeader>
        <CardTitle>Spotlight Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied On</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications?.map((app: SpotlightApplication) => (
              <TableRow key={app.id}>
                <TableCell>{app.user.name}</TableCell>
                <TableCell>{app.user.email}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(app.status)}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(app.appliedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="default"
                    onClick={() => handleReview(app.id, app.status)}
                    disabled={
                      mutation.isPending && mutation.variables === app.id
                    }
                  >
                    view
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DashboardPage;
