
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Users, Volume2, MessageSquare, Video, KanbanSquare, Shapes, ClipboardList, BarChart2, Shield, Bot, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Users className="text-accent h-8 w-8" />,
    title: 'Virtual World',
    description: 'Explore a 2D world, move your avatar, and interact with colleagues in different rooms like the Lounge or Focus Zone.'
  },
  {
    icon: <Volume2 className="text-accent h-8 w-8" />,
    title: 'Spatial Audio',
    description: 'Engage in natural conversations by hearing only those who are near you in the virtual space.'
  },
  {
    icon: <MessageSquare className="text-accent h-8 w-8" />,
    title: 'Team Chat',
    description: 'Communicate in real-time with one-to-one DMs, group channels, emojis, and file attachments.'
  },
  {
    icon: <Video className="text-accent h-8 w-8" />,
    title: 'Video Meetings',
    description: 'Jump into audio/video calls with screen sharing for quick syncs or scheduled meetings.'
  },
  {
    icon: <KanbanSquare className="text-accent h-8 w-8" />,
    title: 'Task Management',
    description: 'Organize work and track progress with a collaborative Kanban board, complete with priority tags and assignments.'
  },
  {
    icon: <Shapes className="text-accent h-8 w-8" />,
    title: 'Whiteboards',
    description: 'Brainstorm ideas together in real-time on an infinite, collaborative canvas with drawing tools.'
  },
  {
    icon: <ClipboardList className="text-accent h-8 w-8" />,
    title: 'Surveys & Polls',
    description: 'Gather feedback and make decisions quickly with team-wide surveys and polls with visualized results.'
  },
  {
    icon: <BarChart2 className="text-accent h-8 w-8" />,
    title: 'Analytics Dashboard',
    description: 'Admins can view dashboards on team activity, feature usage, and user engagement metrics.'
  },
    {
    icon: <Bot className="text-accent h-8 w-8" />,
    title: 'AI Assistant "Alex"',
    description: 'Interact with an AI agent to automatically create tasks or get suggestions on what to work on next.'
  },
    {
    icon: <Shield className="text-accent h-8 w-8" />,
    title: 'Admin Controls',
    description: 'Manage users, roles, and system settings from a dedicated administrator panel.'
  },
  {
    icon: <Camera className="text-accent h-8 w-8" />,
    title: 'Photo Mode',
    description: 'Capture in-world moments with an AI-powered tool to generate artistic, shareable images of your interactions.'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};


export default function FeaturesPage() {
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
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-wide text-foreground mb-4 font-headline">Features</h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Everything your team needs to connect, collaborate, and create, all in one space.
          </p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="bg-accent/20 p-3 rounded-full">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-2xl pt-2 tracking-wide">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
