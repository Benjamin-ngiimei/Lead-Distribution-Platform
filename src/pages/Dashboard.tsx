import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Upload, LayoutDashboard, LogOut, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api, getAuthToken, setAuthToken } from "@/lib/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ agents: 0, leads: 0, assignments: 0 });

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = () => {
    if (!getAuthToken()) {
      navigate("/");
    }
  };

  const loadStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const [agentsRes, leadsRes, assignmentsRes] = await Promise.all([
        api("agents", { token }),
        api("leads", { token }),
        api("assignments", { token }),
      ]);

      setStats({
        agents: agentsRes.length || 0,
        leads: leadsRes.length || 0,
        assignments: assignmentsRes.length || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load dashboard stats");
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  // --- MINIMALIST DARK MODE STYLING ---
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <nav className="border-b border-gray-800 bg-gray-900 shadow-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-indigo-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              LEAD<span className="text-indigo-400">BOARD</span>
            </h1>
          </div>
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        {/* Header Section - Sharp, Focused */}
        <div className="mb-10 border-b border-gray-800 pb-4">
          <h2 className="text-4xl font-bold mb-1 text-white">Dashboard Overview</h2>
          <p className="text-gray-400 text-lg">Central control for all agent and lead activities.</p>
        </div>

        {/* Stats Grid - Floating, High Contrast Cards */}
        <div className="grid gap-6 lg:grid-cols-3 mb-12">
          
          {/* Card 1: Total Agents */}
          <Card className="bg-gray-900 border border-gray-800 hover:border-indigo-500 transition-all shadow-2xl cursor-pointer" onClick={() => navigate("/agents")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
                Total Agents
              </CardTitle>
              <Users className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-white mt-2">{stats.agents}</div>
              <p className="text-sm text-gray-500 mt-1">Active agents in system</p>
            </CardContent>
          </Card>

          {/* Card 2: Total Leads - Highlighted with different background/border */}
          <Card className="bg-gradient-to-br from-green-500 to-green-700 border-2 border-green-400 hover:shadow-green-500/50 transition-all shadow-2xl cursor-pointer" onClick={() => navigate("/leads")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-white">
                Total Leads
              </CardTitle>
              <Upload className="h-5 w-5 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-white mt-2">{stats.leads}</div>
              <p className="text-sm text-green-200 mt-1">Leads uploaded this period</p>
            </CardContent>
          </Card>

          {/* Card 3: Assignments */}
          <Card className="bg-gray-900 border border-gray-800 hover:border-indigo-500 transition-all shadow-2xl cursor-pointer" onClick={() => navigate("/assignments")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
                Assignments
              </CardTitle>
              <Users className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-white mt-2">{stats.assignments}</div>
              <p className="text-sm text-gray-500 mt-1">Leads assigned to agents</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards - Clear Call to Action */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Action Card 1: Manage Agents */}
          <Card 
            className="bg-gray-900 border border-gray-700 p-6 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:shadow-indigo-500/30 shadow-xl" 
            onClick={() => navigate("/agents")}
          >
            <div className="flex items-center mb-4">
              <Users className="h-7 w-7 text-indigo-400 mr-3" />
              <CardTitle className="text-2xl font-bold text-white">
                Manage Agents
              </CardTitle>
            </div>
            <p className="text-gray-400 mb-6">
              Access the agent roster to add, edit credentials, or remove personnel from the system.
            </p>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors">
              Go to Agents <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Action Card 2: Upload & Distribute */}
          <Card 
            className="bg-gray-900 border border-gray-700 p-6 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:shadow-green-500/30 shadow-xl" 
            onClick={() => navigate("/upload")}
          >
            <div className="flex items-center mb-4">
              <Upload className="h-7 w-7 text-green-400 mr-3" />
              <CardTitle className="text-2xl font-bold text-white">
                Upload & Distribute
              </CardTitle>
            </div>
            <p className="text-gray-400 mb-6">
              Upload new CSV files containing leads and efficiently assign them for follow-up.
            </p>
            <Button className="w-full bg-green-600 hover:bg-green-700 transition-colors">
              Go to Upload <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;