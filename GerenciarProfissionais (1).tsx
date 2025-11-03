import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Users, Edit, Trash2, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Profissional {
  id: string;
  nome_completo: string;
  cpf: string;
  crf: string;
  tipo_profissional: 'enfermeiro' | 'tecnico' | 'recepcionista';
  usuario: string;
  ativo: boolean;
  created_at: string;
}

const GerenciarProfissionais: React.FC = () => {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editandoProfissional, setEditandoProfissional] = useState<Profissional | null>(null);
  const [novoProfissional, setNovoProfissional] = useState({
    nome_completo: '',
    cpf: '',
    crf: '',
    tipo_profissional: '',
    usuario: '',
    senha: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    carregarProfissionais();
  }, []);

  const carregarProfissionais = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profissionais_2025_11_03_03_00')
        .select('*')
        .order('nome_completo');

      if (error) throw error;
      setProfissionais(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar profissionais",
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

  const salvarProfissional = async () => {
    if (!novoProfissional.nome_completo || !novoProfissional.cpf || !novoProfissional.tipo_profissional || !novoProfissional.usuario || !novoProfissional.senha) {
      toast({
        title: "Erro",
        description: "Todos os campos obrigatórios devem ser preenchidos",
        variant: "destructive"
      });
      return;
    }

    try {
      const dadosProfissional = {
        ...novoProfissional,
        cpf: formatarCPF(novoProfissional.cpf)
      };

      if (editandoProfissional) {
        // Atualizar profissional existente
        const { error } = await supabase
          .from('profissionais_2025_11_03_03_00')
          .update(dadosProfissional)
          .eq('id', editandoProfissional.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Profissional atualizado com sucesso"
        });
      } else {
        // Criar novo profissional
        const { error } = await supabase
          .from('profissionais_2025_11_03_03_00')
          .insert([dadosProfissional]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Profissional cadastrado com sucesso"
        });
      }

      setNovoProfissional({
        nome_completo: '',
        cpf: '',
        crf: '',
        tipo_profissional: '',
        usuario: '',
        senha: ''
      });
      setEditandoProfissional(null);
      setDialogOpen(false);
      carregarProfissionais();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message.includes('duplicate') ? 'CPF ou usuário já cadastrado' : 'Erro ao salvar profissional',
        variant: "destructive"
      });
    }
  };

  const editarProfissional = (profissional: Profissional) => {
    setEditandoProfissional(profissional);
    setNovoProfissional({
      nome_completo: profissional.nome_completo,
      cpf: profissional.cpf,
      crf: profissional.crf || '',
      tipo_profissional: profissional.tipo_profissional,
      usuario: profissional.usuario,
      senha: '' // Não mostrar senha atual
    });
    setDialogOpen(true);
  };

  const excluirProfissional = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profissionais_2025_11_03_03_00')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Profissional excluído com sucesso"
      });
      carregarProfissionais();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir profissional",
        variant: "destructive"
      });
    }
  };

  const alternarStatus = async (profissional: Profissional) => {
    try {
      const { error } = await supabase
        .from('profissionais_2025_11_03_03_00')
        .update({ ativo: !profissional.ativo })
        .eq('id', profissional.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Profissional ${profissional.ativo ? 'desativado' : 'ativado'} com sucesso`
      });
      carregarProfissionais();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do profissional",
        variant: "destructive"
      });
    }
  };

  const getTipoBadge = (tipo: string) => {
    const cores = {
      enfermeiro: 'bg-green-100 text-green-800',
      tecnico: 'bg-blue-100 text-blue-800',
      recepcionista: 'bg-purple-100 text-purple-800'
    };
    
    const nomes = {
      enfermeiro: 'Enfermeiro',
      tecnico: 'Técnico',
      recepcionista: 'Recepcionista'
    };

    return (
      <Badge className={cores[tipo as keyof typeof cores]}>
        {nomes[tipo as keyof typeof nomes]}
      </Badge>
    );
  };

  const getPermissoesBadge = (tipo: string) => {
    const permissoes = {
      enfermeiro: { texto: 'Direitos Totais', cor: 'bg-green-500' },
      tecnico: { texto: 'Direitos Intermediários', cor: 'bg-blue-500' },
      recepcionista: { texto: 'Direitos Limitados', cor: 'bg-purple-500' }
    };

    const perm = permissoes[tipo as keyof typeof permissoes];
    return (
      <div className="flex items-center space-x-1">
        <Shield className="h-3 w-3" />
        <span className="text-xs">{perm.texto}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Gerenciar Profissionais</h2>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditandoProfissional(null);
              setNovoProfissional({
                nome_completo: '',
                cpf: '',
                crf: '',
                tipo_profissional: '',
                usuario: '',
                senha: ''
              });
            }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editandoProfissional ? 'Editar Profissional' : 'Novo Profissional'}
              </DialogTitle>
              <DialogDescription>
                {editandoProfissional ? 'Atualize os dados do profissional' : 'Cadastre um novo profissional no sistema'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={novoProfissional.nome_completo}
                  onChange={(e) => setNovoProfissional({ ...novoProfissional, nome_completo: e.target.value })}
                  placeholder="Nome completo do profissional"
                />
              </div>
              
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={novoProfissional.cpf}
                  onChange={(e) => setNovoProfissional({ ...novoProfissional, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div>
                <Label htmlFor="crf">Registro Profissional</Label>
                <Input
                  id="crf"
                  value={novoProfissional.crf}
                  onChange={(e) => setNovoProfissional({ ...novoProfissional, crf: e.target.value })}
                  placeholder="CRF, COREN, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="tipo_profissional">Tipo de Profissional *</Label>
                <Select
                  value={novoProfissional.tipo_profissional}
                  onValueChange={(value) => setNovoProfissional({ ...novoProfissional, tipo_profissional: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enfermeiro">Enfermeiro (Direitos Totais)</SelectItem>
                    <SelectItem value="tecnico">Técnico (Direitos Intermediários)</SelectItem>
                    <SelectItem value="recepcionista">Recepcionista (Direitos Limitados)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="usuario">Usuário *</Label>
                <Input
                  id="usuario"
                  value={novoProfissional.usuario}
                  onChange={(e) => setNovoProfissional({ ...novoProfissional, usuario: e.target.value })}
                  placeholder="Nome de usuário para login"
                />
              </div>
              
              <div>
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={novoProfissional.senha}
                  onChange={(e) => setNovoProfissional({ ...novoProfissional, senha: e.target.value })}
                  placeholder="Senha de acesso"
                />
              </div>
              
              <Button onClick={salvarProfissional} className="w-full">
                {editandoProfissional ? 'Atualizar' : 'Cadastrar'} Profissional
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Profissionais */}
      <Card>
        <CardHeader>
          <CardTitle>Profissionais Cadastrados</CardTitle>
          <CardDescription>
            Total de {profissionais.length} profissional(is) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profissionais.map((profissional) => (
                  <TableRow key={profissional.id}>
                    <TableCell className="font-medium">{profissional.nome_completo}</TableCell>
                    <TableCell>{profissional.cpf}</TableCell>
                    <TableCell>{profissional.crf || '-'}</TableCell>
                    <TableCell>{getTipoBadge(profissional.tipo_profissional)}</TableCell>
                    <TableCell>{getPermissoesBadge(profissional.tipo_profissional)}</TableCell>
                    <TableCell>{profissional.usuario}</TableCell>
                    <TableCell>
                      <Badge variant={profissional.ativo ? "default" : "secondary"}>
                        {profissional.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editarProfissional(profissional)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alternarStatus(profissional)}
                        >
                          {profissional.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o profissional {profissional.nome_completo}? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => excluirProfissional(profissional.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {profissionais.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhum profissional cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Card de Informações sobre Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Níveis de Acesso</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-semibold text-green-800">Enfermeiro</h4>
              <p className="text-sm text-green-700 mt-1">Direitos Totais</p>
              <ul className="text-xs text-green-600 mt-2 space-y-1">
                <li>• Todas as funcionalidades</li>
                <li>• Gerenciar profissionais</li>
                <li>• Relatórios completos</li>
                <li>• Controle total do sistema</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-800">Técnico</h4>
              <p className="text-sm text-blue-700 mt-1">Direitos Intermediários</p>
              <ul className="text-xs text-blue-600 mt-2 space-y-1">
                <li>• Dispensação de medicamentos</li>
                <li>• Controle de estoque</li>
                <li>• Cadastro de pacientes</li>
                <li>• Relatórios básicos</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-purple-50">
              <h4 className="font-semibold text-purple-800">Recepcionista</h4>
              <p className="text-sm text-purple-700 mt-1">Direitos Limitados</p>
              <ul className="text-xs text-purple-600 mt-2 space-y-1">
                <li>• Cadastro de pacientes</li>
                <li>• Consulta de estoque</li>
                <li>• Visualizar dispensações</li>
                <li>• Relatórios básicos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GerenciarProfissionais;