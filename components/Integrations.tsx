import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, KeyRound, ShieldAlert, CheckCircle, Smartphone, Wifi, WifiOff, UserPlus, Users, QrCode, Server, RefreshCw, Loader2, MonitorSmartphone, Trash2, Edit3 } from 'lucide-react';
import { EvolutionService } from '../services/evolutionService';
import { C6Service } from '../services/c6Service';
import { EvolutionConfig, IntegrationsConfig, WhatsappConnectionMode } from '../types';

const Integrations: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingC6, setIsLoadingC6] = useState(false);
  const [c6TokenStatus, setC6TokenStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // WhatsApp Config State
  const [evoConfig, setEvoConfig] = useState<EvolutionConfig>({
    mode: 'api',
    baseUrl: 'https://api.seudominio.com',
    apiKey: '',
    instanceName: 'consig_crm_01',
    webConnected: false,
    webSessionName: 'Atendimento Principal'
  });
  
  const [evoStatus, setEvoStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [showEvoKey, setShowEvoKey] = useState(false);
  
  // QR Code Logic State
  const [qrStatus, setQrStatus] = useState<'idle' | 'generating' | 'ready' | 'scanned' | 'success'>('idle');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // C6 Config State
  const [c6Config, setC6Config] = useState<IntegrationsConfig>({
    profileName: '',
    clientUser: '40913785873_000224',
    password: 'MGc@auth26',
    promoterCode: '000224',
    typistCode: '305337',
    certifiedAgentCpf: '40913785873'
  });

  // Saved Profiles State
  const [savedProfiles, setSavedProfiles] = useState<IntegrationsConfig[]>([]);
  const [activeProfileIndex, setActiveProfileIndex] = useState<number | null>(null); // Rastreia qual perfil está sendo editado
  const [showSaveProfile, setShowSaveProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    // Load Evolution Config
    const storedEvo = localStorage.getItem('evolution_config');
    if (storedEvo) {
      const parsed = JSON.parse(storedEvo);
      setEvoConfig(parsed);
      
      // Se estiver no modo web e conectado, atualizar status visual
      if (parsed.mode === 'web' && parsed.webConnected) {
          setEvoStatus('connected');
      } else if (parsed.mode === 'api') {
          checkEvoConnection(parsed);
      } else {
          setEvoStatus('disconnected');
      }
    } else {
        setEvoStatus('disconnected');
    }

    // Load C6 Active Config
    const storedC6 = C6Service.getConfig();
    if (storedC6) {
      setC6Config(storedC6);
    }

    // Load Saved Profiles
    const profiles = localStorage.getItem('c6_profiles');
    if (profiles) {
      setSavedProfiles(JSON.parse(profiles));
    }
  }, []);

  // --- Funções C6 ---

  const handleTestTokenC6 = async () => {
    setIsLoadingC6(true);
    setC6TokenStatus('idle');
    C6Service.saveConfig(c6Config);
    const token = await C6Service.authenticate();
    setIsLoadingC6(false);
    setC6TokenStatus(token ? 'success' : 'error');
  };

  const handleSaveC6Config = () => {
    // 1. Salva como configuração ativa (Sessão atual)
    C6Service.saveConfig(c6Config);
    setC6TokenStatus('idle');

    // 2. Se estiver editando um perfil existente, atualiza ele também
    if (activeProfileIndex !== null) {
        const updatedProfiles = [...savedProfiles];
        updatedProfiles[activeProfileIndex] = { ...c6Config }; // Atualiza dados
        setSavedProfiles(updatedProfiles);
        localStorage.setItem('c6_profiles', JSON.stringify(updatedProfiles));
        alert(`Credenciais ativas e Perfil "${c6Config.profileName}" atualizados!`);
    } else {
        alert('Credenciais ativas salvas!');
    }
  };

  const handleSaveAsNewProfile = () => {
    // Define nome padrão se vazio
    const nameToSave = newProfileName.trim() || c6Config.clientUser || `Perfil ${savedProfiles.length + 1}`;
    
    const newProfile = { ...c6Config, profileName: nameToSave };
    const updatedProfiles = [...savedProfiles, newProfile];
    
    setSavedProfiles(updatedProfiles);
    localStorage.setItem('c6_profiles', JSON.stringify(updatedProfiles));
    
    setNewProfileName('');
    setShowSaveProfile(false);
    
    // Torna o novo perfil o ativo
    setC6Config(newProfile);
    setActiveProfileIndex(updatedProfiles.length - 1);
    C6Service.saveConfig(newProfile);
  };

  const loadProfile = (index: number) => {
      const profile = savedProfiles[index];
      setC6Config(profile);
      setActiveProfileIndex(index); // Marca como perfil ativo para edição
      C6Service.saveConfig(profile);
  };

  const deleteProfile = (index: number, e: React.MouseEvent) => {
      e.stopPropagation(); // Evita carregar o perfil ao clicar em deletar
      if(window.confirm("Tem certeza que deseja remover este usuário salvo?")) {
          const updatedProfiles = savedProfiles.filter((_, i) => i !== index);
          setSavedProfiles(updatedProfiles);
          localStorage.setItem('c6_profiles', JSON.stringify(updatedProfiles));
          
          if (activeProfileIndex === index) {
              setActiveProfileIndex(null); // Desmarca se deletou o ativo
              setC6Config({...c6Config, profileName: ''}); // Limpa nome visualmente
          } else if (activeProfileIndex !== null && index < activeProfileIndex) {
              setActiveProfileIndex(activeProfileIndex - 1); // Ajusta índice
          }
      }
  }

  // --- Funções WhatsApp ---

  const handleSaveWhatsApp = () => {
    localStorage.setItem('evolution_config', JSON.stringify(evoConfig));
    if (evoConfig.mode === 'api') {
        checkEvoConnection(evoConfig);
    }
  };

  const checkEvoConnection = async (config = evoConfig) => {
    setEvoStatus('checking');
    const result = await EvolutionService.checkConnection();
    setEvoStatus((result.status === 'open' || result.status === 'connected') ? 'connected' : 'disconnected');
  };

  const generateQrCode = () => {
    setQrStatus('generating');
    // Simula delay de geração
    setTimeout(() => {
        // Gera um QR code aleatório via API pública para demo
        const randomHash = Math.random().toString(36).substring(7);
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=WHATSAPP_LOGIN_${randomHash}`);
        setQrStatus('ready');
        
        // Simula o usuario escaneando após 5 segundos
        simulateScanning();
    }, 1500);
  };

  const simulateScanning = () => {
      // Este timeout simula o tempo que o usuário leva para pegar o celular e escanear
      // Em uma app real, isso seria via WebSocket event
      setTimeout(() => {
          if (qrStatus !== 'success') {
            setQrStatus('scanned');
            setTimeout(() => {
                setQrStatus('success');
                setEvoStatus('connected');
                const newConfig = { ...evoConfig, webConnected: true };
                setEvoConfig(newConfig);
                localStorage.setItem('evolution_config', JSON.stringify(newConfig));
            }, 2000); // Tempo para "conectar" após scan
          }
      }, 8000);
  };

  const disconnectWeb = () => {
      setEvoStatus('disconnected');
      setQrStatus('idle');
      const newConfig = { ...evoConfig, webConnected: false };
      setEvoConfig(newConfig);
      localStorage.setItem('evolution_config', JSON.stringify(newConfig));
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">Integrações & APIs</h1>
        <p className="text-text-muted">Gerencie as conexões seguras com Bancos e canais de comunicação.</p>
      </div>

      {/* --- WHATSAPP INTEGRATION --- */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden mb-8 shadow-sm">
        <div className="p-6 border-b border-border bg-gradient-to-r from-surface to-background flex justify-between items-center">
           <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors ${evoStatus === 'connected' ? 'bg-green-600 shadow-green-900/20' : 'bg-slate-600'}`}>
                <Smartphone size={28} />
             </div>
             <div>
               <h2 className="text-lg font-bold text-text">WhatsApp Business</h2>
               <p className="text-xs text-text-muted">
                   {evoConfig.mode === 'api' ? 'Modo API Gateway' : 'Modo WhatsApp Web'}
               </p>
             </div>
           </div>
           <div>
              {evoStatus === 'connected' ? (
                <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
                  <Wifi size={14} /> Conectado
                </span>
              ) : evoStatus === 'checking' ? (
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-bold flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Verificando
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-bold flex items-center gap-2">
                  <WifiOff size={14} /> Desconectado
                </span>
              )}
           </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-border">
            <button 
                onClick={() => setEvoConfig({...evoConfig, mode: 'api'})}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${evoConfig.mode === 'api' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-text-muted hover:text-text'}`}
            >
                <Server size={16} /> API Oficial / Gateway
            </button>
            <button 
                onClick={() => setEvoConfig({...evoConfig, mode: 'web'})}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${evoConfig.mode === 'web' ? 'border-b-2 border-green-500 text-green-500 bg-green-500/5' : 'text-text-muted hover:text-text'}`}
            >
                <QrCode size={16} /> WhatsApp Web (QR Code)
            </button>
        </div>

        <div className="p-6 md:p-8 bg-surface/50 min-h-[400px]">
          
          {/* MODE: API GATEWAY */}
          {evoConfig.mode === 'api' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-400 flex items-start gap-2">
                        <MonitorSmartphone size={18} className="mt-0.5 flex-shrink-0" />
                        Ideal para grandes volumes e estabilidade. Requer assinatura de um serviço de Gateway (ex: Evolution API, Z-API) ou API Oficial Meta.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-text-muted">Base URL (API Endpoint)</label>
                    <input 
                        type="text" 
                        value={evoConfig.baseUrl}
                        onChange={(e) => setEvoConfig({...evoConfig, baseUrl: e.target.value})}
                        placeholder="Ex: https://api.meuzap.com"
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder:text-text-muted/50" 
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">Instance Name</label>
                    <input 
                        type="text" 
                        value={evoConfig.instanceName}
                        onChange={(e) => setEvoConfig({...evoConfig, instanceName: e.target.value})}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" 
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">Global API Key</label>
                    <div className="relative">
                        <input 
                            type={showEvoKey ? "text" : "password"} 
                            value={evoConfig.apiKey}
                            onChange={(e) => setEvoConfig({...evoConfig, apiKey: e.target.value})}
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all pr-10" 
                        />
                        <button 
                            onClick={() => setShowEvoKey(!showEvoKey)}
                            className="absolute right-3 top-3.5 text-text-muted hover:text-text"
                        >
                            {showEvoKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button 
                    onClick={() => checkEvoConnection()}
                    className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-text-muted rounded-lg text-sm font-medium transition-colors"
                    >
                    Testar Conexão
                    </button>
                    <button 
                    onClick={handleSaveWhatsApp}
                    className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-95"
                    >
                    Salvar Configuração API
                    </button>
                </div>
              </div>
          )}

          {/* MODE: WEB QR CODE */}
          {evoConfig.mode === 'web' && (
              <div className="flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Instructions */}
                  <div className="flex-1 space-y-6">
                      <div>
                          <h3 className="text-xl font-bold text-text mb-2">WhatsApp Web</h3>
                          <p className="text-text-muted text-sm">Conecte seu número escaneando o QR Code abaixo. Funciona como o WhatsApp Web normal.</p>
                      </div>

                      <ol className="space-y-4 text-sm text-text">
                          <li className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-xs">1</span>
                              Abra o WhatsApp no seu celular
                          </li>
                          <li className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-xs">2</span>
                              Toque em Menu (⋮) ou Configurações
                          </li>
                          <li className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-xs">3</span>
                              Selecione "Dispositivos Conectados"
                          </li>
                          <li className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-xs">4</span>
                              Toque em "Conectar um dispositivo"
                          </li>
                          <li className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-xs">5</span>
                              Aponte a câmera para a tela
                          </li>
                      </ol>

                      {evoStatus === 'connected' && (
                          <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                              <div className="flex items-center gap-3 mb-2">
                                  <CheckCircle className="text-green-500" />
                                  <span className="font-bold text-green-500">Sessão Ativa</span>
                              </div>
                              <p className="text-xs text-text-muted mb-4">Conectado como: <strong>{evoConfig.webSessionName}</strong></p>
                              <button 
                                onClick={disconnectWeb}
                                className="text-xs text-red-500 hover:text-red-400 font-bold underline"
                              >
                                  Desconectar sessão
                              </button>
                          </div>
                      )}
                  </div>

                  {/* QR Container */}
                  <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 rounded-xl shadow-inner min-h-[300px] border border-border/50 relative">
                       {evoStatus === 'connected' ? (
                           <div className="text-center animate-in zoom-in duration-300">
                               <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-green-500/30">
                                   <CheckCircle size={48} />
                               </div>
                               <h3 className="text-lg font-bold text-gray-800">Tudo pronto!</h3>
                               <p className="text-gray-500 text-sm">O WhatsApp está sincronizado.</p>
                           </div>
                       ) : (
                           <>
                                {qrStatus === 'idle' && (
                                    <div className="text-center">
                                        <QrCode size={64} className="text-gray-300 mx-auto mb-4" />
                                        <button 
                                            onClick={generateQrCode}
                                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-900/10 transition-transform active:scale-95"
                                        >
                                            Gerar QR Code
                                        </button>
                                    </div>
                                )}

                                {qrStatus === 'generating' && (
                                    <div className="text-center">
                                        <Loader2 size={48} className="text-green-600 animate-spin mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">Gerando código seguro...</p>
                                    </div>
                                )}

                                {(qrStatus === 'ready' || qrStatus === 'scanned') && (
                                    <div className="relative group">
                                        <img src={qrCodeUrl} alt="QR Code Login" className={`w-64 h-64 mix-blend-multiply ${qrStatus === 'scanned' ? 'opacity-20 blur-sm transition-all duration-1000' : ''}`} />
                                        
                                        {qrStatus === 'scanned' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="flex flex-col items-center">
                                                    <RefreshCw className="text-green-600 animate-spin mb-2" size={32} />
                                                    <span className="text-green-700 font-bold bg-white/90 px-3 py-1 rounded-full">Lendo dados...</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute -bottom-6 left-0 right-0 text-center">
                                            <p className="text-xs text-gray-400">O código expira em 45s</p>
                                        </div>
                                    </div>
                                )}
                           </>
                       )}
                  </div>
              </div>
          )}
        </div>
      </div>

      {/* --- C6 BANK API --- */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-gradient-to-r from-surface to-background flex justify-between items-center">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center font-bold text-black text-2xl shadow-lg shadow-yellow-500/20">C6</div>
             <div>
               <h2 className="text-lg font-bold text-text">C6 Bank Consig</h2>
               <p className="text-xs text-green-500 font-mono flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                 Ambiente de Produção
               </p>
             </div>
           </div>

           <div className="flex items-center gap-2">
                {/* Profile Manager Dropdown */}
                <div className="relative">
                    <select 
                        value={activeProfileIndex !== null ? activeProfileIndex : ""}
                        onChange={(e) => {
                            if (e.target.value !== "") loadProfile(Number(e.target.value));
                        }}
                        className="bg-background border border-border text-text text-xs rounded-lg px-3 py-1.5 outline-none focus:border-primary pr-8 appearance-none"
                    >
                        <option value="" disabled>Carregar Usuário Salvo...</option>
                        {savedProfiles.map((p, idx) => (
                            <option key={idx} value={idx}>{p.profileName || p.clientUser}</option>
                        ))}
                    </select>
                    {/* Delete Icon overlay logic would be complex here, so handling deletion via list or edit mode is better. 
                        Simplified: Render a separate list manager below or add a delete button next to select.
                    */}
                </div>
                {activeProfileIndex !== null && (
                     <button 
                        onClick={(e) => deleteProfile(activeProfileIndex, e)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded border border-red-500/20 transition-colors"
                        title="Remover este usuário"
                     >
                         <Trash2 size={14} />
                     </button>
                )}
           </div>
        </div>

        <div className="p-6 md:p-8 space-y-6 bg-surface/50">
          
          {/* Gerenciamento de Perfis / Header da Seção */}
          <div className="flex justify-between items-center pb-4 border-b border-border/50">
             <div className="flex items-center gap-2 text-sm text-text-muted">
                {activeProfileIndex !== null ? (
                    <>
                        <Users size={16} className="text-primary" />
                        <span>Editando: <strong className="text-text">{c6Config.profileName || c6Config.clientUser}</strong></span>
                    </>
                ) : (
                    <>
                         <Edit3 size={16} />
                         <span>Configuração Ativa (Não salva como perfil)</span>
                    </>
                )}
             </div>
             <button 
                onClick={() => {
                    setShowSaveProfile(!showSaveProfile);
                    // Reset name input when opening
                    if (!showSaveProfile) setNewProfileName('');
                }}
                className="text-xs text-primary hover:text-primary-dark font-bold flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 transition-all"
             >
                <UserPlus size={14} /> Salvar como Novo Usuário
             </button>
          </div>

          {showSaveProfile && (
              <div className="bg-background p-4 rounded-lg border border-primary/20 flex flex-col md:flex-row gap-2 items-end animate-in slide-in-from-top-2 shadow-sm">
                  <div className="flex-1 space-y-1 w-full">
                      <label className="text-xs font-bold text-text">Nome do Usuário/Perfil</label>
                      <input 
                        type="text" 
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder={`Ex: ${c6Config.clientUser || 'Operador 01'}`} 
                        className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text focus:border-primary outline-none placeholder:text-text-muted/50"
                      />
                      <p className="text-[10px] text-text-muted">Deixe em branco para usar o Usuário C6 como nome.</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => setShowSaveProfile(false)}
                        className="flex-1 md:flex-none px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-text-muted rounded text-sm font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSaveAsNewProfile}
                        className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded text-sm font-bold hover:bg-primary-dark shadow-md shadow-primary/10"
                    >
                        Confirmar
                    </button>
                  </div>
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-sm font-medium text-text-muted">Client User (Usuário)</label>
               <input 
                  type="text" 
                  value={c6Config.clientUser} 
                  onChange={(e) => setC6Config({...c6Config, clientUser: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
               />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium text-text-muted">Password (Senha)</label>
               <div className="relative">
                 <input 
                    type={showPassword ? "text" : "password"} 
                    value={c6Config.password} 
                    onChange={(e) => setC6Config({...c6Config, password: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-10" 
                 />
                 <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-text-muted hover:text-text"
                 >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium text-text-muted">Promoter Code (Código Promotor)</label>
               <input 
                  type="text" 
                  value={c6Config.promoterCode} 
                  onChange={(e) => setC6Config({...c6Config, promoterCode: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
               />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium text-text-muted">Typist Code (Código Digitador)</label>
               <input 
                  type="text" 
                  value={c6Config.typistCode} 
                  onChange={(e) => setC6Config({...c6Config, typistCode: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
               />
            </div>

            <div className="space-y-2 md:col-span-2">
               <label className="text-sm font-medium text-text-muted">Certified Agent CPF (CPF Agente)</label>
               <div className="flex gap-2 items-center">
                  <div className="p-3 bg-background border border-border rounded-lg">
                      <KeyRound size={18} className="text-text-muted" />
                  </div>
                  <input 
                    type="text" 
                    value={c6Config.certifiedAgentCpf} 
                    onChange={(e) => setC6Config({...c6Config, certifiedAgentCpf: e.target.value})}
                    className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                  />
               </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2">
               <button 
                  onClick={handleTestTokenC6}
                  disabled={isLoadingC6}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-lg text-text text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
               >
                 {isLoadingC6 ? <span className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin"></span> : <ShieldAlert size={16} />}
                 Testar Token (Auth)
               </button>
               
               {c6TokenStatus === 'success' && (
                  <span className="text-xs text-green-500 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                    <CheckCircle size={14} /> Token Válido
                  </span>
               )}
             </div>

             <button 
               onClick={handleSaveC6Config}
               className={`w-full md:w-auto px-6 py-2.5 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${activeProfileIndex !== null ? 'bg-primary text-white hover:bg-primary-dark shadow-primary/20' : 'bg-surface-hover text-text border border-border hover:bg-surface'}`}
             >
               <Save size={18} /> 
               {activeProfileIndex !== null ? 'Salvar Alterações do Usuário' : 'Salvar Temporariamente'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;