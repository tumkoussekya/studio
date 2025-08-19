
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, KanbanSquare, Users, Shapes, ClipboardList, Shield, MessageSquare, Video, LayoutDashboard, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TourGuide from '@/components/TourGuide';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedCard } from '@/components/AnimatedCard';
import { cookies } from 'next/headers';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LogoutButton from '@/components/world/LogoutButton';


async function getUserData() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, role, profile_complete, first_name')
        .eq('id', user.id)
        .single();
    
    if (error) {
        console.error('Error fetching user data:', error);
        return null;
    }

    return userData;
}

function DashboardSkeleton() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                 <Skeleton className="h-8 w-40" />
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                 </div>
            </header>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Skeleton className="h-9 w-1/2 mb-2" />
                    <Skeleton className="h-5 w-1/3" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Skeleton className="h-7 w-7 rounded-full" />
                                    <Skeleton className="h-6 w-32" />
                                 </CardTitle>
                                <Skeleton className="h-4 w-full mt-1" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </main>
        </div>
    );
}


async function Dashboard() {
    const user = await getUserData();

    if (!user) {
        return redirect('/login');
    }
    
    if (!user.profile_complete) {
        redirect('/profile');
    }

    const isAdmin = user.role === 'Admin';
    const userInitial = user.first_name ? user.first_name.charAt(0) : user.email.charAt(0);

    return (
        <div className="flex flex-col min-h-screen bg-background">
             <TourGuide isAdmin={isAdmin} />
            <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <h1 id="tour-logo" className="text-2xl font-bold text-primary font-headline tracking-wider">SyncroSpace</h1>
                 <div id="tour-header-buttons" className="flex items-center gap-4">
                    <ThemeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src="https://placehold.co/40x40.png" alt={user.email} />
                                    <AvatarFallback>{userInitial.toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.first_name || 'User'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                               <LogoutButton />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
            </header>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div id="tour-welcome" className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.first_name || user?.email || 'Explorer'}!</h2>
                    <p className="text-muted-foreground">What would you like to do today?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatedCard id="tour-world">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Users className="text-accent" />
                                <span>Enter the World</span>
                            </CardTitle>
                            <CardDescription>
                                Explore the 2D world, chat with others, and discover new connections.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Link href="/world">
                             <Button className="w-full">
                                Go to World <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                           </Link>
                        </CardContent>
                    </AnimatedCard>
                     <AnimatedCard id="tour-chat">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                               <MessageSquare className="text-accent" />
                                <span>Team Chat</span>
                            </CardTitle>
                            <CardDescription>
                                Talk with your team in 1:1 and group conversations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/chat">
                                <Button className="w-full">
                                    Open Chat <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </AnimatedCard>
                     <AnimatedCard>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                               <Video className="text-accent" />
                                <span>Meeting Rooms</span>
                            </CardTitle>
                            <CardDescription>
                                Schedule and join video meetings with your team.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/meetings">
                                <Button className="w-full">
                                    Go to Meetings <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </AnimatedCard>
                     <AnimatedCard>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                               <Shapes className="text-accent" />
                                <span>Whiteboards</span>
                            </CardTitle>
                            <CardDescription>
                                Brainstorm and collaborate in real-time on a shared canvas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/whiteboard">
                                <Button className="w-full">
                                    Go to Whiteboard <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </AnimatedCard>
                     <AnimatedCard>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                               <ClipboardList className="text-accent" />
                                <span>Surveys & Forms</span>
                            </CardTitle>
                            <CardDescription>
                                Create and share internal surveys and forms with your team.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/surveys">
                                <Button className="w-full">
                                    Open Surveys <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </AnimatedCard>
                    <AnimatedCard>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                            <KanbanSquare className="text-accent" />
                            <span>Manage Tasks</span>
                            </CardTitle>
                            <CardDescription>
                                Organize your projects and ideas on the Kanban board.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/kanban">
                                <Button className="w-full">
                                    Open Kanban <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </AnimatedCard>
                    {isAdmin && (
                        <>
                            <AnimatedCard>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <LayoutDashboard className="text-accent" />
                                        <span>Analytics</span>
                                    </CardTitle>
                                    <CardDescription>
                                        View usage statistics and user engagement metrics.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/analytics">
                                        <Button className="w-full">
                                            View Analytics <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </AnimatedCard>
                            <AnimatedCard id="tour-admin">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                    <Shield className="text-accent" />
                                    <span>Admin Panel</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Manage users, teams, and system settings.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/admin">
                                        <Button className="w-full">
                                            Go to Admin <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </AnimatedCard>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard />
        </Suspense>
    );
}
