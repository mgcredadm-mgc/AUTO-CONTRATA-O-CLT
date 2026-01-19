
import React, { useState } from 'react';
import { Shield, Users, Lock, CheckCircle2, XCircle, Plus, Edit3, Trash2, Search, Key, ShieldAlert, Save } from 'lucide-react';
import { SystemUser, SystemRole, AccessModule, AccessLevel } from '../types';

const MOCK_ROLES: SystemRole[] = [
    {
        id: 'admin',
        name: 'Administrador',
        description: 'Acesso total a todas as funcionalidades do sistema.',
        isSystemDefault: true,
        permissions: [
            { module: 'inbox', level: 'admin' },
            { module: 'sales', level: 'admin' },
            { module: 'customers', level: 'admin' },
            { module: 'integrations', level: 'admin' },
            { module: 'ai_config', level: 'admin' },
            { module: 'settings', level: 'admin' },
        ]
    },
    {
        id: 'manager',
        name: 'Gerente Comercial',
        description: 'Gestão de equipe e visualização de relatórios. Sem acesso a configurações técnicas.',
        isSystemDefault: false,
        permissions: [
            { module: 'inbox', level: 'write' },
            { module: 'sales', level: 'write' },
            { module: 'customers', level: 'write' },
            { module: 'integrations', level: 'read' },
            { module: 'ai_config', level: 'read' },
            { module: 'settings', level: 'none' },
        ]
    },
    {
        id: 'agent',
        name: 'Atendente N1',
        description: 'Focado em atendimento e vendas. Acesso restrito.',
        isSystemDefault: false,
        permissions: [
            { module: 'inbox', level: 'write' },
            { module: 'sales', level: 'read' },
            { module: 'customers', level: 'read' },
            { module: 'integrations', level: 'none' },
            { module: 'ai_config', level: 'none' },
            { module: 'settings', level: 'none' },
        ]
    }
];

const MOCK_USERS: SystemUser[] = [
    { id: '1', name: 'Ricardo Silva', email: 'ricardo.silva@crm.com', roleId: 'admin', status: 'active', lastLogin: 'Agora', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Amanda Costa', email: 'amanda.c@crm.com', roleId: 'manager', status: 'active', lastLogin: '2h atrás', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', name: 'João Souza', email: 'joao.s@crm.com', roleId: 'agent', status: 'inactive', lastLogin: '3 dias atrás', avatarUrl: 'https://i.pravatar.cc/150?u=3' },
    { id: '4', name: 'Beatriz Lima', email: 'bia.lima@crm.com', roleId: 'agent', status: 'active', lastLogin: '15 min atrás', avatarUrl: 'https://i.pravatar.cc/150?u=4' },
];

const MODULE_LABELS: Record<AccessModule, string> = {
    inbox: 'Atendimentos (Inbox)',
    sales: 'Vendas & Financeiro',
    customers: 'Base de Clientes',
    integrations: 'Integrações (API)',
    ai_config: 'Inteligência Artificial',
    settings: 'Acessos & Segurança'
};

const AccessSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
    const [users, setUsers] = useState<SystemUser[]>(MOCK_USERS);
    const [roles, setRoles] = useState<SystemRole[]>(MOCK_ROLES);
    const [searchTerm, setSearchTerm] = useState('');
    
    // States for Modals (Simplified for demo)
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingRole, setEditingRole] = useState<SystemRole | null>(null);

    // --- User Logic ---
    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const roleId = (form.elements.namedItem('role') as HTMLSelectElement).value;

        const newUser: SystemUser = {
            id: Date.now().toString(),
            name,
            email,
            roleId,
            status: 'active',
            lastLogin: 'Nunca',
            avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
        };
        setUsers([...users, newUser]);
        setShowUserModal(false);
    };

    const toggleUserStatus = (userId: string) => {
        setUsers(users.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    };

    const deleteUser = (userId: string) => {
        if (window.confirm('Tem certeza que deseja remover este usuário?')) {
            setUsers(users.filter(u => u.id !== userId));
        }
    };

    // --- Role Logic ---
    const handleSaveRole = () => {
        if (!editingRole) return;
        setRoles(roles.map(r => r.id === editingRole.id ? editingRole : r));
        setEditingRole(null);
    };

    const updatePermission = (module: AccessModule, level: AccessLevel) => {
        if (!editingRole) return;
        const newPermissions = editingRole.permissions.map(p => 
            p.module === module ? { ...p, level } : p
        );
        // Add if not exists (though mock data covers all)
        if (!newPermissions.find(p => p.module === module)) {
            newPermissions.push({ module, level });
        }
        setEditingRole({ ...editingRole, permissions: newPermissions });
    };

    const getPermissionLevel = (role: SystemRole, module: AccessModule): AccessLevel => {
        return role.permissions.find(p => p.module === module)?.level || 'none';
    };

    return (
        <div className="p-6 md:p-10 h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2 tracking-tight flex items-center gap-2">
                    <ShieldCheckIcon className="text-primary" /> Acessos & Equipe
                </h1>
                <p className="text-text-muted">Gerencie usuários, convites e níveis de permissão do sistema.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 px-6 text-sm font-medium transition-all relative ${activeTab === 'users' ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                >
                    <div className="flex items-center gap-2">
                        <Users size={16} /> Usuários do Sistema
                    </div>
                    {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('roles')}
                    className={`pb-3 px-6 text-sm font-medium transition-all relative ${activeTab === 'roles' ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                >
                    <div className="flex items-center gap-2">
                        <Lock size={16} /> Funções e Restrições
                    </div>
                    {activeTab === 'roles' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
                </button>
            </div>

            {/* === USERS TAB === */}
            {activeTab === 'users' && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-2.5 text-text-muted w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <button 
                            onClick={() => setShowUserModal(true)}
                            className="w-full md:w-auto px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Novo Usuário
                        </button>
                    </div>

                    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-background/50 border-b border-border text-xs text-text-muted uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 font-bold">Usuário</th>
                                    <th className="p-4 font-bold">Cargo (Role)</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold">Último Acesso</th>
                                    <th className="p-4 font-bold text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                                    <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-border" />
                                                <div>
                                                    <p className="font-bold text-text text-sm">{user.name}</p>
                                                    <p className="text-xs text-text-muted">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-background border border-border px-2 py-1 rounded text-xs font-medium text-text">
                                                {roles.find(r => r.id === user.roleId)?.name || 'Desconhecido'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => toggleUserStatus(user.id)} className="focus:outline-none">
                                                {user.status === 'active' ? (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                                        <CheckCircle2 size={12} /> Ativo
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-text-muted bg-surface px-2 py-1 rounded border border-border">
                                                        <XCircle size={12} /> Inativo
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4 text-sm text-text-muted">{user.lastLogin}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-1.5 text-text-muted hover:text-primary transition-colors">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteUser(user.id)}
                                                    className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* === ROLES TAB === */}
            {activeTab === 'roles' && (
                <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-right-2 duration-300">
                    
                    {/* Role List */}
                    <div className="lg:w-1/3 space-y-4">
                         {roles.map(role => (
                             <div 
                                key={role.id}
                                onClick={() => setEditingRole(role)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    editingRole?.id === role.id 
                                    ? 'bg-primary/5 border-primary shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                    : 'bg-surface border-border hover:border-primary/50'
                                }`}
                             >
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className={`font-bold ${editingRole?.id === role.id ? 'text-primary' : 'text-text'}`}>
                                         {role.name}
                                     </h3>
                                     {role.isSystemDefault && <span title="Sistema"><Shield size={14} className="text-text-muted" /></span>}
                                 </div>
                                 <p className="text-xs text-text-muted leading-relaxed mb-3">
                                     {role.description}
                                 </p>
                                 <div className="flex items-center gap-2 text-xs text-text-muted">
                                     <Users size={12} />
                                     <span>{users.filter(u => u.roleId === role.id).length} usuários</span>
                                 </div>
                             </div>
                         ))}
                         
                         <button className="w-full py-3 border border-dashed border-border rounded-xl text-text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                             <Plus size={16} /> Criar Nova Função
                         </button>
                    </div>

                    {/* Permission Editor */}
                    <div className="lg:w-2/3">
                        {editingRole ? (
                            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm h-full flex flex-col">
                                <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-text mb-1">Editando: {editingRole.name}</h2>
                                        <p className="text-xs text-text-muted">Configure o nível de acesso para cada módulo.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {!editingRole.isSystemDefault && (
                                            <button className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg border border-red-500/20">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={handleSaveRole}
                                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors flex items-center gap-2"
                                        >
                                            <Save size={16} /> Salvar Alterações
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-1">
                                    {Object.entries(MODULE_LABELS).map(([key, label]) => {
                                        const moduleKey = key as AccessModule;
                                        const currentLevel = getPermissionLevel(editingRole, moduleKey);

                                        return (
                                            <div key={moduleKey} className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${currentLevel === 'none' ? 'bg-background text-text-muted' : 'bg-primary/10 text-primary'}`}>
                                                        {moduleKey === 'settings' ? <ShieldAlert size={18}/> : <Key size={18} />}
                                                    </div>
                                                    <span className="text-sm font-medium text-text">{label}</span>
                                                </div>

                                                <div className="flex bg-background border border-border rounded-lg p-1">
                                                    {(['none', 'read', 'write', 'admin'] as AccessLevel[]).map((level) => (
                                                        <button
                                                            key={level}
                                                            onClick={() => updatePermission(moduleKey, level)}
                                                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${
                                                                currentLevel === level 
                                                                ? 'bg-primary text-white shadow-sm' 
                                                                : 'text-text-muted hover:text-text hover:bg-surface-hover'
                                                            }`}
                                                        >
                                                            {level === 'none' && 'Bloqueado'}
                                                            {level === 'read' && 'Ver'}
                                                            {level === 'write' && 'Editar'}
                                                            {level === 'admin' && 'Total'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                             <div className="h-full bg-surface/50 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-text-muted p-10 text-center">
                                 <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mb-4">
                                     <Lock size={32} />
                                 </div>
                                 <h3 className="font-bold text-lg mb-2">Selecione uma Função</h3>
                                 <p className="text-sm max-w-xs">Clique em um cargo à esquerda para visualizar e editar suas permissões de acesso.</p>
                             </div>
                        )}
                    </div>
                </div>
            )}

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleAddUser} className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-lg font-bold text-text">Adicionar Usuário</h2>
                            <button type="button" onClick={() => setShowUserModal(false)} className="text-text-muted hover:text-red-500">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-text mb-1">Nome Completo</label>
                                <input name="name" required type="text" className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none" placeholder="Ex: Ana Souza" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text mb-1">E-mail Corporativo</label>
                                <input name="email" required type="email" className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none" placeholder="ana@empresa.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text mb-1">Função (Cargo)</label>
                                <select name="role" className="w-full bg-background border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none">
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-xs text-blue-400">
                                Um e-mail de convite será enviado para o usuário definir a senha.
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 rounded-lg border border-border text-text hover:bg-surface-hover">Cancelar</button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark font-bold">Enviar Convite</button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
};

// Helper Icon for Header
const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
    </svg>
);

export default AccessSettings;
