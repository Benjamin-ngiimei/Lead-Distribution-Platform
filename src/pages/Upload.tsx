import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Upload as UploadIcon, Loader2, FileText, CheckCircle } from "lucide-react"; // Added FileText and CheckCircle
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { api, getAuthToken } from "@/lib/api";

interface Lead {
  firstName: string;
  phone: string;
  notes: string;
}

interface Assignment {
  agent_name: string;
  agent_email: string;
  lead_first_name: string;
  lead_phone: string;
  lead_notes: string;
}

const Upload = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

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

      const formattedAssignments = data.map((item: any) => ({
        agent_name: item.agent_id.name,
        agent_email: item.agent_id.email,
        lead_first_name: item.lead_id.first_name,
        lead_phone: item.lead_id.phone,
        lead_notes: item.lead_id.notes || "N/A",
      }));

      setAssignments(formattedAssignments);
    } catch (error: any) {
      console.error("Error loading assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const parseFile = async (file: File): Promise<Lead[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const leads: Lead[] = jsonData.map((row: any) => ({
            firstName: row.FirstName || row.firstname || row.first_name || "",
            phone: String(row.Phone || row.phone || ""),
            notes: row.Notes || row.notes || "",
          }));

          // Validate
          if (leads.length === 0) {
            reject(new Error("File is empty"));
            return;
          }

          const invalidLeads = leads.filter(l => !l.firstName || !l.phone);
          if (invalidLeads.length > 0) {
            reject(new Error(`Some rows are missing required fields (FirstName, Phone). Found ${invalidLeads.length} invalid leads.`));
            return;
          }

          resolve(leads);
        } catch (error) {
          reject(new Error("Failed to parse file. Ensure it is a valid CSV/Excel file."));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Please upload a CSV, XLSX, or XLS file");
      return;
    }

    setIsUploading(true);

    try {
      // Parse file
      const leads = await parseFile(file);
      toast.info(`Successfully parsed ${leads.length} leads. Distributing now...`);

      const token = getAuthToken();
      if (!token) return;

      await api("leads/distribute", {
        method: "POST",
        body: JSON.stringify({ leads }),
        token,
      });

      toast.success(
        <div className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Leads distributed successfully! Total: {leads.length}
        </div>
      );
      loadAssignments();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload and distribute leads");
    } finally {
      setIsUploading(false);
      // Reset input field to allow re-uploading the same file immediately
      e.target.value = ""; 
    }
  };

  // --- MODERN, CLEAN, AND GREEN STYLING ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <nav className="border-b border-green-200 bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            className="text-gray-600 hover:text-green-600 transition-colors"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-10">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold mb-1 text-gray-900">Lead Ingestion Portal</h2>
          <p className="text-gray-500 text-lg">
            Upload new lead lists and automatically distribute them to your sales agents.
          </p>
        </div>

        {/* Upload Card - Elevated with Shadow */}
        <Card className="mb-10 shadow-xl border-t-4 border-green-500 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
              <UploadIcon className="h-6 w-6 text-green-500" /> Upload Lead File
            </CardTitle>
            <CardDescription className="text-gray-500">
              Accepted formats: CSV, XLSX, XLS. **Ensure required columns (FirstName, Phone) are present.**
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file" className="text-gray-700 font-medium">Select Lead File</Label>
                <div className="flex items-center gap-4">
                    <Input
                      id="file"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="flex-1 cursor-pointer border-gray-300 hover:border-green-500 transition-colors bg-white file:text-green-600 file:bg-green-50 file:border-none file:font-semibold"
                    />
                    <Button 
                        asChild 
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
                        disabled={isUploading}
                    >
                        <Label htmlFor="file" className="cursor-pointer flex items-center">
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <UploadIcon className="mr-2 h-4 w-4" />
                                    Browse
                                </>
                            )}
                        </Label>
                    </Button>
                </div>
              </div>
              
              {isUploading && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-sm">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-medium">File accepted. Processing and distributing leads...</span>
                </div>
              )}

              <div className="text-sm text-gray-500 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Download template file (not implemented here, but good design hint)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Table - Clean and Segmented */}
        <Card className="shadow-lg border-t-4 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Recent Assignments</CardTitle>
            <CardDescription className="text-gray-500">Leads successfully distributed and assigned to agents.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAssignments ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-green-500" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-dashed p-6 rounded-lg bg-gray-100">
                <UploadIcon className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No lead assignments recorded yet.</p>
                <p className="text-sm">Start by uploading your first lead file above.</p>
              </div>
            ) : (
              <div className="overflow-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow className="hover:bg-gray-100">
                      <TableHead className="text-gray-600 font-bold">Agent Name</TableHead>
                      <TableHead className="text-gray-600 font-bold">Lead Name</TableHead>
                      <TableHead className="text-gray-600 font-bold">Lead Phone</TableHead>
                      <TableHead className="text-gray-600 font-bold">Agent Email</TableHead>
                      <TableHead className="text-gray-600 font-bold">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment, index) => (
                      <TableRow 
                        key={index}
                        className="even:bg-gray-50 hover:bg-green-50 transition-colors border-gray-200"
                      >
                        <TableCell className="font-semibold text-gray-800">{assignment.agent_name}</TableCell>
                        <TableCell>{assignment.lead_first_name}</TableCell>
                        <TableCell className="text-green-600 font-medium">{assignment.lead_phone}</TableCell>
                        <TableCell className="text-sm text-gray-500">{assignment.agent_email}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-gray-600">{assignment.lead_notes}</TableCell>
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

export default Upload;