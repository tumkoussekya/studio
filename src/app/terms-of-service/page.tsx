
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function TermsOfServicePage() {
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
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing or using SyncroSpace (the "Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to all the terms and conditions, you may not access or use the Service.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground">2. User Accounts</h2>
              <p>
                To use certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
            </section>
             <section>
              <h2 className="text-xl font-semibold text-foreground">3. User Conduct</h2>
              <p>
                You agree not to use the Service to:
              </p>
              <ul>
                <li>Post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
                <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
                <li>Upload or transmit any material that contains software viruses or any other computer code, files, or programs designed to interrupt, destroy, or limit the functionality of any computer software or hardware.</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
              <p>
               In no event shall SyncroSpace, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.
              </p>
            </section>
             <section>
              <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at contact@syncrospace.example.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
