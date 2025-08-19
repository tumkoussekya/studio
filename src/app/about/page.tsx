
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Users, Target, Heart, Eye } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center border-b">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary font-headline tracking-wider">SyncroSpace</h1>
        </Link>
        <Link href="/dashboard">
            <p className="text-sm text-muted-foreground hover:text-primary">Back to Dashboard</p>
        </Link>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-wide text-foreground mb-4 font-headline">About SyncroSpace</h2>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                We're rebuilding the office, one pixel at a time.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 text-center">
            <Card>
                <CardHeader>
                    <div className="mx-auto bg-accent/20 text-accent p-3 rounded-full w-fit mb-2">
                        <Target className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline text-2xl tracking-wide">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        To break down the barriers of remote work by creating a virtual space that is as dynamic, collaborative, and human as a real-world office.
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <div className="mx-auto bg-accent/20 text-accent p-3 rounded-full w-fit mb-2">
                        <Eye className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline text-2xl tracking-wide">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        We envision a future where distributed teams are more connected, productive, and engaged than ever before, powered by intuitive and joyful digital environments.
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <div className="mx-auto bg-accent/20 text-accent p-3 rounded-full w-fit mb-2">
                        <Heart className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline text-2xl tracking-wide">Our Values</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        We believe in connection over isolation, innovation through play, and empowering teams to do their best work, no matter where they are.
                    </p>
                </CardContent>
            </Card>
        </div>
        
        <div className="text-center mb-12">
            <h3 className="text-3xl font-bold font-headline tracking-wide">Meet the Team</h3>
            <p className="text-muted-foreground mt-2">The architects of your new virtual world.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                    <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="female developer" alt="Team member" />
                    <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <h4 className="font-bold text-lg">Mendapara</h4>
                <p className="text-muted-foreground">Lead Developer</p>
            </div>
             <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                    <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="male designer" alt="Team member" />
                    <AvatarFallback>BO</AvatarFallback>
                </Avatar>
                <h4 className="font-bold text-lg">Bob</h4>
                <p className="text-muted-foreground">UX/UI Designer</p>
            </div>
             <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                    <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="female engineer" alt="Team member" />
                    <AvatarFallback>CH</AvatarFallback>
                </Avatar>
                <h4 className="font-bold text-lg">Charlie</h4>
                <p className="text-muted-foreground">Backend Engineer</p>
            </div>
        </div>

      </main>
    </div>
  );
}
