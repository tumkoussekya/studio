
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function SetupPage() {
    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isAblyConfigured = process.env.ABLY_API_KEY;

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome to SyncroSpace Setup</CardTitle>
                    <CardDescription>
                        Before you can start, you need to configure your environment variables.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        Your application needs to connect to external services (Supabase for database/auth and Ably for real-time features). Please add the following keys to a <strong>.env</strong> file in the root of your project.
                    </p>

                    <Alert variant={isSupabaseConfigured ? "default" : "destructive"}>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Supabase Configuration</AlertTitle>
                        <AlertDescription>
                            <div className="font-mono text-sm bg-muted p-2 rounded-md my-2">
                                NEXT_PUBLIC_SUPABASE_URL=your_supabase_url<br/>
                                NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                            </div>
                            {isSupabaseConfigured ? "Supabase variables found." : "Supabase variables are missing."} You can find these in your Supabase project's API settings.
                        </AlertDescription>
                    </Alert>

                     <Alert variant={isAblyConfigured ? "default" : "destructive"}>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Ably Configuration</AlertTitle>
                        <AlertDescription>
                             <div className="font-mono text-sm bg-muted p-2 rounded-md my-2">
                                ABLY_API_KEY=your_ably_api_key
                            </div>
                           {isAblyConfigured ? "Ably API Key found." : "Ably API Key is missing."} You can get this from your Ably account dashboard.
                        </AlertDescription>
                    </Alert>

                    <p className="text-muted-foreground text-sm">
                        After adding the keys to your .env file, you will need to restart the development server for the changes to apply.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
