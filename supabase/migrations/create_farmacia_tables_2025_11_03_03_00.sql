-- Criar tabela de medicamentos
CREATE TABLE public.medicamentos_2025_11_03_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    principio_ativo VARCHAR(255) NOT NULL,
    concentracao VARCHAR(100) NOT NULL,
    forma_farmaceutica VARCHAR(100) NOT NULL,
    apresentacao VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de estoque
CREATE TABLE public.estoque_2025_11_03_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicamento_id UUID REFERENCES public.medicamentos_2025_11_03_03_00(id) ON DELETE CASCADE,
    quantidade_atual INTEGER NOT NULL DEFAULT 0,
    quantidade_minima INTEGER NOT NULL DEFAULT 10,
    lote VARCHAR(50),
    data_validade DATE,
    data_entrada DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de pacientes
CREATE TABLE public.pacientes_2025_11_03_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE,
    telefone VARCHAR(20),
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de dispensações
CREATE TABLE public.dispensacoes_2025_11_03_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID REFERENCES public.pacientes_2025_11_03_03_00(id) ON DELETE CASCADE,
    medicamento_id UUID REFERENCES public.medicamentos_2025_11_03_03_00(id) ON DELETE CASCADE,
    quantidade_dispensada INTEGER NOT NULL,
    data_dispensacao TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    observacoes TEXT,
    usuario_dispensacao VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de usuários do sistema
CREATE TABLE public.usuarios_sistema_2025_11_03_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir usuário padrão admin
INSERT INTO public.usuarios_sistema_2025_11_03_03_00 (usuario, senha, nome_completo) 
VALUES ('admin', '0000', 'Administrador do Sistema');

-- Inserir medicamentos básicos do SUS
INSERT INTO public.medicamentos_2025_11_03_03_00 (codigo, nome, principio_ativo, concentracao, forma_farmaceutica, apresentacao) VALUES
('001', 'Paracetamol', 'Paracetamol', '500mg', 'Comprimido', 'Caixa com 20 comprimidos'),
('002', 'Ibuprofeno', 'Ibuprofeno', '600mg', 'Comprimido', 'Caixa com 20 comprimidos'),
('003', 'Dipirona', 'Dipirona Sódica', '500mg', 'Comprimido', 'Caixa com 10 comprimidos'),
('004', 'Amoxicilina', 'Amoxicilina', '500mg', 'Cápsula', 'Caixa com 21 cápsulas'),
('005', 'Captopril', 'Captopril', '25mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('006', 'Losartana', 'Losartana Potássica', '50mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('007', 'Metformina', 'Cloridrato de Metformina', '850mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('008', 'Glibenclamida', 'Glibenclamida', '5mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('009', 'Sinvastatina', 'Sinvastatina', '20mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('010', 'Omeprazol', 'Omeprazol', '20mg', 'Cápsula', 'Caixa com 28 cápsulas'),
('011', 'Salbutamol', 'Sulfato de Salbutamol', '100mcg/dose', 'Aerossol', 'Frasco com 200 doses'),
('012', 'Prednisona', 'Prednisona', '20mg', 'Comprimido', 'Caixa com 10 comprimidos'),
('013', 'Diclofenaco', 'Diclofenaco Sódico', '50mg', 'Comprimido', 'Caixa com 20 comprimidos'),
('014', 'Ácido Acetilsalicílico', 'Ácido Acetilsalicílico', '100mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('015', 'Hidroclorotiazida', 'Hidroclorotiazida', '25mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('016', 'Propranolol', 'Cloridrato de Propranolol', '40mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('017', 'Furosemida', 'Furosemida', '40mg', 'Comprimido', 'Caixa com 20 comprimidos'),
('018', 'Digoxina', 'Digoxina', '0,25mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('019', 'Insulina NPH', 'Insulina Humana NPH', '100UI/mL', 'Suspensão injetável', 'Frasco-ampola 10mL'),
('020', 'Insulina Regular', 'Insulina Humana Regular', '100UI/mL', 'Solução injetável', 'Frasco-ampola 10mL');

-- Inserir estoque inicial para alguns medicamentos
INSERT INTO public.estoque_2025_11_03_03_00 (medicamento_id, quantidade_atual, quantidade_minima, lote, data_validade) 
SELECT id, 100, 20, 'LOTE001', '2025-12-31' FROM public.medicamentos_2025_11_03_03_00 WHERE codigo IN ('001', '002', '003', '004', '005');

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.medicamentos_2025_11_03_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_2025_11_03_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes_2025_11_03_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispensacoes_2025_11_03_03_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_sistema_2025_11_03_03_00 ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (permitir acesso para usuários autenticados)
CREATE POLICY "Permitir acesso completo medicamentos" ON public.medicamentos_2025_11_03_03_00 FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo estoque" ON public.estoque_2025_11_03_03_00 FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo pacientes" ON public.pacientes_2025_11_03_03_00 FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo dispensacoes" ON public.dispensacoes_2025_11_03_03_00 FOR ALL USING (true);
CREATE POLICY "Permitir acesso completo usuarios" ON public.usuarios_sistema_2025_11_03_03_00 FOR ALL USING (true);