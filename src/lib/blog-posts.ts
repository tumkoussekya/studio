
import { serviceClient } from './supabase/service';

export interface Post {
    slug: string;
    title: string;
    date: string;
    author: {
        name: string;
        avatar: string;
    };
    summary: string;
    image: string;
    imageHint: string;
    content: string;
}

// Fetches all blog posts from the database
export async function getAllPosts(): Promise<Post[]> {
    const { data, error } = await serviceClient
        .from('blog_posts')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching blog posts:', error.message);
        return [];
    }

    // The 'author' field needs to be constructed to match the Post interface
    return data.map(post => ({
        ...post,
        author: {
            name: post.author_name,
            avatar: post.author_avatar || 'https://placehold.co/40x40.png'
        }
    }));
}

// Fetches a single blog post by its slug from the database
export async function getPostBySlug(slug: string): Promise<Post | null> {
    const { data, error } = await serviceClient
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
    
    if (error) {
        console.error('Error fetching post by slug:', error.message);
        return null;
    }
    
    return {
        ...data,
        author: {
            name: data.author_name,
            avatar: data.author_avatar || 'https://placehold.co/40x40.png'
        }
    };
}
