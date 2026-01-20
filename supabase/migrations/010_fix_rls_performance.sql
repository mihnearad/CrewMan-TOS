-- Fix performance warning: auth_rls_initplan
-- Wrapping auth.uid() in (select ...) prevents re-evaluation per row

-- Drop and recreate the affected policies with optimized syntax
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING ((select auth.uid()) = id);
