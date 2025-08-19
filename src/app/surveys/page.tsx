
'use server';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, BarChart2, Share2, MessageSquare, CheckSquare, FilePlus2, ArrowRight } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { getAllSurveys, type Survey } from '@/lib/survey-data';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import SurveysClient from './SurveysClient';

export default async function SurveysPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const surveys = await getAllSurveys(supabase);

    return <SurveysClient surveys={surveys} />;
}
