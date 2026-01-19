import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, CheckCircle2, User, Bot, AlertCircle, 
  Send, Paperclip, MoreVertical, Copy, ShieldCheck, 
  FileText, Play, Pause, ExternalLink, RefreshCw, MessageCircle, 
  Wrench, Smartphone, UserCheck, Mic, Trash2, StopCircle, File,
  AlertTriangle, Sparkles, Zap, Filter, ArrowRightLeft, Archive, Eraser
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Lead, Message, LeadStatus, C6AuthStatus } from '../types';
import { MOCK_LEADS, DEFAULT_AI_CONFIG } from '../constants';
import { c6Tools } from '../utils/geminiTools';
import { C6Service } from '../services/c6Service';
import { EvolutionService } from '../services/evolutionService';

interface InboxProps {
    theme: 'dark' | 'light';
}

// Extensão rápida para suportar tipos na renderização sem alterar o arquivo de tipos global
interface MessageWithAttachment extends Message {
    attachmentType?: 'audio' | 'file';
    attachmentUrl?: string;
    fileName?: string;
}

type FilterType = 'all' | 'ai' | 'human';

const Inbox: React.FC<InboxProps> = ({ theme }) => {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(MOCK_LEADS[0].id);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [toolExecutionStatus, setToolExecutionStatus] = useState<string | null>(null);
  
  // Estado do Menu Dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estados para Gravação de Áudio
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Ref para input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref para textarea auto-resize
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  // Filtra os leads baseado na aba selecionada
  const filteredLeads = leads.filter(lead => {
    if (filterType === 'all') return true;
    if (filterType === 'ai') return lead.status === 'ai_talking';
    if (filterType === 'human') return lead.status !== 'ai_talking'; // Considera tudo que não é IA como humano/outros
    return true;
  });

  useEffect(() => {
    scrollToBottom();
  }, [selectedLead.messages, isAiTyping, toolExecutionStatus]);

  // Auto-resize do textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [inputText]);

  useEffect(() => {
    if (selectedLead.status === 'human_intervention') {
      setAiEnabled(false);
    } else if (selectedLead.status === 'ai_talking') {
      setAiEnabled(true);
    }
    // Fecha o dropdown ao trocar de lead
    setShowDropdown(false);
  }, [selectedLeadId]);

  useEffect(() => {
    const lastMessage = selectedLead.messages[selectedLead.messages.length - 1];
    if (aiEnabled && lastMessage?.role === 'lead' && !isAiTyping) {
      callGemini(selectedLead.messages);
    }
  }, [selectedLead.messages, aiEnabled, selectedLeadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const updateC6Status = (leadId: string, c6Status: C6AuthStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, c6Status } : l));
  };

  // --- Ações do Menu Dropdown ---

  const handleTransferLead = () => {
      const targetAgent = window.prompt("Digite o nome do vendedor ou fila para transferência:", "Mesa de Crédito 02");
      if (targetAgent) {
          addMessageToState({
              id: Date.now().toString(),
              role: 'human_agent',
              isInternal: true,
              content: `🔄 Lead transferido para: ${targetAgent}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          setAiEnabled(false);
          updateLeadStatus(selectedLeadId, 'human_intervention');
          setShowDropdown(false);
          alert(`Lead transferido com sucesso para ${targetAgent}.`);
      }
  };

  const handleArchiveLead = () => {
      if(window.confirm("Deseja arquivar este atendimento? O lead será movido para 'Fechado'.")){
          updateLeadStatus(selectedLeadId, 'closed');
          setShowDropdown(false);
          // Opcional: Selecionar o próximo lead automaticamente
      }
  };

  const handleClearContext = () => {
      if(window.confirm("Isso apagará a memória de curto prazo da Eva para este cliente. Continuar?")){
           addMessageToState({
              id: Date.now().toString(),
              role: 'ai_agent',
              isInternal: true,
              content: `🧹 Contexto da IA limpo manualmente pelo operador.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          setShowDropdown(false);
          // Lógica real envolveria limpar o histórico enviado para a API do Gemini
      }
  };


  const callGemini = async (history: Message[]) => {
    setIsAiTyping(true);
    setToolExecutionStatus(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Filtra mensagens de sistema/áudio interno para não confundir o modelo
      const validMessages = history.filter(m => !m.isInternal).map(msg => ({
        role: msg.role === 'lead' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: validMessages,
        config: {
          systemInstruction: DEFAULT_AI_CONFIG.systemPrompt,
          temperature: 0.5,
          tools: [{ functionDeclarations: c6Tools }]
        }
      });

      const functionCalls = response.candidates?.[0]?.content?.parts?.[0]?.functionCall 
          ? [response.candidates[0].content.parts[0].functionCall] 
          : response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        setToolExecutionStatus(`Executando: ${call.name}...`);
        
        let toolResult = {};
        let shouldContinueAI = true;

        if (call.name === 'simular_consignado_c6') {
            const { cpf, valorSolicitado, parcelas } = call.args as any;
            toolResult = await C6Service.simulateConsignado(cpf, valorSolicitado, parcelas);
        } else if (call.name === 'gerar_link_formalizacao') {
            const { proposalNumber } = call.args as any;
            const link = await C6Service.getFormalizationLink(proposalNumber);
            toolResult = { url: link, status: "AGUARDANDO_ASSINATURA" };
        } else if (call.name === 'consultar_status_proposta') {
            toolResult = { status: "EM_ANALISE", description: "Proposta em análise na mesa de crédito." };
        } else if (call.name === 'transferir_para_humano') {
            shouldContinueAI = false;
            setAiEnabled(false);
            updateLeadStatus(selectedLeadId, 'human_intervention');
            toolResult = { status: "TRANSFERIDO", msg: "Humano notificado com sucesso." };
        }

        const toolResponseParts = [{
            functionResponse: {
                name: call.name,
                response: { result: toolResult }
            }
        }];
        
        setToolExecutionStatus("Eva está formulando a resposta...");
        
        const finalResponse = await ai.models.generateContent({
             model: 'gemini-3-flash-preview',
             contents: [
                ...validMessages,
                { role: 'model', parts: [{ functionCall: call }] },
                { role: 'user', parts: toolResponseParts }
             ],
             config: { systemInstruction: DEFAULT_AI_CONFIG.systemPrompt }
        });

        const finalText = finalResponse.text || "Processado.";
        addMessageToState({
            id: Date.now().toString(),
            role: 'ai_agent',
            content: finalText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        if (selectedLead.phoneNumber) {
            EvolutionService.sendMessage(selectedLead.phoneNumber, finalText);
        }

        if (!shouldContinueAI) {
           addMessageToState({
             id: Date.now().toString() + '_sys',
             role: 'ai_agent',
             isInternal: true,
             content: "⚠️ ATENDIMENTO TRANSFERIDO PARA HUMANO. EVA EM STANDBY.",
             timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
           });
        }
      } else {
        const aiText = response.text || "Desculpe, não entendi.";
        addMessageToState({
            id: Date.now().toString(),
            role: 'ai_agent',
            content: aiText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        if (selectedLead.phoneNumber) {
            EvolutionService.sendMessage(selectedLead.phoneNumber, aiText);
        }
      }
    } catch (error) {
      console.error("Erro na API Gemini:", error);
      addMessageToState({
        id: Date.now().toString(),
        role: 'ai_agent',
        isInternal: true,
        content: "⚠️ Erro de conexão com Eva ou Ferramenta C6.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsAiTyping(false);
      setToolExecutionStatus(null);
    }
  };

  const addMessageToState = (newMessage: MessageWithAttachment) => {
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.id === selectedLeadId) {
        return {
          ...lead,
          messages: [...lead.messages, newMessage],
          lastMessage: newMessage.isInternal ? lead.lastMessage : (newMessage.attachmentType ? `[${newMessage.attachmentType === 'audio' ? 'Áudio' : 'Arquivo'}]` : newMessage.content),
          lastActive: 'Agora'
        };
      }
      return lead;
    }));
  };

  // --- FUNÇÕES DE ARQUIVO E ÁUDIO ---

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Converte para Base64 para envio (simulado)
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        
        // Simular envio para Evolution API
        if (selectedLead.phoneNumber) {
            EvolutionService.sendMedia(selectedLead.phoneNumber, base64Content, file.name, file.type);
        }

        const newMessage: MessageWithAttachment = {
            id: Date.now().toString(),
            role: 'human_agent',
            content: `Arquivo enviado: ${file.name}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachmentType: 'file',
            fileName: file.name,
            attachmentUrl: URL.createObjectURL(file) // Para download local
        };

        addMessageToState(newMessage);
        if (selectedLead.status !== 'human_intervention') {
           updateLeadStatus(selectedLeadId, 'human_intervention');
        }
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingDuration(0);

        timerIntervalRef.current = window.setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);

    } catch (error) {
        console.error("Erro ao acessar microfone:", error);
        alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' }); // webm ou mp3
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Converte blob para base64 para envio
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const base64Content = base64String.split(',')[1];

                if (selectedLead.phoneNumber) {
                    EvolutionService.sendWhatsAppAudio(selectedLead.phoneNumber, base64Content);
                }
            };

            const newMessage: MessageWithAttachment = {
                id: Date.now().toString(),
                role: 'human_agent',
                content: 'Áudio enviado',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                attachmentType: 'audio',
                attachmentUrl: audioUrl
            };

            addMessageToState(newMessage);
            if (selectedLead.status !== 'human_intervention') {
                updateLeadStatus(selectedLeadId, 'human_intervention');
             }
        };

        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        audioChunksRef.current = [];
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendMessage = (role: 'human_agent' | 'lead' = 'human_agent') => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: role,
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessageToState(newMessage);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage('human_agent');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ai_talking':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ai/10 text-ai border border-ai/20 flex items-center gap-1"><Sparkles size={10} /> Eva (IA)</span>;
      case 'human_intervention':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-human/10 text-human border border-human/20 flex items-center gap-1"><UserCheck size={10} /> Humano</span>;
      case 'waiting_signature':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Assinatura</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">Fechado</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">Novo</span>;
    }
  };

  const RenderLeadList = () => (
    <div className="flex flex-col h-full border-r border-border bg-surface w-full md:w-80 lg:w-96 flex-shrink-0 z-10">
      <div className="p-4 border-b border-border bg-background">
        <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <MessageCircle size={20} className="text-primary" />
            Inbox
        </h2>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-text-muted w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar nome, CPF..." 
            className="w-full bg-surface-hover border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
          />
        </div>

        {/* Tabulação por Status de Atendimento */}
        <div className="flex gap-1 p-1 bg-surface-hover rounded-lg">
            <button 
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${filterType === 'all' ? 'bg-background text-text shadow-sm' : 'text-text-muted hover:text-text'}`}
            >
                Todos
            </button>
            <button 
                onClick={() => setFilterType('ai')}
                className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${filterType === 'ai' ? 'bg-ai/10 text-ai border border-ai/20 shadow-sm' : 'text-text-muted hover:text-ai'}`}
            >
                <Bot size={12} /> Eva (IA)
            </button>
            <button 
                onClick={() => setFilterType('human')}
                className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${filterType === 'human' ? 'bg-human/10 text-human border border-human/20 shadow-sm' : 'text-text-muted hover:text-human'}`}
            >
                <User size={12} /> Humano
            </button>
        </div>

      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredLeads.map(lead => {
          const isAi = lead.status === 'ai_talking';
          const isHuman = lead.status === 'human_intervention';
          
          return (
          <div 
            key={lead.id}
            onClick={() => setSelectedLeadId(lead.id)}
            className={`p-3 cursor-pointer hover:bg-surface-hover transition-all relative overflow-hidden ${selectedLeadId === lead.id ? 'bg-surface-hover' : ''}`}
          >
            {/* Visual Indicator Line */}
            {selectedLeadId === lead.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            )}
            
            <div className="flex items-start gap-3 pl-2">
              <div className="relative">
                <img src={lead.avatarUrl} alt={lead.name} className={`w-12 h-12 rounded-full object-cover ring-2 ${isAi ? 'ring-ai' : isHuman ? 'ring-human' : 'ring-border/50'}`} />
                
                {/* Ícone Distinto de Atendimento (Robô ou Humano) */}
                {isAi && (
                    <div className="absolute -bottom-1 -right-1 bg-ai text-background rounded-full p-1 border-2 border-surface animate-pulse-slow shadow-lg shadow-ai/30">
                        <Bot size={12} fill="currentColor" />
                    </div>
                )}
                {isHuman && (
                    <div className="absolute -bottom-1 -right-1 bg-human text-background rounded-full p-1 border-2 border-surface shadow-lg shadow-human/30">
                        <User size={12} fill="currentColor" />
                    </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className={`text-sm font-semibold truncate ${selectedLeadId === lead.id ? 'text-primary' : 'text-text'}`}>{lead.name}</h3>
                  <span className="text-[10px] text-text-muted">{lead.lastActive}</span>
                </div>
                
                <p className={`text-xs truncate mb-2 ${isAi ? 'text-ai/80' : 'text-text-muted'}`}>
                    {isAi && <span className="font-bold mr-1">Eva:</span>}
                    {lead.lastMessage}
                </p>
                
                {getStatusBadge(lead.status)}
              </div>
            </div>
          </div>
        )})}
        
        {filteredLeads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-text-muted p-4 text-center">
                <Filter size={32} className="mb-2 opacity-20" />
                <p className="text-sm">Nenhum atendimento encontrado neste filtro.</p>
            </div>
        )}
      </div>
    </div>
  );

  const RenderChatArea = () => (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={selectedLead.avatarUrl} alt="" className="w-9 h-9 rounded-full ring-2 ring-border" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface"></span>
          </div>
          <div>
            <h3 className="font-semibold text-text">{selectedLead.name}</h3>
            <span className="text-xs text-text-muted flex items-center gap-2">
                <span className="flex items-center gap-1"><Smartphone size={10}/> {selectedLead.phoneNumber}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
              onClick={() => {
                const newState = !aiEnabled;
                setAiEnabled(newState);
                updateLeadStatus(selectedLeadId, newState ? 'ai_talking' : 'human_intervention');
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                aiEnabled 
                  ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'bg-surface text-text-muted border-border hover:bg-surface-hover'
              }`}
           >
              {aiEnabled ? <Zap size={14} fill="currentColor" /> : <Pause size={14} />}
              {aiEnabled ? 'Eva Auto-Pilot' : 'Manual Mode'}
           </button>
           
           <div className="relative">
               {showDropdown && (
                   <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
               )}
               <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className={`p-2 rounded-full text-text-muted transition-colors relative z-50 ${showDropdown ? 'bg-primary/20 text-primary' : 'hover:bg-surface-hover'}`}
               >
                   <MoreVertical size={18} />
               </button>

               {/* Dropdown Menu */}
               {showDropdown && (
                   <div className="absolute right-0 top-12 w-56 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                       <div className="p-2 space-y-1">
                           <button 
                             onClick={handleTransferLead}
                             className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text hover:bg-surface-hover rounded-lg transition-colors group"
                           >
                               <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-md group-hover:bg-blue-500/20">
                                   <ArrowRightLeft size={16} />
                               </div>
                               <div className="text-left">
                                   <span className="block font-medium">Transferir Lead</span>
                                   <span className="block text-[10px] text-text-muted">Mover para outro vendedor</span>
                               </div>
                           </button>

                           <button 
                             onClick={handleArchiveLead}
                             className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text hover:bg-surface-hover rounded-lg transition-colors group"
                           >
                               <div className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-md group-hover:bg-yellow-500/20">
                                   <Archive size={16} />
                               </div>
                               <div className="text-left">
                                   <span className="block font-medium">Arquivar</span>
                                   <span className="block text-[10px] text-text-muted">Finalizar atendimento</span>
                               </div>
                           </button>
                       </div>
                       
                       <div className="h-px bg-border my-1 mx-2"></div>
                       
                       <div className="p-2">
                           <button 
                             onClick={handleClearContext}
                             className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
                           >
                               <div className="p-1.5 bg-red-500/10 text-red-500 rounded-md group-hover:bg-red-500/20">
                                   <Eraser size={16} />
                               </div>
                               <div className="text-left">
                                   <span className="block font-medium">Limpar Contexto</span>
                                   <span className="block text-[10px] opacity-70">Resetar memória da IA</span>
                               </div>
                           </button>
                       </div>
                   </div>
               )}
           </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-6 relative"
        style={{
          backgroundImage: theme === 'dark' 
            ? 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)' 
            : 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)'
        }}
      >
        {selectedLead.messages.map((msg: MessageWithAttachment) => {
          const isMe = msg.role !== 'lead';
          const isAi = msg.role === 'ai_agent';
          
          if (msg.isInternal) {
             return (
               <div key={msg.id} className="flex justify-center my-4">
                 <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-3 py-1 rounded-full border border-yellow-500/20 uppercase tracking-wide flex items-center gap-1">
                   <AlertTriangle size={10} /> {msg.content}
                 </span>
               </div>
             )
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] rounded-2xl p-4 text-sm shadow-sm relative leading-relaxed ${
                  !isMe 
                    ? 'bg-surface border border-border text-text rounded-tl-none' 
                    : isAi 
                      ? 'bg-primary/10 border border-primary/20 text-text rounded-tr-none' 
                      : 'bg-human/10 border border-human/20 text-text rounded-tr-none'
                }`}
              >
                {isMe && (
                   <span className={`absolute -top-3 right-0 text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${
                       isAi 
                       ? 'text-primary bg-background border-primary/30' 
                       : 'text-human bg-background border-human/30'
                   }`}>
                      {isAi ? <Bot size={8} /> : <User size={8} />}
                      {isAi ? 'EVA' : 'VOCÊ'}
                   </span>
                )}
                
                {/* Renderização Condicional do Conteúdo */}
                {msg.attachmentType === 'audio' ? (
                   <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                         <Play size={14} className="ml-1"/>
                      </div>
                      <div className="flex-1">
                         <div className="h-1 bg-border rounded-full w-full mb-1">
                            <div className="h-full w-1/3 bg-primary rounded-full"></div>
                         </div>
                         <span className="text-[10px] text-text-muted">Áudio gravado</span>
                      </div>
                   </div>
                ) : msg.attachmentType === 'file' ? (
                   <div className="flex items-center gap-3 bg-background/30 p-2 rounded-lg border border-border/50">
                      <div className="p-2 bg-background rounded-lg text-text-muted">
                         <File size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <p className="font-bold truncate text-xs">{msg.fileName}</p>
                         <p className="text-[10px] text-text-muted uppercase">Documento</p>
                      </div>
                      <a href={msg.attachmentUrl} download={msg.fileName} className="p-1.5 hover:bg-background rounded text-primary">
                         <ExternalLink size={14} />
                      </a>
                   </div>
                ) : (
                   <p className="whitespace-pre-line">{msg.content}</p>
                )}
                
                <span className="text-[10px] opacity-60 block text-right mt-2 text-text-muted">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}
        
        {isAiTyping && (
          <div className="flex justify-end">
             <div className="bg-primary/5 border border-primary/20 text-primary rounded-2xl rounded-tr-none p-3 text-xs flex items-center gap-2 animate-pulse">
                <RefreshCw size={12} className="animate-spin" />
                {toolExecutionStatus ? (
                   <span className="flex items-center gap-2 font-mono">
                     <Wrench size={12} /> {toolExecutionStatus}
                   </span>
                ) : (
                  "Eva está digitando..."
                )}
             </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface border-t border-border z-10">
        
        {/* Input Oculto para Arquivos */}
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
        />

        {isRecording ? (
            /* UI de Gravação */
            <div className="flex items-center gap-4 bg-background border border-red-500/30 rounded-xl p-2 px-4 shadow-sm animate-pulse-subtle">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="font-mono text-red-500 font-bold flex-1">{formatDuration(recordingDuration)}</span>
                
                <button 
                    onClick={handleCancelRecording}
                    className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Cancelar"
                >
                    <Trash2 size={20} />
                </button>
                
                <button 
                    onClick={handleStopRecording}
                    className="p-2 text-green-500 bg-green-500/10 hover:bg-green-500/20 rounded-full transition-colors"
                    title="Enviar Áudio"
                >
                    <Send size={20} />
                </button>
            </div>
        ) : (
            /* UI de Texto Normal */
            <div className="flex items-end gap-2 bg-background border border-border rounded-xl p-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-sm">
            <button 
                onClick={handleFileSelect}
                className="p-2 text-text-muted hover:text-text transition-colors"
                title="Anexar Arquivo"
            >
                <Paperclip size={20} />
            </button>
            <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={aiEnabled ? "Modo Automático Ativo. Intervir?" : "Digite uma mensagem..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-text text-sm resize-none max-h-32 py-2 placeholder:text-text-muted overflow-y-auto"
                rows={1}
                style={{ minHeight: '40px' }}
            />
            
            <button 
                onClick={handleStartRecording}
                className="p-2 text-text-muted hover:text-red-500 transition-colors"
                title="Gravar Áudio"
            >
                <Mic size={20} />
            </button>

            <button 
                onClick={() => handleSendMessage('human_agent')}
                title="Enviar como Agente Humano"
                className={`p-2 rounded-lg transition-all transform active:scale-95 ${
                    inputText.trim() 
                    ? 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20' 
                    : 'bg-surface-hover text-text-muted cursor-not-allowed'
                }`}
            >
                <Send size={18} />
            </button>
            </div>
        )}
        
        <div className="mt-2 flex justify-between items-center px-1">
            {aiEnabled ? (
                <span className="text-[10px] text-primary flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Eva está monitorando e respondendo automaticamente.
                </span>
            ) : (
                <span className="text-[10px] text-text-muted">Modo Manual: Controle humano assumido.</span>
            )}
        </div>
      </div>
    </div>
  );

  const RenderLeadContext = () => (
    <div className="w-80 border-l border-border bg-surface h-full flex flex-col overflow-y-auto flex-shrink-0 hidden xl:flex z-10">
      <div className="p-6 border-b border-border bg-background">
        <h3 className="font-bold text-text mb-4 flex items-center gap-2">
          <User size={18} className="text-primary" />
          Dados do Lead
        </h3>
        <div className="space-y-4">
          {[
              { label: 'Nome Completo', value: selectedLead.name, icon: User },
              { label: 'CPF', value: selectedLead.cpf, isCopy: true },
              { label: 'WhatsApp', value: selectedLead.phoneNumber, icon: Smartphone },
              { label: 'Data Nasc.', value: selectedLead.birthDate }
          ].map((field, idx) => (
             <div key={idx} className="group">
                <label className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1 block">{field.label}</label>
                <div className="flex gap-2">
                    <input 
                        defaultValue={field.value} 
                        className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all group-hover:border-primary/50" 
                    />
                    {field.isCopy && (
                        <button className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-lg text-text-muted hover:text-primary transition-colors">
                            <Copy size={14} />
                        </button>
                    )}
                </div>
             </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-b border-border bg-gradient-to-b from-surface to-background/50">
        <h3 className="font-bold text-text mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          Status C6 Consig
        </h3>
        
        <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
           <div className="flex justify-between items-center mb-4">
             <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Autorização</span>
             {selectedLead.c6Status === 'autorizado' && <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Autorizado</span>}
             {selectedLead.c6Status === 'pendente' && <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">Pendente</span>}
             {selectedLead.c6Status === 'link_gerado' && <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Link Enviado</span>}
             {selectedLead.c6Status === 'recusado' && <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Recusado</span>}
           </div>

           {selectedLead.c6Status === 'pendente' && (
              <button className="w-full py-2.5 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 group">
                <ExternalLink size={12} className="group-hover:scale-110 transition-transform" /> Gerar Link
              </button>
           )}

           {selectedLead.c6Status === 'link_gerado' && (
              <div className="space-y-3">
                 <div className="flex gap-2">
                    <input readOnly value={selectedLead.c6Link} className="flex-1 bg-surface text-[10px] text-text-muted p-2 rounded-lg border border-border font-mono" />
                    <button className="p-2 bg-surface hover:bg-surface-hover rounded-lg border border-border text-text-muted"><Copy size={12} /></button>
                 </div>
              </div>
           )}

           {selectedLead.c6Status === 'autorizado' && (
              <div className="text-center py-2 bg-surface/50 rounded-lg border border-border border-dashed">
                <p className="text-[10px] text-text-muted uppercase font-bold">Margem Livre</p>
                <p className="text-xl font-bold text-primary font-mono">R$ 1.450,30</p>
              </div>
           )}

           {selectedLead.c6Status === 'recusado' && (
               <div className="text-center py-3 bg-red-500/5 rounded-lg border border-red-500/20 border-dashed">
                 <AlertCircle size={20} className="mx-auto text-red-500 mb-2" />
                 <p className="text-[10px] text-red-500 font-bold uppercase">Operação Recusada</p>
               </div>
           )}
        </div>

        <div className="mt-6">
           <button 
             disabled={!selectedLead.proposalReady || selectedLead.c6Status === 'recusado'}
             className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg ${
               selectedLead.proposalReady && selectedLead.c6Status !== 'recusado'
                 ? 'bg-primary hover:bg-primary-dark text-white shadow-primary/20' 
                 : 'bg-surface text-text-muted cursor-not-allowed border border-border'
             }`}
           >
             <FileText size={16} />
             {selectedLead.proposalReady ? 'Formalizar Proposta' : 'Aguardando Consulta'}
           </button>
        </div>

        {/* Simulação de Status para Debug */}
        <div className="mt-8 pt-4 border-t border-border">
          <label className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1 mb-2">
             <Wrench size={10} /> Simulador (Debug)
          </label>
          <select
            value={selectedLead.c6Status}
            onChange={(e) => updateC6Status(selectedLead.id, e.target.value as C6AuthStatus)}
            className="w-full bg-surface border border-border rounded-lg text-xs p-2 text-text outline-none focus:border-primary"
          >
            <option value="pendente">Pendente</option>
            <option value="link_gerado">Link Gerado</option>
            <option value="autorizado">Autorizado</option>
            <option value="recusado">Recusado</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <RenderLeadList />
      <RenderChatArea />
      <RenderLeadContext />
    </div>
  );
};

export default Inbox;