
-- Create profiles table for storing user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  role USER-DEFINED DEFAULT 'user' NOT NULL,
  is_suspended BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create company table for storing company information
CREATE TABLE public.company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  contact TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to company table for auto-updating the updated_at column
CREATE TRIGGER update_company_updated_at
BEFORE UPDATE ON public.company
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Create new user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to auth.users for new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create user management functions
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to suspend a user
CREATE OR REPLACE FUNCTION public.suspend_user(user_id UUID, suspend BOOLEAN DEFAULT TRUE)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can suspend users';
  END IF;
  
  UPDATE public.profiles SET is_suspended = suspend WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a user (by admin)
CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote a user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  
  UPDATE public.profiles SET role = 'admin' WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to demote an admin to user
CREATE OR REPLACE FUNCTION public.demote_to_user(user_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all users (admin only)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role,
  is_suspended BOOLEAN
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can view all users';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,
    u.last_sign_in_at,
    u.created_at,
    p.full_name,
    p.avatar_url,
    p.role,
    p.is_suspended
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for user to delete their own account
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default company
INSERT INTO public.company (name)
VALUES ('WDYLT')
ON CONFLICT DO NOTHING;
