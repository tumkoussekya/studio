
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllPosts } from '@/lib/blog-posts';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, User } from 'lucide-react';
import Image from 'next/image';

export default async function BlogPage() {
  const posts = await getAllPosts();

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
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-wide text-foreground mb-4 font-headline">The SyncroSpace Blog</h2>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                Insights on remote work, collaboration, and building the future of digital offices.
            </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
                <Card key={post.slug} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="p-0">
                        <Link href={`/blog/${post.slug}`}>
                            <Image 
                                src={post.image}
                                alt={post.title}
                                width={600}
                                height={400}
                                className="object-cover w-full h-48"
                                data-ai-hint={post.imageHint}
                            />
                        </Link>
                    </CardHeader>
                    <div className="p-6 flex flex-col flex-grow">
                        <CardTitle className="font-headline text-2xl mb-2 tracking-wide">
                            <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                                {post.title}
                            </Link>
                        </CardTitle>
                         <CardDescription className="flex items-center gap-4 text-sm mb-4">
                            <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author.name}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(post.date).toLocaleDateString()}</span>
                        </CardDescription>
                        <CardContent className="p-0 flex-grow">
                            <p className="text-muted-foreground line-clamp-3">
                                {post.summary}
                            </p>
                        </CardContent>
                        <CardFooter className="p-0 pt-6">
                            <Button asChild variant="outline">
                                <Link href={`/blog/${post.slug}`}>
                                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </div>
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}
