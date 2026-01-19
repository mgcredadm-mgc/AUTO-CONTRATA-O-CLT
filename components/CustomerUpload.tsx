
import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Play, Trash2, CheckCircle2, AlertCircle, Loader2, Database, Users } from 'lucide-react';
import { UploadedLead } from '../types';

const CustomerUpload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<UploadedLead[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
        alert("Por favor, envie um arquivo CSV.");
        return;
    }
    setFile(file);
    parseCSV(file);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        // Assume row 0 is header, simplistic parsing
        const parsedData: UploadedLead[] = rows.slice(1).filter(r => r.trim() !== '').map((row, index) => {
            const cols = row.split(',');
            return {
                id: `import_${index}`,
                rowNumber: index + 1,
                name: cols[0] || 'Desconhecido',
                phone: cols[1] || '',
                cpf: cols[2] || '',
                status: 'pending'
            };
        });
        setData(parsedData);
    };
    reader.readAsText(file);
  };

  const startProcessing = async () => {
      setIsProcessing(true);
      setProcessProgress(0);

      const total = data.length;
      for (let i = 0; i < total; i++) {
          // Simula processamento / envio de mensagem
          await new Promise(resolve => setTimeout(resolve, 800)); // Delay simulado
          
          setData(prev => {
              const newData = [...prev];
              // Simula erro aleatório em 10% dos casos
              const status = Math.random() > 0.9 ? 'error' : 'completed';
              newData[i] = { ...newData[i], status };
              return newData;
          });
          
          setProcessProgress(Math.round(((i + 1) / total) * 100));
      }
      setIsProcessing(false);
  };

  const clearFile = () => {
      setFile(null);
      setData([]);
      setProcessProgress(0);
      setIsProcessing(false);
      if(inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2 tracking-tight flex items-center gap-2">
            <Database className="text-primary" /> Base de Clientes
        </h1>
        <p className="text-text-muted">Importe listas CSV para disparos em massa e qualificação automática.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Área de Upload */}
         <div className="lg:col-span-1 space-y-6">
             <div 
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all h-64 ${
                    dragActive 
                    ? 'border-primary bg-primary/5' 
                    : file 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : 'border-border bg-surface hover:bg-surface-hover'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
             >
                <input 
                    ref={inputRef}
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleChange}
                    accept=".csv"
                    disabled={isProcessing}
                />
                
                {file ? (
                    <div className="animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                            <FileSpreadsheet size={32} />
                        </div>
                        <p className="font-bold text-text truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                ) : (
                    <div>
                        <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                            <UploadCloud size={32} />
                        </div>
                        <p className="font-bold text-text">Arraste seu CSV aqui</p>
                        <p className="text-xs text-text-muted mt-2">ou clique para buscar</p>
                        <p className="text-[10px] text-text-muted mt-4 border border-dashed border-border px-2 py-1 rounded">
                            Formato: Nome, Telefone, CPF
                        </p>
                    </div>
                )}
             </div>

             {file && (
                 <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-text flex items-center gap-2">
                            <Users size={18} /> Resumo da Base
                        </h3>
                        {isProcessing && <span className="text-xs font-mono text-primary">{processProgress}%</span>}
                     </div>
                     <div className="space-y-3 text-sm">
                         <div className="flex justify-between">
                             <span className="text-text-muted">Total de Contatos:</span>
                             <span className="font-bold text-text">{data.length}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-text-muted">Processados:</span>
                             <span className="font-bold text-text">
                                 {data.filter(i => i.status !== 'pending').length}
                             </span>
                         </div>
                         <div className="flex justify-between text-green-500">
                             <span>Sucesso:</span>
                             <span className="font-bold">{data.filter(i => i.status === 'completed').length}</span>
                         </div>
                         <div className="flex justify-between text-red-500">
                             <span>Falhas:</span>
                             <span className="font-bold">{data.filter(i => i.status === 'error').length}</span>
                         </div>
                     </div>

                     <div className="mt-6 flex gap-3">
                         <button 
                             onClick={clearFile}
                             disabled={isProcessing}
                             className="flex-1 py-2.5 border border-border rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/5 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                         >
                             <Trash2 size={16} /> Limpar
                         </button>
                         <button 
                             onClick={startProcessing}
                             disabled={isProcessing || data.length === 0}
                             className="flex-[2] py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                             {isProcessing ? 'Processando...' : 'Iniciar Disparos'}
                         </button>
                     </div>
                 </div>
             )}
         </div>

         {/* Tabela de Prévia */}
         <div className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
             <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center">
                 <h3 className="font-bold text-text text-sm uppercase tracking-wide">Prévia dos Dados</h3>
                 {data.length > 0 && (
                     <span className="text-xs text-text-muted">Mostrando {data.length} linhas</span>
                 )}
             </div>
             
             <div className="flex-1 overflow-auto">
                 <table className="w-full text-left border-collapse text-sm">
                     <thead className="bg-background sticky top-0 z-10">
                         <tr>
                             <th className="p-4 border-b border-border font-medium text-text-muted w-16">#</th>
                             <th className="p-4 border-b border-border font-medium text-text-muted">Nome</th>
                             <th className="p-4 border-b border-border font-medium text-text-muted">Telefone</th>
                             <th className="p-4 border-b border-border font-medium text-text-muted">CPF</th>
                             <th className="p-4 border-b border-border font-medium text-text-muted text-right">Status</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-border">
                         {data.length === 0 ? (
                             <tr>
                                 <td colSpan={5} className="p-12 text-center text-text-muted">
                                     Nenhum arquivo carregado. Faça o upload para visualizar.
                                 </td>
                             </tr>
                         ) : (
                             data.map((row) => (
                                 <tr key={row.id} className="hover:bg-surface-hover transition-colors">
                                     <td className="p-4 text-text-muted font-mono text-xs">{row.rowNumber}</td>
                                     <td className="p-4 font-medium text-text">{row.name}</td>
                                     <td className="p-4 text-text-muted">{row.phone}</td>
                                     <td className="p-4 text-text-muted font-mono">{row.cpf}</td>
                                     <td className="p-4 text-right">
                                         {row.status === 'pending' && <span className="px-2 py-1 bg-surface border border-border rounded text-xs text-text-muted">Pendente</span>}
                                         {row.status === 'processing' && <span className="px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded text-xs animate-pulse">Enviando...</span>}
                                         {row.status === 'completed' && <span className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-xs flex items-center gap-1 justify-end ml-auto w-fit"><CheckCircle2 size={12}/> Enviado</span>}
                                         {row.status === 'error' && <span className="px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs flex items-center gap-1 justify-end ml-auto w-fit"><AlertCircle size={12}/> Erro</span>}
                                     </td>
                                 </tr>
                             ))
                         )}
                     </tbody>
                 </table>
             </div>
         </div>
      </div>
    </div>
  );
};

export default CustomerUpload;