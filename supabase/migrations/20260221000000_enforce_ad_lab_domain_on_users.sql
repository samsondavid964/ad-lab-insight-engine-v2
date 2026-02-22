-- Create a function to check if the user's email ends with @ad-lab.io
CREATE OR REPLACE FUNCTION public.check_ad_lab_domain()
RETURNS trigger AS $$
BEGIN
  IF NEW.email NOT LIKE '%@ad-lab.io' THEN
    RAISE EXCEPTION 'Only @ad-lab.io email addresses are permitted.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs before an insert on auth.users
DROP TRIGGER IF EXISTS enforce_ad_lab_domain ON auth.users;
CREATE TRIGGER enforce_ad_lab_domain
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.check_ad_lab_domain();
