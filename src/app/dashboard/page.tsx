
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, KanbanSquare, Users, Shapes, ClipboardList, Shield, MessageSquare, Video } from 'lucide-react';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import Link from 'next/link';
import LogoutButton from '@/components/world/LogoutButton';
import type { User } from '@/models/User';


function getUser(): (User & {userId: string}) | null {
    const token = cookies().get('token');
    if (!token) return null;
    try {
        const decoded = verify(token.value, process.env.JWT_SECRET || 'fallback-secret');
        return decoded as (User & { userId: string });
    } catch (e) {
        return null;
    }
}

export default function DashboardPage() {
    const user = getUser();
    const isAdmin = user?.role === 'Admin';
    const isProjectManager = user?.role === 'ProjectManager';


    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary font-headline">Pixel Space</h1>
                 {user && <LogoutButton />}
            </header>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.email || 'Explorer'}!</h2>
                    <p className="text-muted-foreground">What would you like to do today?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="hover:shadow-lg transition-shadow">
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
                                Go to World <ArrowRight className="ml-2" />
                            </Button>
                           </Link>
                        </CardContent>
                    </Card>
                    {(isAdmin || isProjectManager) && (
                        <Card className="hover:shadow-lg transition-shadow">
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
                                        Open Kanban <ArrowRight className="ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                    <Card className="hover:shadow-lg transition-shadow">
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
                                    Open Chat <ArrowRight className="ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                     <Card className="hover:shadow-lg transition-shadow">
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
                                    Go to Meetings <ArrowRight className="ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                     <Card className="hover:shadow-lg transition-shadow">
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
                                    Go to Whiteboard <ArrowRight className="ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                     <Card className="hover:shadow-lg transition-shadow">
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
                                    Open Surveys <ArrowRight className="ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    {isAdmin && (
                        <Card className="hover:shadow-lg transition-shadow">
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
                                        Go to Admin <ArrowRight className="ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}
