-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.attendance_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  date date NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::attendance_status,
  note text,
  is_auto_marked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  course_id uuid NOT NULL,
  type character NOT NULL CHECK (type = ANY (ARRAY['T'::bpchar, 'U'::bpchar])),
  hours integer NOT NULL DEFAULT 0,
  CONSTRAINT attendance_logs_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_logs_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  course_code text,
  t_hours integer NOT NULL DEFAULT 0,
  u_hours integer NOT NULL DEFAULT 0,
  t_limit_percent numeric DEFAULT 30.00,
  u_limit_percent numeric DEFAULT 20.00,
  color_code text DEFAULT '#00ff41'::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  last_visit_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  semester_start date,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);