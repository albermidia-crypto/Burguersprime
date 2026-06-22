-- ====================================================================
--              WINNERS CRM - SUPABASE DATABASE SCHEMA
-- ====================================================================
-- Run this in the SQL Editor of your Supabase Dashboard.
-- 
-- Location: /supabase/schema.sql
-- ====================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Drop existing tables if they exist for clean rebuilds
drop table if exists public.pedidos_cardapio cascade;
drop table if exists public.produtos_menu cascade;
drop table if exists public.burger_components cascade;
drop table if exists public.financeiro_metricas cascade;
drop table if exists public.metrics cascade;
drop table if exists public.clientes_crm cascade;
drop table if exists public.clientes cascade;
drop table if exists public.usuarios cascade;
drop table if exists public.utilizadores cascade;
drop table if exists public.empresas cascade;

-- 3. Create Empresas Configuration
create table public.empresas (
    id text primary key,
    nome_negocio text not null,
    slug text not null unique,
    email_admin text not null,
    plano text not null default 'free' check (plano in ('free', 'growth', 'prime')),
    fase_sistema text not null default 'beta' check (fase_sistema in ('beta', 'pago')),
    data_criacao timestamp with time zone not null default timezone('utc'::text, now()),
    status text not null default 'activo' check (status in ('activo', 'suspenso', 'cancelado')),
    ticket_medio integer not null default 0,
    custos_fixos_mensais integer not null default 0,
    meta_faturacao integer not null default 0,
    canal_principal text not null default 'WhatsApp',
    tipo_operacao text not null default 'ambos' check (tipo_operacao in ('balcao', 'delivery', 'ambos'))
);

create index idx_empresas_slug on public.empresas(slug);

-- 4. Create Utilizadores
create table public.utilizadores (
    id text primary key,
    name text not null,
    email text not null unique,
    password text,
    avatar text not null default '🍔',
    empresa_id text references public.empresas(id) on delete set null,
    papel text not null default 'funcionario' check (papel in ('dono', 'gestor', 'funcionario')),
    data_criacao timestamp with time zone not null default timezone('utc'::text, now())
);

create index idx_utilizadores_empresa_id on public.utilizadores(empresa_id);

-- 5. Create Clientes
create table public.clientes (
    id text primary key,
    empresa_id text not null references public.empresas(id) on delete cascade,
    name text not null,
    phone text not null,
    channel text not null default 'WhatsApp',
    favorite_burger text,
    dietary_restrictions text not null default 'Nenhuma',
    visit_frequency numeric not null default 1.0,
    total_spent numeric not null default 0,
    last_visit_days_ago integer not null default 0,
    ratings_count integer not null default 0,
    average_rating numeric not null default 5.0,
    order_history_count integer not null default 0,
    birthday_date text, -- MM-DD or YYYY-MM-DD
    is_churn_risk boolean not null default false,
    data_criacao timestamp with time zone not null default timezone('utc'::text, now())
);

create index idx_clientes_empresa_id on public.clientes(empresa_id);

-- 6. Create Financeiro Metricas
create table public.financeiro_metricas (
    empresa_id text primary key references public.empresas(id) on delete cascade,
    marketing_investment integer not null default 0,
    marketing_revenue integer not null default 0,
    fixed_costs integer not null default 0,
    variable_cost_ratio numeric not null default 0.40,
    current_sales_count integer not null default 0,
    total_sales_revenue integer not null default 0,
    new_clients_count integer not null default 0,
    current_day_of_month integer not null default 1,
    supplier_price_increase_percent integer not null default 0,
    ultima_atualizacao timestamp with time zone not null default timezone('utc'::text, now())
);

-- 7. Create Burger Components (kept for additional support/compatibility)
create table public.burger_components (
    id text not null,
    empresa_id text not null references public.empresas(id) on delete cascade,
    name text not null,
    category text not null,
    cost numeric not null default 0,
    price numeric not null default 0,
    stock integer not null default 0,
    unit text not null default 'un',
    primary key (id, empresa_id)
);

create index idx_burger_components_empresa_id on public.burger_components(empresa_id);

-- 8. Create Produtos Menu
create table public.produtos_menu (
    id text not null,
    empresa_id text not null references public.empresas(id) on delete cascade,
    nome text not null,
    descricao text,
    preco numeric not null default 0,
    categoria text not null check (categoria in ('hamburgueres', 'acompanhamentos', 'bebidas', 'extras')),
    foto_url text,
    disponivel boolean not null default true,
    ordem_exibicao integer not null default 0,
    primary key (id, empresa_id)
);

create index idx_produtos_menu_empresa_id on public.produtos_menu(empresa_id);

-- 9. Create Pedidos Cardapio
create table public.pedidos_cardapio (
    id text primary key,
    empresa_id text not null references public.empresas(id) on delete cascade,
    cliente_id text references public.clientes(id) on delete set null,
    cliente_nome text not null,
    cliente_whatsapp text not null,
    itens jsonb not null,
    metodo_entrega text not null check (metodo_entrega in ('local', 'balcao', 'casa')),
    endereco_entrega text,
    metodo_pagamento text not null check (metodo_pagamento in ('dinheiro', 'transferencia', 'multicaixa')),
    valor_total numeric not null default 0,
    data_criacao timestamp with time zone not null default timezone('utc'::text, now())
);

create index idx_pedidos_cardapio_empresa_id on public.pedidos_cardapio(empresa_id);

-- 10. Enable Row Level Security (RLS) policies
alter table public.empresas enable row level security;
alter table public.utilizadores enable row level security;
alter table public.clientes enable row level security;
alter table public.financeiro_metricas enable row level security;
alter table public.burger_components enable row level security;
alter table public.produtos_menu enable row level security;
alter table public.pedidos_cardapio enable row level security;

-- General public access guidelines for rapid operations
create policy "Allow all actions for empresas" on public.empresas for all using (true) with check (true);
create policy "Allow all actions for utilizadores" on public.utilizadores for all using (true) with check (true);
create policy "Allow all actions for clientes" on public.clientes for all using (true) with check (true);
create policy "Allow all actions for financeiro_metricas" on public.financeiro_metricas for all using (true) with check (true);
create policy "Allow all actions for burger_components" on public.burger_components for all using (true) with check (true);
create policy "Allow all actions for produtos_menu" on public.produtos_menu for all using (true) with check (true);
create policy "Allow all actions for pedidos_cardapio" on public.pedidos_cardapio for all using (true) with check (true);

-- 11. Insert Initial Demonstration Data
insert into public.empresas (id, nome_negocio, slug, email_admin, plano, fase_sistema, status, ticket_medio, custos_fixos_mensais, meta_faturacao, canal_principal, tipo_operacao)
values (
    '8174548c-beef-43ca-a3ba-6f4e894eda47', 
    'BurguersPrime Luanda', 
    'burguersprime-luanda', 
    'albermidia@gmail.com', 
    'prime', 
    'beta', 
    'activo',
    4500,
    150000,
    800000,
    'WhatsApp',
    'ambos'
) on conflict (id) do nothing;

insert into public.utilizadores (id, name, email, avatar, empresa_id, papel)
values (
    'admin-albermidia', 
    'Gelson Santos', 
    'albermidia@gmail.com', 
    '👨‍🍳', 
    '8174548c-beef-43ca-a3ba-6f4e894eda47', 
    'dono'
) on conflict (id) do nothing;

insert into public.financeiro_metricas (empresa_id, marketing_investment, marketing_revenue, fixed_costs, variable_cost_ratio, current_sales_count, total_sales_revenue, new_clients_count, current_day_of_month, supplier_price_increase_percent)
values (
    '8174548c-beef-43ca-a3ba-6f4e894eda47',
    45000,
    145000,
    150000,
    0.40,
    112,
    504000,
    34,
    17,
    0
) on conflict (empresa_id) do nothing;

insert into public.produtos_menu (id, empresa_id, nome, descricao, preco, categoria, disponivel, ordem_exibicao)
values 
('p-1', '8174548c-beef-43ca-a3ba-6f4e894eda47', 'Smash Duplo Prime', 'Duas carnes suculentas de 120g na grelha, queijo cheddar derretido, molho artesanal prime e pão brioche amanteigado.', 4500, 'hamburgueres', true, 1),
('p-2', '8174548c-beef-43ca-a3ba-6f4e894eda47', 'Cheeseburger Classic', 'Hambúrguer grelhado de 150g, queijo cheddar fatiado, picles caseiros e molho especial em pão macio.', 3500, 'hamburgueres', true, 2),
('p-3', '8174548c-beef-43ca-a3ba-6f4e894eda47', 'Batata Frita Rústica', 'Batatas fritas super estaladiças salpicadas com alecrim fresco e flor de sal da nossa costa.', 1500, 'acompanhamentos', true, 3),
('p-4', '8174548c-beef-43ca-a3ba-6f4e894eda47', 'Asinhas Picantes da Banda', '6 asinhas de frango crocantes banhadas em molho picante tradicional de Luanda.', 2500, 'acompanhamentos', true, 4),
('p-5', '8174548c-beef-43ca-a3ba-6f4e894eda47', 'Coca-Cola Zero Lata 330ml', 'Gelada no ponto certo para refrescar a chapa.', 800, 'bebidas', true, 5),
('p-6', '8174548c-beef-43ca-a3ba-6f4e894eda47', 'Bacon Snack Extra', 'Tiras de bacon fumado ultra crocante para dar o toque ideal.', 1000, 'extras', true, 6)
on conflict do nothing;
