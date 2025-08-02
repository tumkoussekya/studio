
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, LogIn, MessageSquare, UserPlus, Users, Volume2 } from 'lucide-react';
import LogoutButton from '@/components/world/LogoutButton';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import Image from 'next/image';

function IsAuthenticated() {
    const token = cookies().get('token');
    if (!token) return false;
    try {
        verify(token.value, process.env.JWT_SECRET || 'fallback-secret');
        return true;
    } catch (e) {
        return false;
    }
}


export default function Home() {
    const isAuthenticated = IsAuthenticated();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary font-headline">SyncroSpace</h1>
        <nav className="flex items-center gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="flex flex-col items-center gap-2">
                    <Users className="text-accent h-8 w-8 mb-2" />
                    <span>Virtual Office Space</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Explore a 2D world with custom avatars. Move around different rooms for focused work or casual chats.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="flex flex-col items-center gap-2">
                    <Volume2 className="text-accent h-8 w-8 mb-2" />
                    <span>Spatial Audio & Chat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Engage in natural conversations. Hear and talk to colleagues who are near you, just like in a real office.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="flex flex-col items-center gap-2">
                    <MessageSquare className="text-accent h-8 w-8 mb-2" />
                    <span>AI-Powered Communication</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Never be at a loss for words. Get AI icebreakers, chat summaries, and assistance from our friendly AI, Alex.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} SyncroSpace. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
