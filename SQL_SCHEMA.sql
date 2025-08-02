-- ========= CUSTOM TYPES =========
-- Create custom types first to enforce specific values in our tables.

-- Type for user roles
CREATE TYPE public.user_role AS ENUM ('Admin', 'TeamMember');

-- Type for Kanban task priorities
CREATE TYPE public.kanban_priority AS ENUM ('Low', 'Medium', 'High');

-- Type for survey statuses
CREATE TYPE public.survey_status AS ENUM ('Draft', 'InProgress', 'Completed');


-- ========= TABLE: users =========
-- Stores public user information and app-specific data, linked to Supabase Auth.

CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'TeamMember',
  last_x INTEGER DEFAULT 200,
  last_y INTEGER DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.users IS 'Stores public user profiles and application-specific data.';

-- RLS Policy for users table
CREATE POLICY "Allow authenticated users to read user data"
ON public.users FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Allow users to update their own data"
ON public.users FOR UPDATE
TO authenticated USING (auth.uid() = id);


-- ========= TABLE: announcements =========
-- Stores team-wide announcements.

CREATE TABLE public.announcements (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.announcements IS 'Stores team-wide announcements.';

-- RLS Policy for announcements table
CREATE POLICY "Allow authenticated users to read announcements"
ON public.announcements FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Allow admins to create announcements"
ON public.announcements FOR INSERT
TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'Admin'));


-- ========= TABLE: kanban_columns =========
-- Stores the columns for the project Kanban board.

CREATE TABLE public.kanban_columns (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  column_order INTEGER NOT NULL UNIQUE
);
COMMENT ON TABLE public.kanban_columns IS 'Defines the columns for the Kanban board.';

-- RLS Policy for kanban_columns table
CREATE POLICY "Allow authenticated users to read Kanban columns"
ON public.kanban_columns FOR SELECT
TO authenticated USING (true);


-- ========= TABLE: tasks =========
-- Stores tasks for the Kanban board.

CREATE TABLE public.tasks (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  priority kanban_priority NOT NULL DEFAULT 'Medium',
  due_date TIMESTAMPTZ,
  column_id TEXT NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.tasks IS 'Stores tasks for the Kanban board.';

-- RLS Policy for tasks table
CREATE POLICY "Allow authenticated users to manage tasks"
ON public.tasks FOR ALL
TO authenticated USING (true)
WITH CHECK (true);


-- ========= TABLE: meetings =========
-- Stores scheduled meetings.

CREATE TABLE public.meetings (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.meetings IS 'Stores scheduled video meetings.';

CREATE TABLE public.meeting_attendees (
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (meeting_id, user_id)
);
COMMENT ON TABLE public.meeting_attendees IS 'Junction table for meetings and attendees.';

-- RLS Policies for meetings
CREATE POLICY "Allow authenticated users to manage meetings"
ON public.meetings FOR ALL
TO authenticated USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage meeting attendees"
ON public.meeting_attendees FOR ALL
TO authenticated USING (true)
WITH CHECK (true);


-- ========= TABLE: surveys =========
-- Stores surveys and polls.

CREATE TABLE public.surveys (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status survey_status NOT NULL DEFAULT 'Draft',
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.surveys IS 'Stores surveys and polls created by users.';

CREATE TABLE public.survey_questions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL
);
COMMENT ON TABLE public.survey_questions IS 'Stores questions for a specific survey.';

CREATE TABLE public.survey_options (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL
);
COMMENT ON TABLE public.survey_options IS 'Stores the possible answer options for a survey question.';

CREATE TABLE public.survey_responses (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(survey_id, user_id) -- Ensures one response per user per survey
);
COMMENT ON TABLE public.survey_responses IS 'Tracks which user has responded to which survey.';

CREATE TABLE public.survey_answers (
  response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.survey_options(id) ON DELETE CASCADE,
  PRIMARY KEY (response_id, question_id)
);
COMMENT ON TABLE public.survey_answers IS 'Stores the actual answers for each response.';


-- RLS Policies for surveys
CREATE POLICY "Allow authenticated users to manage surveys"
ON public.surveys FOR ALL TO authenticated
USING (true) WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Allow users to read questions and options for any survey"
ON public.survey_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow survey creator to manage questions"
ON public.survey_questions FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM surveys WHERE id = survey_id AND creator_id = auth.uid()));

CREATE POLICY "Allow survey creator to manage options"
ON public.survey_options FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM survey_questions sq JOIN surveys s ON sq.survey_id = s.id
  WHERE sq.id = question_id AND s.creator_id = auth.uid()
));

CREATE POLICY "Allow users to manage their own responses"
ON public.survey_responses FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to manage their own answers"
ON public.survey_answers FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.survey_responses WHERE id = response_id AND user_id = auth.uid()));


-- ========= INSERT INITIAL DATA =========
-- Inserts the default columns for the Kanban board.

INSERT INTO public.kanban_columns (id, title, column_order) VALUES
('column-1', 'To Do', 1),
('column-2', 'In Progress', 2),
('column-3', 'Done', 3)
ON CONFLICT (id) DO NOTHING;
