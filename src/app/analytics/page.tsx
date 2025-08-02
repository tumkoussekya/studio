
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Clock,
  MapPin,
  CheckCircle,
  TrendingUp,
  BarChart2,
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
import { Badge } from '@/components/ui/badge';

const userActivityData = [
  { date: 'Mon', users: 120 },
  { date: 'Tue', users: 150 },
  { date: 'Wed', users: 170 },
  { date: 'Thu', users: 160 },
  { date: 'Fri', users: 210 },
  { date: 'Sat', users: 250 },
  { date: 'Sun', users: 230 },
];

const featureUsageData = [
  { name: 'Chat', usage: 85 },
  { name: 'Kanban', usage: 65 },
  { name: 'Whiteboard', usage: 45 },
  { name: 'Meetings', usage: 30 },
  { name: 'Surveys', usage: 20 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      </header>
      <main className="flex-grow p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">250</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> +8.2%
              </span>
              from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Session Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24m 15s</div>
            <p className="text-xs text-muted-foreground">
              -1.5% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Task Completion Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">
              75 tasks completed this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Area</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coffee Room</div>
            <p className="text-xs text-muted-foreground">
              3,204 visits this month
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>
              Daily active users over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userActivityData}>
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
        
         <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
            <CardDescription>
              Most used features across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureUsageData} layout="vertical" margin={{ left: 10 }}>
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
                    <Bar dataKey="usage" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A live feed of recent user actions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-grow">
                            <p className="text-sm"><strong>user@example.com</strong> entered the <strong>Coffee Room</strong>.</p>
                            <p className="text-xs text-muted-foreground">2 minutes ago</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-grow">
                            <p className="text-sm"><strong>Alice</strong> completed the task "Deploy to production".</p>
                            <p className="text-xs text-muted-foreground">15 minutes ago</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <BarChart2 className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-grow">
                            <p className="text-sm"><strong>Charlie</strong> created a new survey: "Q4 Planning".</p>
                            <p className="text-xs text-muted-foreground">1 hour ago</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

      </main>
    </div>
  );
}
