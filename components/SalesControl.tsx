
import React, { useState } from 'react';
import { 
  DollarSign, Search, Filter, Plus, Calendar, 
  CheckCircle, AlertCircle, Clock, XCircle, 
  MoreVertical, FileText, Wallet, ArrowUpRight 
} from 'lucide-react';
import { Sale, SaleStatus, PaymentMethod } from '../types';
import { MOCK_SALES } from '../constants';

const SalesControl: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newSale, setNewSale] = useState<Partial<Sale>>({
    clientName: '',
    cpf: '',
    product: '',
    value: 0,
    status: 'pending',
    paymentMethod: 'consignado_c6',
    date: new Date().toISOString().split('T')[0]
  });

  const filteredSales = sales.filter(sale => {
    const matchesStatus = filterStatus === 'all' || sale.status === filterStatus;
    const matchesSearch = sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (sale.cpf && sale.cpf.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const totalValue = sales.reduce((acc, curr) => curr.status === 'paid' ? acc + curr.value : acc, 0);
  const pendingValue = sales.reduce((acc, curr) => curr.status === 'pending' || curr.status === 'processing' ? acc + curr.value : acc, 0);
  const totalSalesCount = sales.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status: SaleStatus) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1 w-fit"><CheckCircle size={12}/> Pago</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1 w-fit"><Clock size={12}/> Pendente</span>;
      case 'processing':
        return <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1 w-fit"><Clock size={12}/> Processando</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1 w-fit"><XCircle size={12}/> Cancelado</span>;
    }
  };

  const handleAddSale = () => {
    if (!newSale.clientName || !newSale.value || !newSale.product) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const saleToAdd: Sale = {
      id: Date.now().toString(),
      clientName: newSale.clientName!,
      cpf: newSale.cpf || '',
      product: newSale.product!,
      value: Number(newSale.value),
      date: newSale.date || new Date().toISOString().split('T')[0],
      status: newSale.status as SaleStatus || 'pending',
      paymentMethod: newSale.paymentMethod as PaymentMethod || 'consignado_c6',
      notes: newSale.notes
    };

    setSales([saleToAdd, ...sales]);
    setShowAddModal(false);
    setNewSale({
        clientName: '',
        cpf: '',
        product: '',
        value: 0,
        status: 'pending',
        paymentMethod: 'consignado_c6',
        date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">Controle de Vendas</h1>
          <p className="text-text-muted">Gerencie contratos, pagamentos e status financeiro.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all transform active:scale-95"
        >
          <Plus size={18} /> Nova Venda
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
           <div className="flex justify-between items-start mb-2">
             <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
               <Wallet size={24} />
             </div>
             <span className="text-xs font-bold text-green-500 flex items-center gap-1 bg-green-500/5 px-2 py-1 rounded-full">
               <ArrowUpRight size={12}/> Total Realizado
             </span>
           </div>
           <p className="text-text-muted text-sm font-medium">Receita Confirmada (Pago)</p>
           <h3 className="text-3xl font-bold text-text mt-1">{formatCurrency(totalValue)}</h3>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
           <div className="flex justify-between items-start mb-2">
             <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-500">
               <Clock size={24} />
             </div>
             <span className="text-xs font-bold text-text-muted bg-surface-hover px-2 py-1 rounded-full border border-border">
               Em Esteira
             </span>
           </div>
           <p className="text-text-muted text-sm font-medium">Previsão (Pendente/Proc.)</p>
           <h3 className="text-3xl font-bold text-text mt-1">{formatCurrency(pendingValue)}</h3>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
           <div className="flex justify-between items-start mb-2">
             <div className="p-3 rounded-lg bg-primary/10 text-primary">
               <FileText size={24} />
             </div>
           </div>
           <p className="text-text-muted text-sm font-medium">Contratos Totais</p>
           <h3 className="text-3xl font-bold text-text mt-1">{totalSalesCount}</h3>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-text-muted w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar cliente, produto ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {['all', 'paid', 'pending', 'processing', 'cancelled'].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                        filterStatus === status 
                        ? 'bg-primary text-white shadow-md shadow-primary/20' 
                        : 'bg-background border border-border text-text-muted hover:text-text hover:bg-surface-hover'
                    }`}
                >
                    {status === 'all' ? 'Todos' : status}
                </button>
            ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-border bg-background/50 text-xs text-text-muted uppercase tracking-wider">
                        <th className="p-4 font-bold">Cliente</th>
                        <th className="p-4 font-bold">Produto/Serviço</th>
                        <th className="p-4 font-bold">Data</th>
                        <th className="p-4 font-bold">Valor</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-surface-hover transition-colors group">
                            <td className="p-4">
                                <div className="font-bold text-text text-sm">{sale.clientName}</div>
                                <div className="text-xs text-text-muted">{sale.cpf || 'CPF N/D'}</div>
                            </td>
                            <td className="p-4">
                                <span className="text-sm text-text bg-background border border-border px-2 py-1 rounded">
                                    {sale.product}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-text-muted flex items-center gap-2">
                                <Calendar size={14} /> {new Date(sale.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-4 text-sm font-bold text-text font-mono">
                                {formatCurrency(sale.value)}
                            </td>
                            <td className="p-4">
                                {getStatusBadge(sale.status)}
                            </td>
                            <td className="p-4">
                                <button className="p-2 hover:bg-background rounded-lg text-text-muted hover:text-primary transition-colors">
                                    <MoreVertical size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredSales.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-text-muted">
                                Nenhum registro encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Add Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text">Nova Venda</h2>
                    <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-red-500 transition-colors">
                        <XCircle size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-bold text-text mb-1">Nome do Cliente *</label>
                        <input 
                            type="text" 
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none"
                            value={newSale.clientName}
                            onChange={(e) => setNewSale({...newSale, clientName: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-bold text-text mb-1">CPF</label>
                            <input 
                                type="text" 
                                className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none"
                                value={newSale.cpf}
                                onChange={(e) => setNewSale({...newSale, cpf: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text mb-1">Data</label>
                            <input 
                                type="date" 
                                className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none"
                                value={newSale.date}
                                onChange={(e) => setNewSale({...newSale, date: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text mb-1">Produto / Serviço *</label>
                        <input 
                            type="text" 
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none"
                            value={newSale.product}
                            onChange={(e) => setNewSale({...newSale, product: e.target.value})}
                            placeholder="Ex: Consignado INSS"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text mb-1">Valor (R$) *</label>
                        <input 
                            type="number" 
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none"
                            value={newSale.value}
                            onChange={(e) => setNewSale({...newSale, value: parseFloat(e.target.value)})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text mb-1">Status</label>
                            <select 
                                className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none"
                                value={newSale.status}
                                onChange={(e) => setNewSale({...newSale, status: e.target.value as SaleStatus})}
                            >
                                <option value="pending">Pendente</option>
                                <option value="paid">Pago</option>
                                <option value="processing">Processando</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text mb-1">Método</label>
                            <select 
                                className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none"
                                value={newSale.paymentMethod}
                                onChange={(e) => setNewSale({...newSale, paymentMethod: e.target.value as PaymentMethod})}
                            >
                                <option value="consignado_c6">Consignado C6</option>
                                <option value="pix">PIX</option>
                                <option value="credit_card">Cartão de Crédito</option>
                                <option value="boleto">Boleto</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text mb-1">Notas</label>
                        <textarea 
                            className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none h-20 resize-none"
                            value={newSale.notes}
                            onChange={(e) => setNewSale({...newSale, notes: e.target.value})}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-border flex justify-end gap-3">
                    <button 
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 rounded-lg border border-border text-text hover:bg-surface-hover transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleAddSale}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all font-bold"
                    >
                        Salvar Venda
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default SalesControl;