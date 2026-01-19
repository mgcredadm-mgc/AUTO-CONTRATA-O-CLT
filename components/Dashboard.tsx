import React from 'react';
import { TrendingUp, Users, DollarSign, Activity, FileText, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Seg', value: 4000 },
  { name: 'Ter', value: 3000 },
  { name: 'Qua', value: 2000 },
  { name: 'Qui', value: 2780 },
  { name: 'Sex', value: 1890 },
  { name: 'Sab', value: 2390 },
  { name: 'Dom', value: 3490 },
];

const Dashboard: React.FC = () => {
  const stats = [
    { 
      label: 'Volume Total (Mês)', 
      value: 'R$ 845.200', 
      change: '+12.5%', 
      isPositive: true,
      icon: DollarSign, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      label: 'Propostas Aprovadas', 
      value: '142', 
      change: '+8.2%', 
      isPositive: true,
      icon: FileText, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Taxa de Conversão IA', 
      value: '18.5%', 
      change: '-2.1%', 
      isPositive: false,
      icon: Activity, 
      color: 'text-violet-500', 
      bg: 'bg-violet-500/10' 
    },
    { 
      label: 'Leads em Atendimento', 
      value: '34', 
      change: '+4', 
      isPositive: true,
      icon: Users, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10' 
    },
  ];

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Dashboard</h1>
          <p className="text-text-muted mt-1">Visão geral da operação em tempo real.</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Sistema Operacional
            </span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
             <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.change}
                </div>
             </div>
             <div>
               <p className="text-text-muted text-sm font-medium">{stat.label}</p>
               <h3 className="text-2xl font-bold text-text mt-1">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Chart Section */}
         <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-text mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                Desempenho Semanal
            </h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                            itemStyle={{ color: 'var(--text)' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
         </div>

         {/* Activity Feed */}
         <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col">
            <h3 className="font-bold text-text mb-6 flex items-center gap-2">
                <Clock size={20} className="text-orange-500" />
                Atividade Recente
            </h3>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
               {[
                   { user: 'Carlos A.', action: 'Simulação realizada', time: '2 min atrás', type: 'info' },
                   { user: 'Maria O.', action: 'Solicitou humano', time: '15 min atrás', type: 'warning' },
                   { user: 'Roberto S.', action: 'Contrato assinado', time: '1h atrás', type: 'success' },
                   { user: 'Fernando L.', action: 'Documento pendente', time: '2h atrás', type: 'error' },
                   { user: 'System', action: 'Token C6 renovado', time: '3h atrás', type: 'system' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 items-start group">
                    <div className="relative mt-1">
                        <div className={`w-2 h-2 rounded-full ring-4 ring-surface group-hover:ring-surface-hover transition-all
                            ${item.type === 'success' ? 'bg-green-500' : 
                              item.type === 'warning' ? 'bg-yellow-500' :
                              item.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                            }`} 
                        />
                        {i !== 4 && <div className="absolute top-3 left-1 w-[1px] h-full bg-border -z-10"></div>}
                    </div>
                    <div className="flex-1 pb-4 border-b border-border/50 last:border-0">
                       <p className="text-sm text-text font-medium">{item.user}</p>
                       <p className="text-xs text-text-muted">{item.action}</p>
                    </div>
                    <span className="text-[10px] text-text-muted font-medium whitespace-nowrap">{item.time}</span>
                 </div>
               ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-primary hover:text-primary-dark font-medium border border-dashed border-border rounded-lg hover:bg-primary/5 transition-colors">
                Ver todo o histórico
            </button>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;