
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function FaqPage() {
  const faqs = [
    {
      question: 'What is SyncroSpace?',
      answer:
        'SyncroSpace is an all-in-one virtual collaboration platform designed for remote teams. It combines a 2D virtual office with spatial audio, team chat, task management, collaborative whiteboards, and other tools to foster connection and productivity.',
    },
    {
      question: 'How does the spatial audio work?',
      answer:
        'In our 2D virtual world, you can only hear and speak to people whose avatars are close to yours. As you move away from someone, their volume fades, mimicking how conversations work in real life. This allows for multiple organic conversations to happen in the same space.',
    },
    {
      question: 'What are the main features?',
      answer:
        'SyncroSpace includes a 2D virtual world, spatial audio chat, persistent team chat rooms, video meetings, collaborative whiteboards, Kanban boards for task management, and an AI assistant named Alex to help you stay organized. Check out our Features page for more details!',
    },
    {
      question: 'Is SyncroSpace suitable for large teams?',
      answer:
        'Yes! Our Enterprise plan is designed for large organizations. It includes features like unlimited team members, advanced admin controls, analytics dashboards, and dedicated support to meet the needs of large-scale remote operations.',
    },
    {
      question: 'Can I try SyncroSpace before purchasing a plan?',
      answer:
        'Absolutely. We offer a Free plan with access to core features for up to 5 team members, so you can explore how SyncroSpace works for your team with no commitment.',
    },
    {
      question: 'How does the AI Assistant "Alex" work?',
      answer:
        'You can find Alex in the "Focus Zone" of the virtual world. You can chat with Alex to create tasks on your Kanban board (e.g., "add a task to design the new logo") or ask for suggestions on what to work on next based on your current to-do list.',
    },
  ];

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
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-wide text-foreground mb-4 font-headline">
            Frequently Asked Questions
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Have questions? We've got answers. If you can't find what you're looking for, feel free to{' '}
            <Link href="/contact" className="text-primary underline">
              contact us
            </Link>
            .
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
