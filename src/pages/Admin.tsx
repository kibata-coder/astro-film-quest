import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import MaintenanceToggle from "@/features/admin/MaintenanceToggle";
import { Users, Activity, PlayCircle, Star, ArrowUpDown } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface AdminUser {
  id: string;
  email: string;
  sign_up_date: string;
  last_sign_in_at: string;
}

interface GlobalStats {
  total_watch_history: number;
  total_ratings: number;
  total_bookmarks: number;
  total_collections: number;
}

const COLORS = ['#8b5cf6', '#3b82f6']; // Purple and Blue for the Pie Chart

type SortOption = 'newest_user' | 'oldest_user' | 'latest_signin' | 'oldest_signin';

const Admin = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest_user');
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase.rpc('get_admin_users');
      // Fetch global stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_admin_global_stats');

      if (usersError || statsError) {
        console.error("RPC Error:", usersError || statsError);
        setError("Unauthorized access. Please ensure you are logged in as the admin and have run the setup SQL in Supabase.");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have permission to view this page.",
        });
      } else {
        setUsers(usersData || []);
        if (statsData && statsData.length > 0) {
          setGlobalStats(statsData[0]);
        }
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, [toast]);

  const activeUsersCount = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > sevenDaysAgo).length;
  }, [users]);

  const pieData = useMemo(() => [
    { name: 'Active (7d)', value: activeUsersCount },
    { name: 'Inactive', value: users.length - activeUsersCount }
  ], [activeUsersCount, users.length]);

  const areaData = useMemo(() => {
    const grouped = users.reduce((acc, user) => {
      const date = new Date(user.sign_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array and accumulate for a growth chart, or just show daily signups. 
    // We'll show daily signups for simplicity.
    return Object.entries(grouped).map(([date, signups]) => ({ date, signups }));
  }, [users]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      switch (sortOption) {
        case 'newest_user':
          return new Date(b.sign_up_date).getTime() - new Date(a.sign_up_date).getTime();
        case 'oldest_user':
          return new Date(a.sign_up_date).getTime() - new Date(b.sign_up_date).getTime();
        case 'latest_signin': {
          const timeA = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
          const timeB = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
          return timeB - timeA;
        }
        case 'oldest_signin': {
          const timeA = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
          const timeB = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
          if (timeA === 0) return 1; // push never signed in to bottom
          if (timeB === 0) return -1;
          return timeA - timeB;
        }
        default:
          return 0;
      }
    });
  }, [users, sortOption]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto mt-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-destructive mb-8">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto mt-20 animate-in fade-in zoom-in duration-500">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
        Admin Analytics
      </h1>

      <MaintenanceToggle />

      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users (7d)</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsersCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Watch History</CardTitle>
            <PlayCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats?.total_watch_history || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ratings</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats?.total_ratings || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Area Chart - Sign Ups */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">User Sign-ups Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#e5e5e5' }}
                  />
                  <Area type="monotone" dataKey="signups" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSignups)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Active vs Inactive */}
        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">User Activity Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#e5e5e5' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Users Table Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold">User Directory</h2>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-[180px] bg-card/50">
              <SelectValue placeholder="Sort users..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest_user">Newest Users</SelectItem>
              <SelectItem value="oldest_user">Oldest Users</SelectItem>
              <SelectItem value="latest_signin">Latest Sign-in</SelectItem>
              <SelectItem value="oldest_signin">Oldest Sign-in</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>User ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Sign Up Date</TableHead>
              <TableHead>Last Sign In</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.id} className="transition-colors hover:bg-muted/50">
                <TableCell className="font-mono text-xs text-muted-foreground">{user.id}</TableCell>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{new Date(user.sign_up_date).toLocaleString()}</TableCell>
                <TableCell>
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : <span className="text-muted-foreground italic">Never</span>}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Admin;
