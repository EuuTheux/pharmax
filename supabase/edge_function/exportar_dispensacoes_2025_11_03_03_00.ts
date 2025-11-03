import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const dataInicio = url.searchParams.get('dataInicio')
    const dataFim = url.searchParams.get('dataFim')

    let query = supabaseClient
      .from('dispensacoes_2025_11_03_03_00')
      .select(`
        *,
        pacientes_2025_11_03_03_00(nome, cpf),
        medicamentos_2025_11_03_03_00(nome, codigo, principio_ativo, concentracao)
      `)
      .order('data_dispensacao', { ascending: false })

    if (dataInicio) {
      query = query.gte('data_dispensacao', dataInicio)
    }
    if (dataFim) {
      query = query.lte('data_dispensacao', dataFim + 'T23:59:59')
    }

    const { data: dispensacoes, error } = await query

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar dispensações' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Gerar CSV
    const csvHeader = 'Data,Paciente,CPF,Medicamento,Código,Princípio Ativo,Concentração,Quantidade,Usuário,Observações\n'
    
    const csvRows = dispensacoes.map(dispensacao => {
      const data = new Date(dispensacao.data_dispensacao).toLocaleDateString('pt-BR')
      const paciente = dispensacao.pacientes_2025_11_03_03_00?.nome || ''
      const cpf = dispensacao.pacientes_2025_11_03_03_00?.cpf || ''
      const medicamento = dispensacao.medicamentos_2025_11_03_03_00?.nome || ''
      const codigo = dispensacao.medicamentos_2025_11_03_03_00?.codigo || ''
      const principioAtivo = dispensacao.medicamentos_2025_11_03_03_00?.principio_ativo || ''
      const concentracao = dispensacao.medicamentos_2025_11_03_03_00?.concentracao || ''
      const quantidade = dispensacao.quantidade_dispensada
      const usuario = dispensacao.usuario_dispensacao
      const observacoes = dispensacao.observacoes || ''

      return `"${data}","${paciente}","${cpf}","${medicamento}","${codigo}","${principioAtivo}","${concentracao}","${quantidade}","${usuario}","${observacoes}"`
    }).join('\n')

    const csvContent = csvHeader + csvRows

    return new Response(csvContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="dispensacoes_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})