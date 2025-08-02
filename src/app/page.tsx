import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, LogIn, MessageSquare, UserPlus, Users, Volume2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary font-headline">Pixel Space</h1>
        <nav className="flex items-center gap-2">
            <Link href="/login" passHref>
                <Button variant="outline">
                    <LogIn />
                    Login
                </Button>
            </Link>
            <Link href="/signup" passHref>
                <Button>
                    <UserPlus />
                    Sign Up
                </Button>
            </Link>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 md:py-24">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4 font-headline">
            A new dimension for connection.
          </h2>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            Jump into a 2D world, explore, and connect with others through spatial chat and serendipitous conversations.
          </p>
          <Link href="/world">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              Enter World <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="w-full h-64 md:h-96 rounded-xl bg-secondary/50 border-2 border-dashed border-primary/20 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <p className="font-bold text-lg">Your 2D world awaits</p>
                    <p className="text-sm" data-ai-hint="pixel art world">Avatars, chat, and exploration.</p>
                </div>
            </div>
        </section>

        <section className="bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <h3 className="text-3xl font-bold text-center mb-12 font-headline">Core Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="text-accent" />
                    <span>2D World & Avatars</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Move your custom avatar around a vibrant, interactive 2D world.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="text-accent" />
                    <span>Spatial Audio & Chat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hear and talk to people near you, just like in real life. Text chat is always available.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="text-accent" />
                    <span>AI Icebreakers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Never be at a loss for words. Get AI-powered conversation starters when you meet someone new.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Pixel Space. All rights reserved.</p>
      </footer>
    </div>
  );
}
