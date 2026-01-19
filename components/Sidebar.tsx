
import React, { useState, useEffect } from 'react';
import { 
  MessageSquareText, Landmark, Settings2, LogOut, Sun, Moon, 
  Sparkles, CircleDollarSign, Database, ChevronLeft, ChevronRight, 
  ShieldCheck, LayoutGrid, MoreVertical, User
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

type MenuItem = {
  id: string;
  icon: React.ElementType;
  label: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, theme, toggleTheme }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 768);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuGroups: MenuGroup[] = [
    {
      title: 'OPERACIONAL',
      items: [
        { id: 'inbox', icon: MessageSquareText, label: 'Atendimentos' },
        { id: 'customer-base', icon: Database, label: 'Base de Clientes' },
        { id: 'sales', icon: CircleDollarSign, label: 'Controle de Vendas' },
      ]
    },
    {
      title: 'GESTÃO',
      items: [
        { id: 'integrations', icon: Landmark, label: 'Integrações' },
        { id: 'settings', icon: ShieldCheck, label: 'Acessos & Equipe' },
      ]
    },
    {
      title: 'SISTEMA',
      items: [
        { id: 'ai-config', icon: Settings2, label: 'Configurar Eva' },
      ]
    }
  ];

  // Mock User Data
  const user = {
      name: "Gabriel Bertelli",
      role: "Desenvolvedor",
      avatar: "https://github.com/shadcn.png"
  };

  return (
    <div className={`
      ${isCollapsed ? 'w-20' : 'w-72'} 
      flex-shrink-0 bg-surface border-r border-border h-screen flex flex-col transition-all duration-300 z-20 shadow-xl relative
    `}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-surface border border-border text-text-muted hover:text-primary rounded-full p-1.5 shadow-md z-50 transition-colors hidden md:flex items-center justify-center"
        title={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header / Logo */}
      <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} bg-surface transition-all overflow-hidden mb-2`}>
        <div className="flex items-center gap-3">
            <div className="relative group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20 flex items-center justify-center transition-transform group-hover:scale-105">
                    <Sparkles size={20} className="text-white" />
                </div>
            </div>
            
            <div className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                <h1 className="font-bold text-xl tracking-tight text-text leading-none">Eva CRM</h1>
                <p className="text-[10px] text-text-muted font-medium tracking-wider mt-1">INTELLIGENCE v2.0</p>
            </div>
        </div>
      </div>
      
      {/* Navigation Area */}
      <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            {!isCollapsed && (
              <div className="px-6 mb-3">
                <h3 className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">{group.title}</h3>
              </div>
            )}
            
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onChangeView(item.id)}
                    className={`
                      w-full flex items-center gap-4 py-3.5 transition-all duration-200 group relative
                      ${isCollapsed ? 'justify-center px-0' : 'justify-start px-6'}
                      ${isActive 
                        ? 'bg-background text-primary font-semibold shadow-sm' 
                        : 'text-text-muted hover:text-text hover:bg-surface-hover/50'
                      }
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    {/* Active Indicator (Left Bar) */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
                    )}

                    {/* Active Connector (Cascading Effect) */}
                    {isActive && (
                       <div className="absolute right-[-1px] top-0 bottom-0 w-1 bg-background z-30"></div>
                    )}
                    
                    {/* Top/Bottom Borders for Active State */}
                    {isActive && (
                        <>
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border/50 to-border"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border/50 to-border"></div>
                        </>
                    )}

                    <div className={`relative z-20 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <item.icon size={isCollapsed ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    
                    <span className={`text-sm whitespace-nowrap transition-all duration-300 z-20 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
                        {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile & Footer Actions */}
      <div className="p-4 bg-surface border-t border-border relative">
        
        {/* Profile Menu Dropdown */}
        {showProfileMenu && (
            <>
                {/* Backdrop transparente para fechar ao clicar fora */}
                <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                
                <div className={`
                    absolute bottom-full mb-3 bg-surface border border-border rounded-2xl shadow-2xl z-40 overflow-hidden animate-in zoom-in-95 duration-200
                    ${isCollapsed ? 'left-full ml-2 w-64' : 'left-4 right-4'}
                `}>
                    {/* Header do Menu */}
                    <div className="p-4 bg-background/50 border-b border-border flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-border" />
                        <div>
                            <h4 className="font-bold text-sm text-text">{user.name}</h4>
                            <p className="text-xs text-text-muted">{user.role}</p>
                        </div>
                    </div>

                    {/* Opções do Menu */}
                    <div className="p-2 space-y-1">
                        <button 
                            onClick={() => { toggleTheme(); setShowProfileMenu(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>
                        </button>

                        <div className="h-px bg-border my-1 mx-2"></div>

                        <button 
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Sair da conta</span>
                        </button>
                    </div>
                </div>
            </>
        )}

        {/* Profile Trigger Button */}
        <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`
                w-full flex items-center gap-3 p-2 rounded-xl transition-all border
                ${showProfileMenu ? 'bg-background border-border shadow-inner' : 'hover:bg-surface-hover border-transparent'}
                ${isCollapsed ? 'justify-center' : ''}
            `}
        >
            <div className="relative">
                <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full bg-border object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface"></span>
            </div>
            
            {!isCollapsed && (
                <div className="flex-1 text-left overflow-hidden">
                    <h4 className="font-bold text-sm text-text truncate">{user.name}</h4>
                    <p className="text-[10px] text-text-muted truncate">{user.role}</p>
                </div>
            )}

            {!isCollapsed && (
                <MoreVertical size={16} className="text-text-muted" />
            )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
