import { useEffect, useState } from 'react'
import { supabase } from './supabase'

import {
  LayoutDashboard,
  Users,
  FileClock,
  LogOut,
  Bell,
  Trash2,
} from 'lucide-react'

import Papa from 'papaparse'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from 'recharts'

export default function App() {

  const [session, setSession] = useState(null)

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const [horaAtual, setHoraAtual] = useState('')

 
  const [funcionarios, setFuncionarios] = useState([])

const [nome, setNome] = useState('')
const [cpf, setCpf] = useState('')
const [cargo, setCargo] = useState('')
const [empresa, setEmpresa] = useState('')
const [registros, setRegistros] = useState([])
const [pagina, setPagina] = useState('dashboard')


  const dadosGrafico = [
  {
    dia: 'Seg',
    registros: 18,
  },

  {
    dia: 'Ter',
    registros: 22,
  },

  {
    dia: 'Qua',
    registros: 20,
  },

  {
    dia: 'Qui',
    registros: 25,
  },

  {
    dia: 'Sex',
    registros: 19,
  },
]

  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    carregarFuncionarios()
    carregarRegistros()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()

  }, [])

  async function carregarFuncionarios() {

  const { data } = await supabase
    .from('funcionarios')
    .select('*')
    .order('id', { ascending: false })

  if (data) {

    setFuncionarios(data)

  }

}

async function carregarRegistros() {

  const { data } = await supabase
    .from('registros')
    .select('*')
    .order('id', { ascending: false })

  if (data) {

    setRegistros(data)

  }

}

  useEffect(() => {

    const interval = setInterval(() => {

      const agora = new Date()

      setHoraAtual(
        agora.toLocaleTimeString('pt-BR')
      )

    }, 1000)

    return () => clearInterval(interval)

  }, [])

  async function fazerLogin(e) {

    e.preventDefault()

    setLoading(true)
    setMensagem('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {

      setMensagem(error.message)

    }

    setLoading(false)

  }

  async function criarConta() {

    setLoading(true)
    setMensagem('')

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (error) {

      setMensagem(error.message)

    } else {

      setMensagem('Conta criada com sucesso 🚀')

    }

    setLoading(false)

  }

  async function sair() {

    await supabase.auth.signOut()

  }

async function cadastrarFuncionario() {

  if (!nome || !cpf) {

    return alert('Preencha os campos')

  }

  const { error } = await supabase
    .from('funcionarios')
    .insert([
      {
        nome,
        cpf,
        cargo,
        empresa,
      }
    ])

  if (error) {
    console.log(error)
    alert(error.message)

  } else {

    setNome('')
    setCpf('')
    setCargo('')
    setEmpresa('')

    carregarFuncionarios()

    alert('Funcionário cadastrado 🚀')

  }

}

async function excluirFuncionario(id) {

  const confirmar = confirm(
    'Deseja excluir este funcionário?'
  )

  if (!confirmar) return

  const { error } = await supabase
    .from('registros')
    .delete()
    .eq('id', id)

  if (error) {

    alert(error.message)

  } else {

 carregarRegistros()

    alert('Funcionário removido 🚀')

  }

}

function importarCSV(event) {

  const arquivo = event.target.files[0]

  if (!arquivo) return

  Papa.parse(arquivo, {

    header: true,

    complete: async (resultado) => {

    const dados = resultado.data

const { error } = await supabase
  .from('registros')
  .insert(dados)

if (error) {

  alert(error.message)

} else {

  carregarRegistros()

  alert('CSV importado com sucesso 🚀')

}

      alert('CSV importado 🚀')

    },

  })

}


  // LOGIN
  if (!session) {

    return (

      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">

          <div className="mb-10 text-center">

            <h1 className="text-5xl font-bold text-white">
              NTEC
            </h1>

            <p className="text-indigo-400 text-xl mt-2 font-semibold">
              PONTO
            </p>

            <p className="text-slate-400 mt-4">
              Sistema inteligente de controle de jornada
            </p>

          </div>

          <form
            onSubmit={fazerLogin}
            className="space-y-5"
          >

            <div>

              <label className="block text-slate-300 mb-2">
                E-mail
              </label>

              <input
                type="email"
                placeholder="empresa@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:outline-none text-white px-5 py-4 rounded-2xl"
              />

            </div>

            <div>

              <label className="block text-slate-300 mb-2">
                Senha
              </label>

              <input
                type="password"
                placeholder="********"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:outline-none text-white px-5 py-4 rounded-2xl"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 text-white font-semibold py-4 rounded-2xl mt-4"
            >

              {loading ? 'Entrando...' : 'Entrar'}

            </button>

          </form>

          <button
            onClick={criarConta}
            className="w-full mt-4 bg-slate-800 hover:bg-slate-700 transition-all duration-300 text-white font-semibold py-4 rounded-2xl"
          >
            Criar Conta
          </button>

          {

            mensagem && (

              <div className="mt-6 bg-slate-800 border border-slate-700 p-4 rounded-2xl text-center text-slate-300">
                {mensagem}
              </div>

            )

          }

        </div>

      </div>

    )

  }

  // DASHBOARD
  return (

    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6">

        <div className="mb-12">

          <h1 className="text-3xl font-bold">
            NTEC PONTO
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Controle inteligente
          </p>

        </div>

        <nav className="space-y-3">

         <button
  onClick={() => setPagina('dashboard')}
  className={`w-full p-4 rounded-2xl text-left flex items-center gap-3 transition
    ${pagina === 'dashboard'
      ? 'bg-indigo-600'
      : 'bg-slate-800 hover:bg-slate-700'}
  `}
>
  <LayoutDashboard size={20} />
  Dashboard
          </button>

          <button
  onClick={() => setPagina('funcionarios')}
  className={`w-full p-4 rounded-2xl text-left flex items-center gap-3 transition
    ${pagina === 'funcionarios'
      ? 'bg-indigo-600'
      : 'bg-slate-800 hover:bg-slate-700'}
  `}
>
  <Users size={20} />

  Funcionários
          </button>

          <button
  onClick={() => setPagina('registros')}
  className={`w-full p-4 rounded-2xl text-left flex items-center gap-3 transition
    ${pagina === 'registros'
      ? 'bg-indigo-600'
      : 'bg-slate-800 hover:bg-slate-700'}
  `}
>
  <FileClock size={20} />
  Registros
</button>

          <button
            onClick={sair}
            className="w-full bg-red-600 hover:bg-red-500 transition p-4 rounded-2xl text-left flex items-center gap-3"
          >
            <LogOut size={20} />
            Sair
          </button>

        </nav>

      </aside>

      {/* Conteúdo */}
     

  {/* HEADER */}
  <main className="flex-1 bg-[#f5f7fb] p-8 overflow-auto">

  {/* HEADER */}
  <div className="flex items-start justify-between mb-10">

    <div>

      <h1 className="text-6xl font-bold text-slate-900 flex items-center gap-3">
        Dashboard 🚀
      </h1>

      <p className="text-slate-500 text-xl mt-2">
        Bem-vindo ao NTEC PONTO
      </p>

    </div>

    <div className="flex gap-5">

      {/* RELÓGIO */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl px-8 py-5 min-w-[220px]">

        <p className="text-slate-500 text-sm">
          Horário Atual
        </p>

        <h2 className="text-4xl font-bold text-indigo-600 mt-1">
          {horaAtual}
        </h2>

      </div>

      {/* USUÁRIO */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl px-8 py-5 flex items-center gap-5 min-w-[360px]">

        <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
          N
        </div>

        <div>

          <p className="text-slate-500 text-sm">
            Usuário Logado
          </p>

          <h2 className="font-bold text-slate-900 text-lg">
            {session.user.email}
          </h2>

        </div>

      </div>

    </div>

  </div>

  {/* CARDS */}
  <div className="grid grid-cols-4 gap-6 mb-8">

    {/* FUNCIONÁRIOS */}
    <div className="bg-white border-l-4 border-indigo-500 rounded-3xl p-8 shadow-sm">

      <div className="flex items-center gap-5">

        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">

          <Users
            size={42}
            className="text-indigo-600"
          />

        </div>

        <div>

          <p className="text-slate-700 text-2xl font-semibold">
            Funcionários
          </p>

          <h2 className="text-6xl font-bold text-indigo-600 mt-2">
            {funcionarios.length}
          </h2>

          <p className="text-slate-400 text-lg mt-2">
            Total cadastrados
          </p>

        </div>

      </div>

    </div>

    {/* REGISTROS */}
    <div className="bg-white border-l-4 border-blue-500 rounded-3xl p-8 shadow-sm">

      <div className="flex items-center gap-5">

        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">

          <FileClock
            size={42}
            className="text-blue-600"
          />

        </div>

        <div>

          <p className="text-slate-700 text-2xl font-semibold">
            Registros Hoje
          </p>

          <h2 className="text-6xl font-bold text-blue-600 mt-2">
            57
          </h2>

          <p className="text-slate-400 text-lg mt-2">
            Total de registros
          </p>

        </div>

      </div>

    </div>

    {/* ATRASOS */}
    <div className="bg-white border-l-4 border-yellow-400 rounded-3xl p-8 shadow-sm">

      <div className="flex items-center gap-5">

        <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center">

          <Bell
            size={42}
            className="text-yellow-500"
          />

        </div>

        <div>

          <p className="text-slate-700 text-2xl font-semibold">
            Atrasos
          </p>

          <h2 className="text-6xl font-bold text-yellow-500 mt-2">
            3
          </h2>

          <p className="text-slate-400 text-lg mt-2">
            Registros com atraso
          </p>

        </div>

      </div>

    </div>

    {/* ALERTAS */}
    <div className="bg-white border-l-4 border-red-500 rounded-3xl p-8 shadow-sm">

      <div className="flex items-center gap-5">

        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">

          <Bell
            size={42}
            className="text-red-500"
          />

        </div>

        <div>

          <p className="text-slate-700 text-2xl font-semibold">
            Alertas
          </p>

          <h2 className="text-5xl font-bold text-red-500 mt-2">
            2 Pendentes
          </h2>

          <p className="text-slate-400 text-lg mt-2">
            Itens para revisão
          </p>

        </div>

      </div>

    </div>

  </div>

  {/* GRÁFICO */}
  <div className="bg-white rounded-3xl p-8 shadow-sm mb-8 border border-slate-200">

    <div className="flex items-center justify-between mb-8">

      <div>

        <h2 className="text-4xl font-bold text-slate-900">
          Registros da Semana
        </h2>

        <p className="text-slate-500 mt-2 text-lg">
          Controle semanal de presença
        </p>

      </div>

      <button className="border border-slate-300 bg-white hover:bg-slate-100 transition px-5 py-3 rounded-2xl font-semibold text-slate-700">

        Esta Semana

      </button>

    </div>

    <div className="h-96">

      <ResponsiveContainer width="100%" height="100%">

        <BarChart data={dadosGrafico}>

          <XAxis
            dataKey="dia"
            stroke="#64748b"
          />

          <Tooltip />

          <Bar
            dataKey="registros"
            fill="#4f46e5"
            radius={[10, 10, 0, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  </div>

{/* FUNCIONÁRIOS */}
{pagina === 'funcionarios' && (

<>

{/* FORMULÁRIO */}
<div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8">

  <h2 className="text-3xl font-bold text-slate-900 mb-6">
    Novo Funcionário
  </h2>

  <div className="grid grid-cols-4 gap-5">

    <input
      type="text"
      placeholder="Nome"
      value={nome}
      onChange={(e) => setNome(e.target.value)}
      className="border border-slate-300 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 text-slate-900"
    />

    <input
      type="text"
      placeholder="Código"
      value={cpf}
      onChange={(e) => setCpf(e.target.value)}
      className="border border-slate-300 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 text-slate-900"
    />

    <input
      type="text"
      placeholder="Cargo"
      value={cargo}
      onChange={(e) => setCargo(e.target.value)}
      className="border border-slate-300 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 text-slate-900"
    />

    <input
      type="text"
      placeholder="Empresa"
      value={empresa}
      onChange={(e) => setEmpresa(e.target.value)}
      className="border border-slate-300 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 text-slate-900"
    />

  </div>

  <button
    onClick={cadastrarFuncionario}
    className="mt-6 bg-indigo-600 hover:bg-indigo-500 transition px-8 py-4 rounded-2xl text-white font-semibold"
  >

    Cadastrar Funcionário

  </button>

</div>

{/* TABELA FUNCIONÁRIOS */}
<div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

  <div className="flex items-center justify-between mb-8">

    <h2 className="text-3xl font-bold text-slate-900">
      Funcionários Cadastrados
    </h2>

  </div>

  <table className="w-full">

    <thead>

      <tr className="border-b border-slate-200 text-slate-600 text-left text-lg">

        <th className="pb-5">
          Nome
        </th>

        <th className="pb-5">
          Código
        </th>

        <th className="pb-5">
          Cargo
        </th>

        <th className="pb-5">
          Empresa
        </th>

      </tr>

    </thead>

    <tbody>

      {

        funcionarios.map((funcionario, index) => (

          <tr
            key={index}
            className="border-b border-slate-100 hover:bg-slate-50 transition"
          >

            <td className="py-6">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  {funcionario.nome[0]}
                </div>

                <span className="font-semibold text-slate-800 text-xl">
                  {funcionario.nome}
                </span>

              </div>

            </td>

            <td className="text-slate-700 text-lg">
              {funcionario.cpf}
            </td>

            <td className="text-slate-700 text-lg">
              {funcionario.cargo}
            </td>

            <td className="text-slate-700 text-lg">
              {funcionario.empresa}
            </td>

          </tr>

        ))

      }

    </tbody>

  </table>

</div>

</>

)}

{/* REGISTROS */}
{pagina === 'registros' && (

<div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

  <div className="flex items-center justify-between mb-8">

    <div>

      <h2 className="text-4xl font-bold text-slate-900">
        Registros do dia
      </h2>

    </div>

    <label className="bg-indigo-600 hover:bg-indigo-500 transition px-7 py-4 rounded-2xl text-white font-semibold shadow-lg cursor-pointer">

      Importar CSV

      <input
        type="file"
        accept=".csv"
        onChange={importarCSV}
        hidden
      />

    </label>

  </div>

  <table className="w-full">

    <thead>

      <tr className="border-b border-slate-200 text-slate-600 text-left text-lg">

        <th className="pb-5">
          Nome
        </th>

        <th className="pb-5">
          Entrada
        </th>

        <th className="pb-5">
          Saída
        </th>

        <th className="pb-5">
          Status
        </th>

        <th className="pb-5 text-center">
          Ações
        </th>

      </tr>

    </thead>

    <tbody>

      {

        registros.map((registro, index) => (

          <tr
            key={index}
            className="border-b border-slate-100 hover:bg-slate-50 transition"
          >

            <td className="py-6">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  {registro.nome[0]}
                </div>

                <span className="font-semibold text-slate-800 text-xl">
                  {registro.nome}
                </span>

              </div>

            </td>

            <td className="text-slate-700 text-lg">
              {registro.entrada}
            </td>

            <td className="text-slate-700 text-lg">
              {registro.saida}
            </td>

            <td>

              <span className={`
                px-5 py-2 rounded-full text-sm font-semibold
                ${index % 2 === 0
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'}
              `}>

                {registro.status}

              </span>

            </td>

            <td className="text-center">

              <button
                onClick={() => excluirFuncionario(registro.id)}
                className="bg-red-500 hover:bg-red-400 transition p-3 rounded-xl text-white"
              >

                <Trash2 size={18} />

              </button>

            </td>

          </tr>

        ))

      }

    </tbody>

  </table>

</div>

)}    {/* TABELA */}
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

    <div className="flex items-center justify-between mb-8">

      <div>

        <h2 className="text-4xl font-bold text-slate-900">
          Funcionários - Registros do dia
        </h2>

      </div>

      <label className="bg-indigo-600 hover:bg-indigo-500 transition px-7 py-4 rounded-2xl text-white font-semibold shadow-lg cursor-pointer">

  Importar CSV

  <input
    type="file"
    accept=".csv"
    onChange={importarCSV}
    hidden
  />

</label>

    </div>

    <table className="w-full">

      <thead>

        <tr className="border-b border-slate-200 text-slate-600 text-left text-lg">

          <th className="pb-5">
            Nome
          </th>

          <th className="pb-5">
            Entrada
          </th>

          <th className="pb-5">
            Saída
          </th>

          <th className="pb-5">
            Status
          </th>

          <th className="pb-5 text-center">
          Ações
          </th>

        </tr>

      </thead>

      <tbody>

        {

          registros.map((registro, index) => (

            <tr
              key={index}
              className="border-b border-slate-100 hover:bg-slate-50 transition"
            >

              <td className="py-6">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {registro.nome[0]}
                  </div>

                  <span className="font-semibold text-slate-800 text-xl">
                    {registro.nome}
                  </span>

                </div>

              </td>

              <td className="text-slate-700 text-lg">
                {registro.entrada}
              </td>

              <td className="text-slate-700 text-lg">
                {registro.saida}
              </td>

              <td>

                <span className={`
                  px-5 py-2 rounded-full text-sm font-semibold
                  ${index % 2 === 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'}
                `}>

                  {registro.status}

                </span>

              </td>
<td className="text-center">
  

  <button
  onClick={() => {
    console.log(registro)
excluirFuncionario(registro.id)
}}
  className="bg-red-500 hover:bg-red-400 transition p-3 rounded-xl text-white"
>

  <Trash2 size={18} />

</button>

</td>
            </tr>

          ))

        }

      </tbody>

    </table>

  </div>

</main>
    </div>

  )

}