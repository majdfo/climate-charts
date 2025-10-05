-- Fix search path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, last_login_at)
  VALUES (NEW.id, NEW.email, now(), now());
  RETURN NEW;
END;
$$;