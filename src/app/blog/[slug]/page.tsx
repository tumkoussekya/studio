
import { getPostBySlug, getAllPosts } from '@/lib/blog-posts';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User } from 'lucide-react';
import Image from 'next/image';

// Generate static pages for each blog post
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center border-b">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary font-headline tracking-wider">SyncroSpace</h1>
        </Link>
        <div>
            <Link href="/blog">
                <p className="text-sm text-muted-foreground hover:text-primary">Back to Blog</p>
            </Link>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <article className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
                <div className="mb-6">
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={1200}
                      height={600}
                      className="rounded-lg object-cover w-full aspect-video"
                      data-ai-hint={post.imageHint}
                    />
                </div>
              <CardTitle className="text-4xl md:text-5xl font-extrabold font-headline leading-tight tracking-wide">
                {post.title}
              </CardTitle>
              <CardDescription className="mt-4 flex items-center gap-6 text-base">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author.avatar} data-ai-hint="author avatar" />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{post.author.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed text-foreground/90" dangerouslySetInnerHTML={{ __html: post.content }} />
            </CardContent>
          </Card>
        </article>
      </main>
    </div>
  );
}
