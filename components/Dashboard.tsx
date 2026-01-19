
import React, { useMemo } from 'react';
import { 
  ArrowUpRight, MoreHorizontal, TrendingUp, 
  Users, MessageSquare, AlertCircle, Wallet, 
  FileCheck, XCircle, Search, Filter, BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell 
} from 'recharts';
import { MOCK_LEADS, MOCK_SALES, MOCK_TEMPLATES } from '../constants';

const Dashboard: React.FC = () => {

  // --- CÁLCULO DE MÉTRICAS (Funcional baseado nos Mocks) ---
  
  const metrics = useMemo(() => {
    // 1. Vendas Totais (Pagas)
    const totalSales = MOCK_SALES
      .filter(s => s.status === 'paid')
      .reduce((acc, curr) => acc + curr.value, 0);

    // 2. Leads que responderam (Interação Humana)
    const respondedLeads = MOCK_LEADS.filter(lead => 
      lead.messages.some(msg => msg.role === 'lead')
    ).length;

    // 3. Leads sem resposta (Apenas IA falou)
    const noReplyLeads = MOCK_LEADS.length - respondedLeads;

    // 4. Pararam na Simulação (Link gerado/Autorizado mas não fechado)
    const stoppedAtSimulation = MOCK_LEADS.filter(lead => 
      (lead.c6Status === 'link_gerado' || lead.c6Status === 'autorizado') && 
      lead.status !== 'closed'
    ).length;

    return {
      totalSales,
      respondedLeads,
      noReplyLeads,
      stoppedAtSimulation,
      totalLeads: MOCK_LEADS.length
    };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Dados para o Gráfico de Funil (Simulado para visual, mas com labels reais)
  const funnelData = [
    { name: 'Novos Leads', value: 120 },
    { name: 'Responderam', value: 85 },
    { name: 'Simulação C6', value: 45 },
    { name: 'Proposta Aceita', value: 20 },
    { name: 'Pago', value: 12 },
  ];

  // Dados para Performance de Templates
  const templatePerformance = [
    { name: 'Saudação Inicial', conversao: 65, envios: 150 },
    { name: 'Oferta Relâmpago', conversao: 40, envios: 80 },
    { name: 'Aviso Portabilidade', conversao: 25, envios: 200 },
    { name: 'Cobrança Suave', conversao: 15, envios: 50 },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      
      {/* Conteúdo Principal (Full Width) */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-1">
                    <span>Visão Geral</span>
                    <span className="w-1 h-1 rounded-full bg-text-muted"></span>
                    <span>Performance Comercial</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">Dashboard de Vendas</h1>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-text">Outubro, 2023</span>
                    <span className="text-[10px] text-text-muted">Atualizado agora</span>
                </div>
                <button className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text hover:bg-surface-hover transition-colors shadow-sm">
                    <Filter size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                    <ArrowUpRight size={18} />
                </button>
            </div>
        </div>

        {/* --- CARDS DE MÉTRICAS PRINCIPAIS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            {/* 1. Vendas Pagas (Azul) */}
            <div className="bg-accent-blue rounded-[24px] p-6 text-white relative overflow-hidden shadow-lg group hover:scale-[1.02] transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Wallet size={20} className="text-white" />
                    </div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">+12% meta</span>
                </div>
                <div className="mb-2">
                    <h3 className="text-sm font-medium opacity-90">Vendas Confirmadas</h3>
                    <span className="text-3xl font-bold">{formatCurrency(metrics.totalSales)}</span>
                </div>
                <p className="text-[10px] opacity-70">Contratos pagos e averbados este mês.</p>
                
                {/* Decoration */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            </div>

            {/* 2. Taxa de Resposta (Ciano) */}
            <div className="bg-accent-cyan rounded-[24px] p-6 text-white relative overflow-hidden shadow-lg group hover:scale-[1.02] transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-black/10 rounded-xl backdrop-blur-sm">
                        <MessageSquare size={20} className="text-white" />
                    </div>
                    <button className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
                <div className="mb-2">
                    <h3 className="text-sm font-medium opacity-90">Clientes Responderam</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{metrics.respondedLeads}</span>
                        <span className="text-sm opacity-80">/ {metrics.totalLeads}</span>
                    </div>
                </div>
                <div className="w-full bg-black/20 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                        className="bg-white h-full rounded-full" 
                        style={{ width: `${(metrics.respondedLeads / metrics.totalLeads) * 100}%` }}
                    ></div>
                </div>
                <p className="text-[10px] opacity-70 mt-2">Engajamento com IA ou Humano.</p>
            </div>

            {/* 3. Pararam na Simulação (Amarelo) */}
            <div className="bg-accent-yellow rounded-[24px] p-6 text-black relative overflow-hidden shadow-lg group hover:scale-[1.02] transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-black/5 rounded-xl">
                        <FileCheck size={20} className="text-black" />
                    </div>
                    <span className="text-xs font-bold bg-black/10 px-2 py-1 rounded-lg text-black">Atenção</span>
                </div>
                <div className="mb-2">
                    <h3 className="text-sm font-bold opacity-80">Pararam na Simulação</h3>
                    <span className="text-3xl font-bold">{metrics.stoppedAtSimulation}</span>
                </div>
                <p className="text-[10px] font-medium opacity-70">Clientes com link gerado mas sem assinatura.</p>
                <button className="mt-3 w-full py-2 bg-black/10 hover:bg-black/20 rounded-lg text-xs font-bold transition-colors">
                    Ver Lista de Repescagem
                </button>
            </div>

            {/* 4. Sem Resposta (Preto/Dark) */}
            <div className="bg-accent-black rounded-[24px] p-6 text-white relative overflow-hidden shadow-lg group hover:scale-[1.02] transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/10 rounded-xl">
                        <XCircle size={20} className="text-red-400" />
                    </div>
                    <ArrowUpRight size={16} className="text-gray-400" />
                </div>
                <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-400">Sem Interação</h3>
                    <span className="text-3xl font-bold">{metrics.noReplyLeads}</span>
                </div>
                <p className="text-[10px] text-gray-500">Leads frios ou número inválido.</p>
                <div className="mt-3 flex gap-1">
                     <span className="w-2 h-2 rounded-full bg-red-500"></span>
                     <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                     <span className="w-2 h-2 rounded-full bg-red-500/20"></span>
                </div>
            </div>
        </div>

        {/* --- SEÇÃO DE GRÁFICOS E TEMPLATES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Funil de Vendas */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-[24px] p-6 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-text flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" />
                            Funil de Conversão
                        </h2>
                        <p className="text-xs text-text-muted">Acompanhamento do Lead até o Pagamento</p>
                    </div>
                    <div className="flex gap-2 text-xs font-bold bg-surface-hover rounded-full p-1">
                        <span className="px-3 py-1 rounded-full bg-background shadow-sm text-text">Quantidade</span>
                        <span className="px-3 py-1 text-text-muted hover:text-text cursor-pointer">Valor</span>
                    </div>
                </div>

                <div className="flex-1 min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={funnelData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2B5CE6" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#2B5CE6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                cursor={{ stroke: '#2B5CE6', strokeWidth: 1 }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#2B5CE6" strokeWidth={3} fillOpacity={1} fill="url(#colorFunnel)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Performance dos Templates */}
            <div className="bg-surface border border-border rounded-[24px] p-6 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-text">Melhores Templates</h2>
                    <button className="text-xs font-bold text-primary hover:text-primary-dark">Ver Todos</button>
                </div>

                <div className="space-y-5">
                    {templatePerformance.map((tpl, index) => (
                        <div key={index} className="group">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-medium text-text group-hover:text-primary transition-colors">{tpl.name}</span>
                                <span className="text-xs font-bold text-text">{tpl.conversao}% Conv.</span>
                            </div>
                            <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        index === 0 ? 'bg-green-500' : 
                                        index === 1 ? 'bg-accent-blue' : 
                                        index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                                    }`}
                                    style={{ width: `${tpl.conversao}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-text-muted">{tpl.envios} envios</span>
                                {index === 0 && <span className="text-[10px] text-green-600 font-bold flex items-center gap-1"><ArrowUpRight size={10} /> Top Performance</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-4 border-t border-border">
                    <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                        <AlertCircle size={20} className="text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-text-muted">
                            <strong className="text-blue-500">Dica da Eva:</strong> O template "Saudação Inicial" tem 25% mais resposta pela manhã.
                        </p>
                    </div>
                </div>
            </div>

        </div>

        {/* --- ÚLTIMAS ATIVIDADES --- */}
        <div className="bg-surface border border-border rounded-[24px] p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Atividade Recente</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-text-muted uppercase tracking-wider border-b border-border">
                            <th className="pb-3 font-medium pl-2">Cliente</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Última Ação</th>
                            <th className="pb-3 font-medium text-right pr-2">Valor Estimado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {MOCK_LEADS.slice(0, 5).map(lead => (
                            <tr key={lead.id} className="group hover:bg-surface-hover transition-colors">
                                <td className="py-3 pl-2">
                                    <div className="flex items-center gap-3">
                                        <img src={lead.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                                        <div>
                                            <p className="text-sm font-bold text-text">{lead.name}</p>
                                            <p className="text-[10px] text-text-muted">CPF: {lead.cpf}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3">
                                    {lead.status === 'ai_talking' && <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-bold border border-blue-500/20">Em Negociação (IA)</span>}
                                    {lead.status === 'waiting_signature' && <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs font-bold border border-yellow-500/20">Aguardando Assinatura</span>}
                                    {lead.status === 'human_intervention' && <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs font-bold border border-purple-500/20">Atendimento Humano</span>}
                                </td>
                                <td className="py-3 text-sm text-text-muted">
                                    {lead.lastMessage.length > 30 ? lead.lastMessage.substring(0, 30) + '...' : lead.lastMessage}
                                </td>
                                <td className="py-3 text-right font-mono font-bold text-text pr-2">
                                    R$ 12.450,00
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
