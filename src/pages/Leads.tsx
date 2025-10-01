import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, getAuthToken } from "@/lib/api";

interface Lead {
  _id: string;
  first_name: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadLeads();
  }, []);

  const checkAuth = () => {
    if (!getAuthToken()) {
      navigate("/");
    }
  };

  const loadLeads = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const data = await api("leads", { token });
      setLeads(data || []);
    } catch (error: any) {
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      await api(`leads/${id}`, {
        method: "DELETE",
        token,
      });

      toast.success("Lead deleted successfully");
      loadLeads();
    } catch (error: any) {
      toast.error("Failed to delete lead");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <nav className="border-b border-gray-800 bg-gray-900 shadow-xl">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-10 border-b border-gray-800 pb-4">
          <h2 className="text-4xl font-bold mb-1 text-white">All Leads</h2>
          <p className="text-gray-400 text-lg">Browse all leads in the system</p>
        </div>

        <Card className="bg-gray-900 border border-gray-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Leads List</CardTitle>
            <CardDescription className="text-gray-400">All leads in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No leads found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-white">Name</TableHead>
                      <TableHead className="text-white">Phone</TableHead>
                      <TableHead className="text-white">Notes</TableHead>
                      <TableHead className="text-white">Created</TableHead>
                      <TableHead className="text-right text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead._id} className="border-gray-800 hover:bg-gray-800">
                        <TableCell className="font-medium text-white">{lead.first_name}</TableCell>
                        <TableCell className="text-gray-400">{lead.phone}</TableCell>
                        <TableCell className="text-gray-400">{lead.notes || "N/A"}</TableCell>
                        <TableCell className="text-gray-400">{new Date(lead.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(lead._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leads;
