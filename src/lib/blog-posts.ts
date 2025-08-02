
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

const posts: Post[] = [
    {
        slug: 'future-of-remote-work',
        title: 'The Future of Remote Work is Hybrid and Asynchronous',
        date: 'August 01, 2024',
        author: {
            name: 'Alice',
            avatar: 'https://placehold.co/40x40.png',
        },
        summary: 'As companies navigate the new normal, it\'s clear that a one-size-fits-all approach to remote work doesn\'t work. The future lies in a flexible, hybrid model that embraces asynchronous communication.',
        image: 'https://placehold.co/1200x600.png',
        imageHint: 'modern office space',
        content: `
            <p>The debate between fully remote, fully in-office, and hybrid work models has been ongoing. However, a consensus is emerging: flexibility is key. At SyncroSpace, we believe the most successful teams will be those that master hybrid work, combining the best of both worlds. This means creating a digital headquarters that is as vibrant and collaborative as a physical one.</p>
            <h3 class="text-2xl font-bold mt-8 mb-4">Why Asynchronous Communication is Crucial</h3>
            <p>In a global, distributed team, requiring everyone to be online at the same time is a recipe for burnout. Asynchronous communication, where team members can contribute on their own schedule, empowers individuals and fosters a healthier work-life balance. Tools like persistent chat, collaborative documents, and well-organized task boards are essential for this.</p>
            <blockquote class="border-l-4 border-primary pl-4 italic my-6">
                "The goal is not to replicate the physical office, but to build something better, more inclusive, and more productive."
            </blockquote>
            <p>Virtual offices like SyncroSpace provide the "space" for this to happen. They offer the serendipitous encounters of an office while respecting the flexibility that remote work provides.</p>
        `,
    },
    {
        slug: 'building-virtual-culture',
        title: 'Fostering Company Culture in a Virtual World',
        date: 'July 25, 2024',
        author: {
            name: 'Bob',
            avatar: 'https://placehold.co/40x40.png',
        },
        summary: 'Company culture isn\'t about free snacks and ping-pong tables. In a remote setting, it\'s about intentional connection, trust, and shared purpose. Here\'s how to build it.',
        image: 'https://placehold.co/1200x600.png',
        imageHint: 'teamwork collaboration',
        content: `
            <p>One of the biggest challenges of remote work is maintaining a strong, cohesive company culture. Without the daily interactions of a physical office, it's easy for team members to feel disconnected. Building a virtual culture requires deliberate effort.</p>
            <h3 class="text-2xl font-bold mt-8 mb-4">Strategies for Virtual Culture-Building</h3>
            <ul>
                <li class="mb-2"><strong>Virtual "Water Coolers":</strong> Create dedicated spaces for non-work-related chat. Our Coffee Room in SyncroSpace is designed for exactly this.</li>
                <li class="mb-2"><strong>Celebrate Wins Together:</strong> Use announcements and team channels to publicly recognize achievements, big and small.</li>
                <li class="mb-2"><strong>Encourage Social Events:</strong> Host virtual game nights, coffee breaks, or team-building activities within your virtual space.</li>
            </ul>
            <p>Ultimately, a strong virtual culture is built on trust, transparency, and consistent communication. By providing the right tools and encouraging the right behaviors, you can create a thriving remote team.</p>
        `,
    },
    {
        slug: 'ai-in-collaboration',
        title: 'How AI is Revolutionizing Team Collaboration',
        date: 'July 18, 2024',
        author: {
            name: 'Charlie',
            avatar: 'https://placehold.co/40x40.png',
        },
        summary: 'Artificial intelligence is no longer science fiction. It\'s becoming a powerful partner in the workplace, automating tedious tasks, summarizing conversations, and even helping break the ice.',
        image: 'https://placehold.co/1200x600.png',
        imageHint: 'AI robot concept',
        content: `
            <p>AI is transforming the way we work, and collaboration tools are at the forefront of this revolution. From intelligent task management to summarizing long chat threads, AI is helping teams become more efficient and focused.</p>
            <h3 class="text-2xl font-bold mt-8 mb-4">Meet Alex: Your AI Assistant</h3>
            <p>In SyncroSpace, we've introduced Alex, an AI assistant designed to streamline your workflow. You can talk to Alex to:</p>
            <ul>
                <li class="mb-2"><strong>Create Tasks:</strong> Simply tell Alex, "Add a high-priority task to design the new logo," and it will appear on your Kanban board.</li>
                <li class="mb-2"><strong>Get Suggestions:</strong> Feeling overwhelmed? Ask Alex, "What should I do next?" and it will suggest a task from your to-do list based on priority.</li>
                <li class="mb-2"><strong>Break the Ice:</strong> Alex can even suggest conversation starters when you're near a colleague, helping to foster new connections.</li>
            </ul>
            <p>This is just the beginning. As AI continues to evolve, it will become an indispensable part of the modern toolkit for any high-performing team.</p>
        `,
    },
];


export function getAllPosts() {
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string) {
    return posts.find(post => post.slug === slug);
}
