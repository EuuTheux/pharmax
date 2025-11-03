-- Criar tabela de profissionais com níveis de acesso
CREATE TABLE public.profissionais_2025_11_03_03_00 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    crf VARCHAR(20), -- Registro profissional (CRF, COREN, etc.)
    tipo_profissional VARCHAR(20) NOT NULL CHECK (tipo_profissional IN ('enfermeiro', 'tecnico', 'recepcionista')),
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir profissionais padrão
INSERT INTO public.profissionais_2025_11_03_03_00 (nome_completo, cpf, crf, tipo_profissional, usuario, senha) VALUES
('Enfermeiro Chefe', '000.000.000-01', 'COREN-123456', 'enfermeiro', 'enfermeiro', '1234'),
('Técnico em Farmácia', '000.000.000-02', 'CRF-T-789012', 'tecnico', 'tecnico', '1234'),
('Recepcionista', '000.000.000-03', '', 'recepcionista', 'recepcao', '1234');

-- Adicionar novos medicamentos cardiovasculares
INSERT INTO public.medicamentos_2025_11_03_03_00 (codigo, nome, principio_ativo, concentracao, forma_farmaceutica, apresentacao) VALUES
('021', 'Captopril 50mg', 'Captopril', '50mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('022', 'Enalapril', 'Enalapril maleato', '10mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('023', 'Enalapril', 'Enalapril maleato', '20mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('024', 'Losartana 25mg', 'Losartana potássica', '25mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('025', 'Losartana 100mg', 'Losartana potássica', '100mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('026', 'Atenolol 25mg', 'Atenolol', '25mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('027', 'Atenolol 50mg', 'Atenolol', '50mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('028', 'Metildopa', 'Metildopa', '250mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('029', 'Anlodipino 5mg', 'Anlodipino', '5mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('030', 'Anlodipino 10mg', 'Anlodipino', '10mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('031', 'Nifedipino 10mg', 'Nifedipino', '10mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('032', 'Nifedipino 20mg', 'Nifedipino', '20mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('033', 'Espironolactona', 'Espironolactona', '25mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('034', 'Clortalidona', 'Clortalidona', '25mg', 'Comprimido', 'Caixa com 30 comprimidos');

-- Adicionar analgésicos e anti-inflamatórios
INSERT INTO public.medicamentos_2025_11_03_03_00 (codigo, nome, principio_ativo, concentracao, forma_farmaceutica, apresentacao) VALUES
('035', 'Paracetamol 750mg', 'Paracetamol', '750mg', 'Comprimido', 'Caixa com 20 comprimidos'),
('036', 'Dipirona Solução', 'Dipirona sódica', '500mg/mL', 'Solução oral', 'Frasco 10mL'),
('037', 'Ibuprofeno 300mg', 'Ibuprofeno', '300mg', 'Comprimido', 'Caixa com 20 comprimidos'),
('038', 'Metformina 500mg', 'Metformina', '500mg', 'Comprimido', 'Caixa com 30 comprimidos');

-- Adicionar antibióticos
INSERT INTO public.medicamentos_2025_11_03_03_00 (codigo, nome, principio_ativo, concentracao, forma_farmaceutica, apresentacao) VALUES
('039', 'Amoxicilina Suspensão', 'Amoxicilina', '250mg/5mL', 'Suspensão oral', 'Frasco 150mL'),
('040', 'Azitromicina', 'Azitromicina', '500mg', 'Comprimido', 'Caixa com 3 comprimidos'),
('041', 'Benzilpenicilina', 'Benzilpenicilina benzatina', '1.200.000 UI', 'Injetável', 'Frasco-ampola'),
('042', 'Cefalexina', 'Cefalexina', '500mg', 'Cápsula', 'Caixa com 8 cápsulas'),
('043', 'Metronidazol', 'Metronidazol', '250mg', 'Comprimido', 'Caixa com 20 comprimidos');

-- Adicionar medicamentos respiratórios
INSERT INTO public.medicamentos_2025_11_03_03_00 (codigo, nome, principio_ativo, concentracao, forma_farmaceutica, apresentacao) VALUES
('044', 'Beclometasona', 'Beclometasona', '250mcg/dose', 'Aerossol', 'Frasco com 200 doses');

-- Adicionar anti-histamínicos e corticoides
INSERT INTO public.medicamentos_2025_11_03_03_00 (codigo, nome, principio_ativo, concentracao, forma_farmaceutica, apresentacao) VALUES
('045', 'Loratadina', 'Loratadina', '10mg', 'Comprimido', 'Caixa com 12 comprimidos'),
('046', 'Prednisona 5mg', 'Prednisona', '5mg', 'Comprimido', 'Caixa com 20 comprimidos'),
('047', 'Dexametasona 0,5mg', 'Dexametasona', '0,5mg', 'Comprimido', 'Caixa com 10 comprimidos'),
('048', 'Dexametasona Injetável', 'Dexametasona', '4mg/mL', 'Injetável', 'Ampola 2,5mL');

-- Adicionar gastrointestinais
INSERT INTO public.medicamentos_2025_11_03_03_00 (codigo, nome, principio_ativo, concentracao, forma_farmaceutica, apresentacao) VALUES
('049', 'Dimeticona', 'Dimeticona', '75mg/mL', 'Solução oral', 'Frasco 10mL'),
('050', 'Escopolamina', 'Escopolamina', '10mg/mL', 'Injetável', 'Ampola 1mL');

-- Adicionar sistema nervoso
INSERT INTO public.medicamentos_2025_11_03_03_00 (codigo, nome, principio_ativo, concentracao, forma_farmaceutica, apresentacao) VALUES
('051', 'Diazepam', 'Diazepam', '5mg', 'Comprimido', 'Caixa com 20 comprimidos'),
('052', 'Amitriptilina', 'Amitriptilina', '25mg', 'Comprimido', 'Caixa com 20 comprimidos'),
('053', 'Sertralina', 'Sertralina', '50mg', 'Comprimido', 'Caixa com 30 comprimidos');

-- Adicionar saúde da mulher
INSERT INTO public.medicamentos_2025_11_03_03_00 (codigo, nome, principio_ativo, concentracao, forma_farmaceutica, apresentacao) VALUES
('054', 'Ácido Fólico', 'Ácido fólico', '5mg', 'Comprimido', 'Caixa com 30 comprimidos'),
('055', 'Sulfato Ferroso', 'Sulfato ferroso', '40mg/mL', 'Solução oral', 'Frasco 30mL'),
('056', 'Anticoncepcional', 'Etinilestradiol + Levonorgestrel', '0,03mg + 0,15mg', 'Comprimido', 'Cartela com 21 comprimidos'),
('057', 'Medroxiprogesterona', 'Medroxiprogesterona', '150mg/mL', 'Injetável', 'Ampola 1mL');

-- Adicionar insulinas
INSERT INTO public.medicamentos_2025_11_03_03_00 (codigo, nome, principio_ativo, concentracao, forma_farmaceutica, apresentacao) VALUES
('058', 'Insulina Glargina', 'Insulina Glargina', '100UI/mL', 'Solução injetável', 'Frasco-ampola 10mL'),
('059', 'Sinvastatina 40mg', 'Sinvastatina', '40mg', 'Comprimido', 'Caixa com 30 comprimidos');

-- Habilitar RLS na tabela de profissionais
ALTER TABLE public.profissionais_2025_11_03_03_00 ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para profissionais
CREATE POLICY "Permitir acesso completo profissionais" ON public.profissionais_2025_11_03_03_00 FOR ALL USING (true);

-- Atualizar tabela de usuários do sistema para incluir tipo de profissional
ALTER TABLE public.usuarios_sistema_2025_11_03_03_00 ADD COLUMN tipo_profissional VARCHAR(20) DEFAULT 'admin';

-- Atualizar usuário admin
UPDATE public.usuarios_sistema_2025_11_03_03_00 SET tipo_profissional = 'admin' WHERE usuario = 'admin';