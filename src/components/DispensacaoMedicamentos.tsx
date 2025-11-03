import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, User, Pill } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Medicamento {
  id: string;
  codigo: string;
  nome: string;
  principio_ativo: string;
  concentracao: string;
  forma_farmaceutica: string;
  apresentacao: string;
}

interface Estoque {
  id: string;
  medicamento_id: string;
  quantidade_atual: number;
  quantidade_minima: number;
  lote: string;
  data_validade: string;
}

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  endereco: string;
}

const DispensacaoMedicamentos: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [estoque, setEstoque] = useState<Estoque[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPaciente, setSearchPaciente] = useState('');
  const [novoPaciente, setNovoPaciente] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    endereco: ''
  });
  const [dispensacao, setDispensacao] = useState({
    paciente_id: '',
    medicamento_id: '',
    quantidade_dispensada: '',
    observacoes: ''
  });
  const [showNovoPaciente, setShowNovoPaciente] = useState(false);
  const { toast } = useToast();
  const { usuario, hasPermission } = useAuth();

  // Verificar permissões
  const canDispense = hasPermission('dispensacao');
  const canManagePatients = hasPermission('pacientes');

  if (!canDispense) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertDescription>
            Você não tem permissão para acessar esta funcionalidade.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar medicamentos
      const { data: medicamentosData } = await supabase
        .from('medicamentos_2025_11_03_03_00')
        .select('*')
        .order('nome');

      // Carregar estoque
      const { data: estoqueData } = await supabase
        .from('estoque_2025_11_03_03_00')
        .select('*');

      // Carregar pacientes
      const { data: pacientesData } = await supabase
        .from('pacientes_2025_11_03_03_00')
        .select('*')
        .order('nome');

      setMedicamentos(medicamentosData || []);
      setEstoque(estoqueData || []);
      setPacientes(pacientesData || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatarCPF = (cpf: string) => {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const cadastrarPaciente = async () => {
    if (!novoPaciente.nome || !novoPaciente.cpf) {
      toast({
        title: "Erro",
        description: "Nome e CPF são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pacientes_2025_11_03_03_00')
        .insert([{
          ...novoPaciente,
          cpf: formatarCPF(novoPaciente.cpf)
        }])
        .select()
        .single();

      if (error) throw error;

      setPacientes([...pacientes, data]);
      setDispensacao({ ...dispensacao, paciente_id: data.id });
      setNovoPaciente({
        nome: '',
        cpf: '',
        data_nascimento: '',
        telefone: '',
        endereco: ''
      });
      setShowNovoPaciente(false);
      
      toast({
        title: "Sucesso",
        description: "Paciente cadastrado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar paciente",
        variant: "destructive"
      });
    }
  };

  const realizarDispensacao = async () => {
    if (!dispensacao.paciente_id || !dispensacao.medicamento_id || !dispensacao.quantidade_dispensada) {
      toast({
        title: "Erro",
        description: "Todos os campos obrigatórios devem ser preenchidos",
        variant: "destructive"
      });
      return;
    }

    const quantidade = parseInt(dispensacao.quantidade_dispensada);
    const estoqueItem = estoque.find(e => e.medicamento_id === dispensacao.medicamento_id);
    
    if (!estoqueItem || estoqueItem.quantidade_atual < quantidade) {
      toast({
        title: "Erro",
        description: "Quantidade insuficiente em estoque",
        variant: "destructive"
      });
      return;
    }

    try {
      // Registrar dispensação
      const { error: dispensacaoError } = await supabase
        .from('dispensacoes_2025_11_03_03_00')
        .insert([{
          ...dispensacao,
          quantidade_dispensada: quantidade,
          usuario_dispensacao: usuario?.nome_completo || 'Sistema'
        }]);

      if (dispensacaoError) throw dispensacaoError;

      // Atualizar estoque
      const { error: estoqueError } = await supabase
        .from('estoque_2025_11_03_03_00')
        .update({ 
          quantidade_atual: estoqueItem.quantidade_atual - quantidade,
          updated_at: new Date().toISOString()
        })
        .eq('id', estoqueItem.id);

      if (estoqueError) throw estoqueError;

      // Atualizar estado local
      setEstoque(estoque.map(e => 
        e.id === estoqueItem.id 
          ? { ...e, quantidade_atual: e.quantidade_atual - quantidade }
          : e
      ));

      setDispensacao({
        paciente_id: '',
        medicamento_id: '',
        quantidade_dispensada: '',
        observacoes: ''
      });

      toast({
        title: "Sucesso",
        description: "Dispensação realizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar dispensação",
        variant: "destructive"
      });
    }
  };

  const pacientesFiltrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchPaciente.toLowerCase()) ||
    p.cpf.includes(searchPaciente)
  );

  const medicamentosComEstoque = medicamentos.map(med => {
    const estoqueItem = estoque.find(e => e.medicamento_id === med.id);
    return {
      ...med,
      quantidade_estoque: estoqueItem?.quantidade_atual || 0
    };
  }).filter(med => med.quantidade_estoque > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Pill className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Dispensação de Medicamentos</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seleção de Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Selecionar Paciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search-paciente">Buscar Paciente</Label>
              <Input
                id="search-paciente"
                placeholder="Digite o nome ou CPF do paciente"
                value={searchPaciente}
                onChange={(e) => setSearchPaciente(e.target.value)}
              />
            </div>

            {searchPaciente && (
              <div className="max-h-40 overflow-y-auto border rounded-md">
                {pacientesFiltrados.map(paciente => (
                  <div
                    key={paciente.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setDispensacao({ ...dispensacao, paciente_id: paciente.id });
                      setSearchPaciente(`${paciente.nome} - ${paciente.cpf}`);
                    }}
                  >
                    <div className="font-medium">{paciente.nome}</div>
                    <div className="text-sm text-gray-500">{paciente.cpf}</div>
                  </div>
                ))}
                {pacientesFiltrados.length === 0 && (
                  <div className="p-2 text-center text-gray-500">
                    Nenhum paciente encontrado
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setShowNovoPaciente(!showNovoPaciente)}
              className="w-full"
            >
              {showNovoPaciente ? 'Cancelar' : 'Cadastrar Novo Paciente'}
            </Button>

            {showNovoPaciente && (
              <div className="space-y-3 p-4 border rounded-md bg-gray-50">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={novoPaciente.nome}
                    onChange={(e) => setNovoPaciente({ ...novoPaciente, nome: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={novoPaciente.cpf}
                    onChange={(e) => setNovoPaciente({ ...novoPaciente, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={novoPaciente.data_nascimento}
                    onChange={(e) => setNovoPaciente({ ...novoPaciente, data_nascimento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={novoPaciente.telefone}
                    onChange={(e) => setNovoPaciente({ ...novoPaciente, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <Button onClick={cadastrarPaciente} className="w-full">
                  Cadastrar Paciente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dispensação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Dispensar Medicamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="medicamento">Medicamento *</Label>
              <Select
                value={dispensacao.medicamento_id}
                onValueChange={(value) => setDispensacao({ ...dispensacao, medicamento_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o medicamento" />
                </SelectTrigger>
                <SelectContent>
                  {medicamentosComEstoque.map(med => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.nome} - {med.concentracao} (Estoque: {med.quantidade_estoque})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={dispensacao.quantidade_dispensada}
                onChange={(e) => setDispensacao({ ...dispensacao, quantidade_dispensada: e.target.value })}
                placeholder="Quantidade a dispensar"
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={dispensacao.observacoes}
                onChange={(e) => setDispensacao({ ...dispensacao, observacoes: e.target.value })}
                placeholder="Observações sobre a dispensação"
                rows={3}
              />
            </div>

            <Button
              onClick={realizarDispensacao}
              className="w-full"
              disabled={!dispensacao.paciente_id || !dispensacao.medicamento_id || !dispensacao.quantidade_dispensada}
            >
              Realizar Dispensação
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DispensacaoMedicamentos;