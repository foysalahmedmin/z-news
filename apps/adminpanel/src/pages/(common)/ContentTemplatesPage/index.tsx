import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Layout, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import Loader from "@/components/partials/Loader";
import PageHeader from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { deleteTemplate, fetchTemplates } from "@/services/template.service";

const ContentTemplatesPage = () => {
  const navigate = useNavigate();
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
        name="Content Templates"
        breadcrumbs={[
          { name: "News Articles", path: "/news-articles" },
          { name: "Templates" },
        ]}
        slot={
          <Button onClick={() => navigate("/content-templates/add")}>
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        }
      />

      <Card>
        <Card.Content className="p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Category</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Created At</Table.Head>
                <Table.Head className="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {templates.length === 0 ? (
                <Table.Row>
                  <Table.Cell
                    colSpan={5}
                    className="text-muted-foreground py-8 text-center"
                  >
                    No templates found. Create one to get started.
                  </Table.Cell>
                </Table.Row>
              ) : (
                templates.map((template) => (
                  <Table.Row key={template._id}>
                    <Table.Cell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Layout className="text-muted-foreground h-4 w-4" />
                        {template.name}
                      </div>
                      {template.description && (
                        <p className="text-muted-foreground text-xs font-normal">
                          {template.description}
                        </p>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {template.category?.name || "Uncategorized"}
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${template.is_active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}`}
                      >
                        {template.is_active ? "Active" : "Inactive"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(template.created_at).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/content-templates/edit/${template._id}`)
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
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ContentTemplatesPage;
