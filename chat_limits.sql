-- Tabla para controlar el límite de mensajes del chat
create table if not exists public.chat_limits (
    user_id uuid references auth.users(id) primary key,
    limite_mensaje int default 0,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar RLS
alter table public.chat_limits enable row level security;

-- Políticas de seguridad
create policy "Usuarios pueden ver su propio límite"
  on public.chat_limits for select
  using (auth.uid() = user_id);

create policy "Usuarios pueden crear su registro de límite"
  on public.chat_limits for insert
  with check (auth.uid() = user_id);

create policy "Usuarios pueden actualizar su propio límite"
  on public.chat_limits for update
  using (auth.uid() = user_id);
