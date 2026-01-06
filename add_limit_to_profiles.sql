-- Agregar columna limite_mensaje a la tabla profiles existente
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS limite_mensaje INTEGER DEFAULT 0;

-- Asegurarse de que los usuarios puedan ver y actualizar su propio límite
-- (Esto asume que ya existen políticas en profiles, pero agregamos una específica por si acaso)
-- Nota: Si usas Supabase Auth, public.profiles suele tener RLS habilitado.

-- Política para permitir que el usuario vea su propio límite (si no existe una política general de select)
CREATE POLICY "Users can view own profile limit" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Política para permitir que el usuario actualice su propio límite (si no existe una política general de update)
CREATE POLICY "Users can update own profile limit" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
