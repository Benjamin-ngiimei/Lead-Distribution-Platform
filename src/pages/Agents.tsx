import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Loader2, Pencil, Phone, Mail } from "lucide-react"; // Added Phone and Mail icons
import { toast } from "sonner";
import { api, getAuthToken } from "@/lib/api";

interface Agent {
  _id: string; // MongoDB uses _id
  name: string;
  email: string;
  mobile_number: string;
  country_code: string;
  createdAt: string;
}

const Agents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+1",
    mobileNumber: "",
    password: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    countryCode: "",
    mobileNumber: "",
  });

  useEffect(() => {
    checkAuth();
    loadAgents();
  }, []);

  const checkAuth = () => {
    if (!getAuthToken()) {
      navigate("/");
    }
  };

  const loadAgents = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const data = await api("agents", { token });
      setAgents(data || []);
    } catch (error: any) {
      toast.error("Failed to load agents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.mobileNumber || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) return;

      await api("auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile_number: formData.mobileNumber,
          country_code: formData.countryCode,
          password: formData.password,
        }),
        token,
      });

      toast.success("Agent added successfully!");
      setIsAddDialogOpen(false);
      setFormData({ name: "", email: "", countryCode: "+1", mobileNumber: "", password: "" });
      loadAgents();
    } catch (error: any) {
      toast.error(error.message || "Failed to add agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditFormData({
      name: agent.name,
      email: agent.email,
      countryCode: agent.country_code,
      mobileNumber: agent.mobile_number,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) return;

      await api(`agents/${selectedAgent._id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
          mobile_number: editFormData.mobileNumber,
          country_code: editFormData.countryCode,
        }),
        token,
      });

      toast.success("Agent updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedAgent(null);
      loadAgents();
    } catch (error: any) {
      toast.error(error.message || "Failed to update agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      await api(`agents/${id}`, {
        method: "DELETE",
        token,
      });

      toast.success("Agent deleted successfully");
      loadAgents();
    } catch (error: any) {
      toast.error("Failed to delete agent");
    }
  };

  // --- SLEEK ENTERPRISE BLUE STYLING ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="border-b border-blue-700 bg-gray-800 shadow-xl">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="outline" // Changed variant
            className="text-blue-400 border-blue-600 hover:bg-blue-900/50 hover:text-white transition-colors"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-700">
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Agent Roster</h2>
            <p className="text-gray-400 mt-1">Directory of all authorized sales agents</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors">
                <Plus className="mr-2 h-4 w-4" />
                New Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 text-gray-100 border-blue-600">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">Add New Agent</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter the required details to register a new agent account.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-gray-300">Mobile Number</Label>
                  <div className="flex gap-2">
                    <Input
                      className="w-20 bg-gray-700 border-gray-600 text-white"
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    />
                    <Input
                      id="mobile"
                      type="tel"
                      className="flex-1 bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register Agent
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-gray-800 border-gray-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">Active Agents</CardTitle>
            <CardDescription className="text-gray-400">List of all agents with their contact and creation details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No agents found. Click "New Agent" to add your first agent.
              </div>
            ) : (
              // Enhanced Table Design
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <Table className="w-full">
                  <TableHeader className="bg-gray-700/70 border-b border-blue-600">
                    <TableRow className="hover:bg-gray-700/70">
                      <TableHead className="text-blue-400 font-semibold tracking-wider uppercase">Name</TableHead>
                      <TableHead className="text-blue-400 font-semibold tracking-wider uppercase">Email</TableHead>
                      <TableHead className="text-blue-400 font-semibold tracking-wider uppercase">Mobile</TableHead>
                      <TableHead className="text-blue-400 font-semibold tracking-wider uppercase">Joined On</TableHead>
                      <TableHead className="text-right text-blue-400 font-semibold tracking-wider uppercase">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent, index) => (
                      <TableRow 
                        key={agent._id} 
                        className={`transition-colors border-gray-700 ${index % 2 === 0 ? 'hover:bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        <TableCell className="font-medium text-white">{agent.name}</TableCell>
                        <TableCell>
                          <a href={`mailto:${agent.email}`} className="text-blue-300 hover:text-blue-100 transition-colors flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {agent.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          <a href={`tel:${agent.country_code}${agent.mobile_number}`} className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {agent.country_code} {agent.mobile_number}
                          </a>
                        </TableCell>
                        <TableCell className="text-gray-400">{new Date(agent.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:bg-blue-900/50 hover:text-white p-2"
                            onClick={() => handleEdit(agent)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-900/50 hover:text-red-300 p-2"
                            onClick={() => handleDelete(agent._id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Edit Agent Dialog (Styled for Dark Mode) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 text-gray-100 border-blue-600">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Edit Agent: {selectedAgent?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the agent's details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-gray-300">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-gray-300">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mobile" className="text-gray-300">Mobile Number</Label>
              <div className="flex gap-2">
                <Input
                  className="w-20 bg-gray-700 border-gray-600 text-white"
                  value={editFormData.countryCode}
                  onChange={(e) => setEditFormData({ ...editFormData, countryCode: e.target.value })}
                />
                <Input
                  id="edit-mobile"
                  type="tel"
                  className="flex-1 bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                  value={editFormData.mobileNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Agents;