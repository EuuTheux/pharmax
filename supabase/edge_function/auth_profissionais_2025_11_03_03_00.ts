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

    const { usuario, senha } = await req.json()

    if (!usuario || !senha) {
      return new Response(
        JSON.stringify({ error: 'Usuário e senha são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Primeiro tentar na tabela de usuários do sistema (admin)
    const { data: usuarioAdmin, error: errorAdmin } = await supabaseClient
      .from('usuarios_sistema_2025_11_03_03_00')
      .select('*')
      .eq('usuario', usuario)
      .eq('senha', senha)
      .eq('ativo', true)
      .single()

    if (usuarioAdmin && !errorAdmin) {
      const { senha: _, ...usuarioSemSenha } = usuarioAdmin
      return new Response(
        JSON.stringify({ 
          success: true, 
          usuario: {
            ...usuarioSemSenha,
            tipo_profissional: usuarioAdmin.tipo_profissional || 'admin'
          },
          message: 'Login realizado com sucesso' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Se não encontrou admin, tentar na tabela de profissionais
    const { data: profissional, error: errorProfissional } = await supabaseClient
      .from('profissionais_2025_11_03_03_00')
      .select('*')
      .eq('usuario', usuario)
      .eq('senha', senha)
      .eq('ativo', true)
      .single()

    if (profissional && !errorProfissional) {
      const { senha: _, ...profissionalSemSenha } = profissional
      return new Response(
        JSON.stringify({ 
          success: true, 
          usuario: profissionalSemSenha,
          message: 'Login realizado com sucesso' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Se não encontrou em nenhuma tabela
    return new Response(
      JSON.stringify({ error: 'Usuário ou senha inválidos' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

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