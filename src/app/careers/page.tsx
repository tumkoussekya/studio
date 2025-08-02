
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Briefcase, MapPin } from 'lucide-react';

export default function CareersPage() {
    const jobOpenings = [
        {
            title: 'Senior Frontend Engineer',
            location: 'Remote',
            department: 'Engineering',
        },
        {
            title: 'Product Designer',
            location: 'Remote',
            department: 'Design',
        },
        {
            title: 'Backend Engineer (AI/ML)',
            location: 'Remote',
            department: 'Engineering',
        },
        {
            title: 'Marketing Manager',
            location: 'Remote',
            department: 'Marketing',
        },
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
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 font-headline">Join Our Team</h2>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                We're looking for passionate people to help us build the future of work. If you're excited by our mission, we'd love to hear from you.
            </p>
        </div>

        <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold font-headline mb-8 text-center">Open Positions</h3>
            <div className="space-y-6">
                {jobOpenings.map((job, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                            <div>
                                <CardTitle className="text-2xl font-headline">{job.title}</CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {job.department}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</span>
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="#">Apply Now</Link>
                            </Button>
                        </CardHeader>
                    </Card>
                ))}
            </div>
             <div className="text-center mt-12">
                <p className="text-muted-foreground">Don't see a role that fits? <Link href="/contact" className="text-primary underline">Get in touch</Link> and tell us why you'd be a great fit for SyncroSpace.</p>
            </div>
        </div>

      </main>
    </div>
  );
}
