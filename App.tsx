
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Inbox from './components/Inbox';
import Integrations from './components/Integrations';
import AIConfig from './components/AIConfig';
import SalesControl from './components/SalesControl';
import CustomerUpload from './components/CustomerUpload';
import AccessSettings from './components/AccessSettings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('inbox');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Apply theme to HTML tag
    const root = window.document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderView = () => {
    switch (currentView) {
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
        return <Inbox theme={theme} />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-text font-sans overflow-hidden selection:bg-primary/30 selection:text-primary transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 h-screen overflow-hidden relative">
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>
        
        <div className="relative z-10 h-full">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;