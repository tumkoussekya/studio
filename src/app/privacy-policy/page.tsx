
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
              <p>
                Welcome to SyncroSpace. We are committed to protecting your privacy and handling your data in an open and transparent manner. This privacy policy sets out how we collect, use, and protect any information that you give us when you use this application.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
              <p>
                We may collect the following information:
              </p>
              <ul>
                <li><strong>Account Information:</strong> When you register for an account, we collect your email address and password.</li>
                <li><strong>User-Generated Content:</strong> We collect information you provide, such as chat messages, tasks on the Kanban board, and content on whiteboards.</li>
                <li><strong>Usage Data:</strong> We may collect data about how you interact with our service, such as features used and time spent on the platform. This is for internal analytics to improve the service.</li>
                <li><strong>Technical Data:</strong> This includes your IP address, browser type and version, time zone setting, and operating system.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <p>
                We use the information we collect to operate, maintain, and provide you with the features and functionality of SyncroSpace. This includes:
              </p>
              <ul>
                <li>To provide and personalize our services.</li>
                <li>To enable real-time collaboration features.</li>
                <li>To communicate with you, including sending service-related notices.</li>
                <li>For analytics and to improve the application.</li>
                <li>To enforce our terms and policies and to prevent misuse.</li>
              </ul>
            </section>
             <section>
              <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
              <p>
                We are committed to ensuring that your information is secure. We use various security technologies and procedures to help protect your personal information from unauthorized access, use, or disclosure.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
              <p>
                You have certain rights regarding the personal information we hold about you. These may include the right to access, correct, delete, or restrict the processing of your data.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>
             <section>
              <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at contact@syncrospace.example.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
