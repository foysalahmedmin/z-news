"use client";

// Ported from apps/adminpanel's src/pages/(common)/ContentTemplatesPage/index.tsx.
// react-router's useNavigate -> next/navigation's useRouter, and the old
// compound `Card.Content` / `Table.Row` dot-notation -> flat imports from
// @/components/ui/*. Data fetching/mutations still go through
// @tanstack/react-query + the existing @/services/template.service.ts,
// which already targets apps/frontend's admin-api client.
import PageHeader from "@/components/partials/admin/PageHeader";
import Loader from "@/components/partials/admin/Loader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { deleteTemplate, fetchTemplates } from "@/services/template.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Layout, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ContentTemplatesView = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => fetchTemplates(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      toast.success("Template deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete template",
      );
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <Loader />;

  const templates = templatesData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        slot={
          <Button onClick={() => router.push("/admin/content-templates/add")}>
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground py-8 text-center"
                  >
                    No templates found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Layout className="text-muted-foreground h-4 w-4" />
                        {template.name}
                      </div>
                      {template.description && (
                        <p className="text-muted-foreground text-xs font-normal">
                          {template.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {template.category?.name || "Uncategorized"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${template.is_active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}`}
                      >
                        {template.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(template.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/admin/content-templates/edit/${template._id}`,
                            )
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(template._id)}
                          isLoading={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentTemplatesView;
