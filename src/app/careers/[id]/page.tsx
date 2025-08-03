
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllJobs, getJobById } from '@/lib/job-openings';
import { ArrowLeft, Briefcase, Check, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ApplicationForm from '@/components/careers/ApplicationForm';


export async function generateStaticParams() {
  const jobs = getAllJobs();
  return jobs.map((job) => ({
    id: job.id,
  }));
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = getJobById(params.id);

  if (!job) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center border-b">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary font-headline">SyncroSpace</h1>
        </Link>
        <Link href="/careers">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to All Openings</Button>
        </Link>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-4xl font-headline mb-2">{job.title}</CardTitle>
                    <CardDescription className="flex items-center flex-wrap gap-x-6 gap-y-2 text-lg">
                        <span className="flex items-center gap-1.5"><Briefcase className="h-5 w-5" /> {job.department}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-5 w-5" /> {job.location}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground text-base">
                    <p className="lead">{job.description}</p>

                    <h3 className="text-foreground font-semibold text-xl">Responsibilities</h3>
                    <ul className="space-y-2">
                        {job.responsibilities.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <Check className="h-5 w-5 mt-1 text-green-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <h3 className="text-foreground font-semibold text-xl mt-8">Qualifications</h3>
                    <ul className="space-y-2">
                         {job.qualifications.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <Check className="h-5 w-5 mt-1 text-green-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-12 text-center">
                        <ApplicationForm jobTitle={job.title} jobId={job.id} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
