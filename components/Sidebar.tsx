
import React from 'react';
import { 
  MessageSquareText, Landmark, Settings2, Sun, Moon, 
  Sparkles, CircleDollarSign, Database, 
  ShieldCheck, LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, theme, toggleTheme }) => {
  
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'inbox', icon: MessageSquareText, label: 'Inbox' },
    { id: 'customer-base', icon: Database, label: 'Clientes' },
    { id: 'sales', icon: CircleDollarSign, label: 'Vendas' },
    { id: 'integrations', icon: Landmark, label: 'APIs' },
    { id: 'ai-config', icon: Settings2, label: 'IA Config' },
    { id: 'settings', icon: ShieldCheck, label: 'Admin' },
  ];

  return (
    // Sidebar flutuante estilo "Pílula"
    <div className="w-20 flex-shrink-0 h-full flex flex-col items-center py-6 glass rounded-[32px] transition-all duration-300 z-20 shadow-float">
      
      {/* Logo Area */}
      <div className="mb-8">
        <div className="w-10 h-10 rounded-full bg-text text-background flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
            <Sparkles size={20} className="fill-current" />
        </div>
      </div>
      
      {/* Navigation Icons */}
      <nav className="flex-1 w-full px-3 space-y-3 overflow-y-auto flex flex-col items-center">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group relative
                ${isActive 
                  ? 'bg-text text-background shadow-lg scale-105' 
                  : 'text-text-muted hover:bg-surface-hover hover:text-text'
                }
              `}
              title={item.label}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip flutuante ao passar o mouse */}
              <span className="absolute left-14 bg-text text-background text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-sm">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Theme Toggle */}
      <div className="mt-auto space-y-4 flex flex-col items-center">
        <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-all"
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-hover shadow-sm cursor-pointer hover:border-text transition-colors">
            <img src="https://github.com/shadcn.png" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
