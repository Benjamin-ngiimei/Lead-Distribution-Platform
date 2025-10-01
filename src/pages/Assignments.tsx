import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, getAuthToken } from "@/lib/api";

interface Assignment {
  agent_name: string;
  agent_email: string;
  lead_first_name: string;
  lead_phone: string;
  lead_notes: string;
  assigned_at: string;
}

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadAssignments();
  }, []);

  const checkAuth = () => {
    if (!getAuthToken()) {
      navigate("/");
    }
  };

  const loadAssignments = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const data = await api("assignments", { token });
      console.log("Raw assignment data:", data);

      const formattedAssignments = data.map((item: any) => {
        if (!item.agent_id || !item.lead_id) {
          console.error("Incomplete assignment data:", item);
          return null;
        }
        return {
          agent_name: item.agent_id.name,
          agent_email: item.agent_id.email,
          lead_first_name: item.lead_id.first_name,
          lead_phone: item.lead_id.phone,
          lead_notes: item.lead_id.notes || "N/A",
          assigned_at: item.assigned_at,
        };
      }).filter(Boolean); // Filter out null values

      setAssignments(formattedAssignments);
    } catch (error: any) {
      console.error("Error loading assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setIsLoading(false);
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
          <h2 className="text-4xl font-bold mb-1 text-white">All Assignments</h2>
          <p className="text-gray-400 text-lg">Browse all lead assignments in the system</p>
        </div>

        <Card className="bg-gray-900 border border-gray-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Assignments List</CardTitle>
            <CardDescription className="text-gray-400">All lead assignments in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No assignments found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-white">Agent Name</TableHead>
                      <TableHead className="text-white">Agent Email</TableHead>
                      <TableHead className="text-white">Lead Name</TableHead>
                      <TableHead className="text-white">Lead Phone</TableHead>
                      <TableHead className="text-white">Notes</TableHead>
                      <TableHead className="text-white">Assigned Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment, index) => (
                      <TableRow key={index} className="border-gray-800 hover:bg-gray-800">
                        <TableCell className="font-medium text-white">{assignment.agent_name}</TableCell>
                        <TableCell className="text-gray-400">{assignment.agent_email}</TableCell>
                        <TableCell className="text-gray-400">{assignment.lead_first_name}</TableCell>
                        <TableCell className="text-gray-400">{assignment.lead_phone}</TableCell>
                        <TableCell className="text-gray-400 max-w-xs truncate">{assignment.lead_notes}</TableCell>
                        <TableCell className="text-gray-400">{new Date(assignment.assigned_at).toLocaleString()}</TableCell>
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

export default Assignments;
