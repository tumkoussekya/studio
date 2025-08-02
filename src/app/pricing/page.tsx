
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    const tiers = [
        {
            name: 'Free',
            price: '$0',
            description: 'For small teams getting started.',
            features: [
                'Up to 5 team members',
                'Basic chat and video',
                '1 Kanban board',
                'Community support',
            ],
            buttonText: 'Get Started',
            buttonVariant: 'outline',
        },
        {
            name: 'Pro',
            price: '$12',
            priceSuffix: '/ user / month',
            description: 'For growing teams that need more power.',
            features: [
                'Up to 50 team members',
                'Advanced collaboration tools',
                'Unlimited Kanban boards',
                'AI Assistant features',
                'Priority support',
            ],
            buttonText: 'Upgrade to Pro',
            buttonVariant: 'default',
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'For large organizations with specific needs.',
            features: [
                'Unlimited team members',
                'Admin & Analytics dashboards',
                'Dedicated support & SLA',
                'Advanced security & compliance',
                'Custom integrations',
            ],
            buttonText: 'Contact Sales',
            buttonVariant: 'outline',
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
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 font-headline">Pricing</h2>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
                Choose the plan that's right for your team.
            </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <Card key={tier.name} className={`flex flex-col ${tier.name === 'Pro' ? 'border-primary shadow-lg' : ''}`}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">{tier.name}</CardTitle>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold">{tier.price}</span>
                    {tier.priceSuffix && <span className="text-muted-foreground">{tier.priceSuffix}</span>}
                 </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={tier.buttonVariant as any}>
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
