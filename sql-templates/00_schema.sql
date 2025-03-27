
-- Initial schema setup for SaaS boilerplate

-- Create types
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  is_suspended BOOLEAN DEFAULT false NOT NULL
);

-- Create row level security policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create company table
CREATE TABLE public.company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  contact TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Insert default company
INSERT INTO public.company (name) 
VALUES ('Default Company');

-- Create functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the ID of the currently authenticated user
  current_user_id := auth.uid();
  
  -- Check if the user exists
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete the user from auth.users (this will cascade to profiles due to foreign key)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.suspend_user(user_id uuid, suspend boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can suspend users';
  END IF;
  
  UPDATE public.profiles SET is_suspended = suspend WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.promote_to_admin(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  
  UPDATE public.profiles SET role = 'admin' WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.demote_to_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can demote users';
  END IF;
  
  -- Prevent demoting yourself (last admin)
  IF user_id = auth.uid() THEN
    RAISE EXCEPTION 'Admins cannot demote themselves';
  END IF;
  
  UPDATE public.profiles SET role = 'user' WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE(id uuid, email text, last_sign_in_at timestamp with time zone, created_at timestamp with time zone, full_name text, avatar_url text, role user_role, is_suspended boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can view all users';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id,
    u.email::text,
    u.last_sign_in_at,
    u.created_at,
    p.full_name,
    p.avatar_url,
    p.role,
    p.is_suspended
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id;
END;
$$;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_company_updated_at
  BEFORE UPDATE ON public.company
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name) VALUES ('profile_images', 'profile_images');
INSERT INTO storage.buckets (id, name) VALUES ('company_logos', 'company_logos');

-- Set up RLS for storage
CREATE POLICY "Anyone can view profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile_images');

CREATE POLICY "Authenticated users can upload profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile_images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view company logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company_logos');

CREATE POLICY "Admins can upload company logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'company_logos' AND auth.role() = 'authenticated' AND public.is_admin());
