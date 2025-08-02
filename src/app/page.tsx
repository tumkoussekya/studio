
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, LogIn, UserPlus, Users, Volume2, MessageSquare, Video, KanbanSquare, Shapes, ClipboardList, BarChart2, Shield } from 'lucide-react';
import LogoutButton from '@/components/world/LogoutButton';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import Image from 'next/image';

async function IsAuthenticated() {
    const token = await cookies().get('token');
    if (!token) return false;
    try {
        verify(token.value, process.env.JWT_SECRET || 'fallback-secret');
        return true;
    } catch (e) {
        return false;
    }
}


export default async function Home() {
    const isAuthenticated = await IsAuthenticated();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary font-headline">SyncroSpace</h1>
        <nav className="flex items-center gap-2 sm:gap-4">
             {isAuthenticated && (
                <Link href="/dashboard" passHref>
                  <Button variant="ghost">
                    Dashboard
                  </Button>
                </Link>
             )}
            {isAuthenticated ? (
                <LogoutButton />
            ) : (
                <>
                    <Link href="/login" passHref>
                        <Button variant="outline">
                            <LogIn className="mr-2 h-4 w-4" />
                            Login
                        </Button>
                    </Link>
                    <Link href="/signup" passHref>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Sign Up
                        </Button>
                    </Link>
                </>
            )}
        </nav>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 md:py-24">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 font-headline leading-tight">
            A new dimension for team collaboration.
          </h2>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            Step into a 2D virtual office. Boost productivity and connection with spatial chat, collaborative tools, and AI-powered features.
          </p>
          <Link href={isAuthenticated ? "/dashboard" : "/world"}>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Enter SyncroSpace <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="w-full h-64 md:h-96 rounded-xl bg-secondary/50 border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden">
                <Image src="https://placehold.co/1200x400.png" width={1200} height={400} alt="A pixel art virtual office space with avatars" data-ai-hint="pixel art office" className="object-cover w-full h-full"/>
            </div>
        </section>

        <section className="bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center mb-12">
                <h3 className="text-3xl font-bold font-headline">Everything You Need to Collaborate</h3>
                <p className="text-muted-foreground mt-2">All-in-one platform for a distributed team.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="text-accent h-6 w-6" />
                    <span>Virtual World</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Explore a 2D world, move your avatar, and interact with colleagues in different rooms.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Volume2 className="text-accent h-6 w-6" />
                    <span>Spatial Audio</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Engage in natural conversations by hearing only those who are near you in the virtual space.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="text-accent h-6 w-6" />
                    <span>Team Chat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Communicate in real-time with one-to-one DMs and group channels.
                  </p>
                </CardContent>
              </Card>
               <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Video className="text-accent h-6 w-6" />
                    <span>Video Meetings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Jump into audio/video calls with screen sharing for quick syncs or scheduled meetings.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <KanbanSquare className="text-accent h-6 w-6" />
                    <span>Task Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Organize work and track progress with a collaborative Kanban board.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shapes className="text-accent h-6 w-6" />
                    <span>Whiteboards</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Brainstorm ideas together in real-time on an infinite, collaborative canvas.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ClipboardList className="text-accent h-6 w-6" />
                    <span>Surveys & Polls</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gather feedback and make decisions quickly with team-wide surveys and polls.
                  </p>
                </CardContent>
              </Card>
               <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BarChart2 className="text-accent h-6 w-6" />
                    <span>Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Admins can view dashboards on team activity, engagement, and productivity.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-secondary/30 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
                <div className="col-span-full md:col-span-1">
                    <h3 className="font-bold text-lg text-foreground mb-2 font-headline">SyncroSpace</h3>
                    <p className="text-muted-foreground">A new dimension for team collaboration.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-4">Product</h4>
                    <ul className="space-y-2">
                        <li><Link href="/features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                        <li><Link href="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                        <li><Link href="/documentation" className="text-muted-foreground hover:text-primary">Documentation</Link></li>
                        <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-4">Company</h4>
                    <ul className="space-y-2">
                        <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                        <li><Link href="/careers" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                        <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                    <ul className="space-y-2">
                        <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                        <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="mt-12 border-t pt-8 text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} SyncroSpace. All Rights Reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
