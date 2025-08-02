
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export default function DocumentationPage() {
  const topics = [
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'virtual-world', title: 'Virtual World' },
    { id: 'chat', title: 'Team Chat' },
    { id: 'kanban', title: 'Kanban Board' },
    { id: 'whiteboard', title: 'Whiteboard' },
    { id: 'meetings', title: 'Video Meetings' },
    { id: 'surveys', title: 'Surveys & Polls' },
    { id: 'ai-assistant', title: 'AI Assistant' },
    { id: 'admin-panel', title: 'Admin Panel' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center border-b">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary font-headline">SyncroSpace</h1>
        </Link>
        <Link href="/dashboard">
          <p className="text-sm text-muted-foreground hover:text-primary">Back to Dashboard</p>
        </Link>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-[280px_1fr] gap-12">
          <aside className="w-full md:sticky top-8 self-start">
            <Card>
              <CardHeader>
                <CardTitle>Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topics.map((topic) => (
                    <li key={topic.id}>
                      <Link href={`#${topic.id}`}>
                        <p className="text-muted-foreground hover:text-primary transition-colors">{topic.title}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>

          <div className="prose dark:prose-invert max-w-none">
            <section id="getting-started" className="mb-16 scroll-mt-20">
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-4 font-headline">Getting Started</h2>
              <p className="lead text-muted-foreground">
                Welcome to the SyncroSpace documentation. Here you'll find all the information you need to use our platform effectively.
              </p>
              <h3 className="text-2xl font-bold mt-8">Creating an Account</h3>
              <p>To get started, you'll need to sign up for an account. Click the "Sign Up" button on the homepage and fill in your details. Once you've created your account, you can log in and you'll be taken to your dashboard.</p>
              <h3 className="text-2xl font-bold mt-8">Navigating the Dashboard</h3>
              <p>The dashboard is your central hub for accessing all of SyncroSpace's features. From here, you can enter the virtual world, check your messages, manage tasks, and more.</p>
            </section>

            <section id="virtual-world" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold font-headline">Virtual World</h2>
                <p>The heart of SyncroSpace is the 2D virtual world. Use the WASD or Arrow keys on your keyboard to move your avatar. As you get closer to other users, you'll be able to hear them through spatial audio.</p>
            </section>
            
             <section id="chat" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold font-headline">Team Chat</h2>
                <p>The chat interface allows for real-time communication with your team. You can create direct messages, group channels, and react with emojis. File attachments and message searching are also supported.</p>
            </section>

             <section id="kanban" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold font-headline">Kanban Board</h2>
                <p>Organize your team's work with our collaborative Kanban board. Create tasks, assign priorities, set due dates, and drag-and-drop cards between columns to track progress from "To Do" to "Done".</p>
            </section>

             <section id="ai-assistant" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold font-headline">AI Assistant "Alex"</h2>
                <p>Find Alex, our friendly AI assistant, in the "Focus Zone" of the virtual world. You can ask Alex to create tasks for you by simply describing what you need to do (e.g., "Add 'design new logo' to my to-do list"). You can also ask "What should I do next?" for an intelligent task suggestion from your board.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
