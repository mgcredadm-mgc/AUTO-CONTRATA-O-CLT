
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Inbox from './components/Inbox';
import Integrations from './components/Integrations';
import AIConfig from './components/AIConfig';
import SalesControl from './components/SalesControl';
import CustomerUpload from './components/CustomerUpload';
import AccessSettings from './components/AccessSettings';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inbox':
        return <Inbox theme={theme} />;
      case 'customer-base':
        return <CustomerUpload />;
      case 'sales':
        return <SalesControl />;
      case 'integrations':
        return <Integrations />;
      case 'settings':
        return <AccessSettings />;
      case 'ai-config':
        return <AIConfig />;
      default:
        return <Dashboard />;
    }
  };

  return (
    // Container principal com Padding (p-4) para criar o efeito flutuante
    <div className="flex h-screen w-full overflow-hidden p-4 gap-4 selection:bg-accent-blue selection:text-white transition-colors duration-300">
      
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      {/* Container Principal com efeito Glass e Bordas Arredondadas (rounded-[32px]) */}
      <main className="flex-1 h-full overflow-hidden relative rounded-[32px] glass shadow-float">
        <div className="relative z-10 h-full">
          {renderView()}
        </div>
      </main>

    </div>
  );
};

export default App;
