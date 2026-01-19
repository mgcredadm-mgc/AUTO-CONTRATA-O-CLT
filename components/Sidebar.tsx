import React from 'react';
import { MessageSquareText, Landmark, Settings2, LogOut, Sun, Moon, Sparkles } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, theme, toggleTheme }) => {
  const menuItems = [
    { id: 'inbox', icon: MessageSquareText, label: 'Inbox' },
    { id: 'integrations', icon: Landmark, label: 'Integrações' },
    { id: 'ai-config', icon: Settings2, label: 'Configurar Eva' },
  ];

  return (
    <div className="w-16 md:w-64 flex-shrink-0 bg-surface border-r border-border h-screen flex flex-col justify-between transition-all duration-300 z-20 shadow-2xl">
      <div>
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-border bg-background">
          <div className="relative group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105">
               <Sparkles size={20} className="text-white fill-white" />
            </div>
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="ml-3 hidden md:block">
             <h1 className="font-bold text-2xl tracking-tight text-text leading-none">Eva</h1>
             <span className="text-[10px] font-mono text-primary font-medium tracking-wider uppercase">CRM v2.0</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <div className="px-2 mb-2 hidden md:block">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Menu Principal</span>
          </div>
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-text-muted hover:bg-surface-hover hover:text-text'
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                <item.icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium hidden md:block text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border bg-surface/50">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text transition-all mb-2"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span className="font-medium hidden md:block text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        
        <button className="w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all group">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium hidden md:block text-sm">Desconectar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;