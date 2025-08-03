
'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  CheckCircle,
  TrendingUp,
  BarChart2,
  ListTodo,
  Columns,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TaskStatusData {
    name: string;
    count: number;
}

interface RecentTask {
    content: string;
    created_at: string;
}

interface AnalyticsData {
    totalUsers: number;
    totalTasks: number;
    taskStatusDistribution: TaskStatusData[];
    recentTasks: RecentTask[];
}


const AnalyticsSkeleton = () => (
    <div className="flex-grow p-4 md:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({length: 4}).map((_, i) => (
            <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
        ))}
         <Card className="sm:col-span-2 lg:col-span-4">
            <CardHeader>
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-4 w-2/5" />
            </CardHeader>
            <CardContent className="h-72">
                <Skeleton className="h-full w-full" />
            </CardContent>
        </Card>
         <Card className="sm:col-span-2 lg:col-span-2">
            <CardHeader>
                 <Skeleton className="h-6 w-1/4 mb-2" />
                 <Skeleton className="h-4 w-2/5" />
            </CardHeader>
            <CardContent className="h-72">
                <Skeleton className="h-full w-full" />
            </CardContent>
        </Card>
         <Card className="sm:col-span-2 lg:col-span-2">
            <CardHeader>
                 <Skeleton className="h-6 w-1/4 mb-2" />
                 <Skeleton className="h-4 w-2/5" />
            </CardHeader>
            <CardContent className="space-y-4">
                 {Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5" />
                        <div className="flex-grow space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
);


export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/analytics');
                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }
                const analyticsData = await response.json();
                setData(analyticsData);
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error.message
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [toast]);


  if (isLoading) {
      return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="p-4 border-b">
                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            </header>
            <AnalyticsSkeleton />
        </div>
      );
  }

  if (!data) {
       return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="p-4 border-b">
                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            </header>
            <main className="flex-grow p-4 md:p-6 lg:p-8">
                 <Card className="flex items-center justify-center h-48 border-dashed">
                    <p className="text-muted-foreground">Could not load analytics data.</p>
                </Card>
            </main>
        </div>
       )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      </header>
      <main className="flex-grow p-4 md:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              All registered users in the system.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tasks
            </CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              All tasks across all boards.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks In Progress
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.taskStatusDistribution.find(s => s.name === 'In Progress')?.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tasks currently being worked on.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.taskStatusDistribution.find(s => s.name === 'Done')?.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tasks that have been completed.
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Dummy User Activity</CardTitle>
            <CardDescription>
              This is a placeholder chart showing fake daily active user data.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                  { date: 'Mon', users: 120 }, { date: 'Tue', users: 150 }, { date: 'Wed', users: 170 },
                  { date: 'Thu', users: 160 }, { date: 'Fri', users: 210 }, { date: 'Sat', users: 250 },
                  { date: 'Sun', users: 230 }
                ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend iconSize={10} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
         <Card className="sm:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>
              How many tasks are in each column.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.taskStatusDistribution} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip
                        cursor={{ fill: 'hsla(var(--accent) / 0.2)' }}
                        contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))', 
                            borderRadius: 'var(--radius)',
                        }}
                      />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-2">
            <CardHeader>
                <CardTitle>Recently Created Tasks</CardTitle>
                <CardDescription>A feed of the latest tasks added to the board.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.recentTasks.map((task, index) => (
                         <div key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-grow">
                                <p className="text-sm truncate"><strong>{task.content}</strong></p>
                                <p className="text-xs text-muted-foreground">{format(new Date(task.created_at), 'PPP p')}</p>
                            </div>
                        </div>
                    ))}
                    {data.recentTasks.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center">No recent tasks found.</p>
                    )}
                </div>
            </CardContent>
        </Card>

      </main>
    </div>
  );
}
