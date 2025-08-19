
'use server';

import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { getSurveyById } from '@/lib/survey-data';
import SurveyDetailClient from './SurveyDetailClient';


export default async function SurveyDetailPage({ params }: { params: { id: string }}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const survey = await getSurveyById(supabase, params.id);

  if (!survey) {
    notFound();
  }

  return <SurveyDetailClient survey={survey} />;
}
