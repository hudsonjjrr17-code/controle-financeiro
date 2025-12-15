import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Sparkles, PiggyBank, TrendingUp, TrendingDown, LogOut, Eye, EyeOff, ListFilter, ArrowRightLeft, Plus, Minus } from 'lucide-react';
import TransactionItem from './components/TransactionItem';
import AddTransactionModal from './components/AddTransactionModal';
import AIInsights from './components/AIInsights';
import WalletView from './components/WalletView';
import MotivationView from './components/MotivationView';
import LoginScreen from './components/LoginScreen';
import { Transaction, TransactionType, ChartDataPoint, SavingsGoal, UserProfile } from './types';

// ZERO Data - Clean State
const DEFAULT_TRANSACTIONS: Transaction[] = [];

// Professional Monochrome & Accent Palette
const COLORS = ['#171717', '#404040', '#737373', '#a3a3a3', '#d4d4d4', '#ef4444'];

type Tab = 'dashboard' | 'extract' | 'motivation' | 'insights';

export default function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState<UserProfile | null>(() => {
      try {
          const savedUser = localStorage.getItem('user_profile');
          return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
          return null;
      }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- DATA STATE ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
        const saved = localStorage.getItem('transactions');
        return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
    } catch (e) {
        return DEFAULT_TRANSACTIONS;
    }
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
        const saved = localStorage.getItem('goals');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  // UI States
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');
  const [isModalLocked, setIsModalLocked] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showValues, setShowValues] = useState(true); // Privacy mode

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
     if (user) {
         localStorage.setItem('user_profile', JSON.stringify(user));
     }
  }, [user]);

  // --- HANDLERS ---
  const handleLogin = (name: string, password: string) => {
      if (user) {
          if (user.password === password) {
              setIsAuthenticated(true);
          } else {
              alert("Senha incorreta.");
          }
      } else {
          const newUser: UserProfile = {
              name,
              password,
              joinedAt: new Date().toISOString()
          };
          setUser(newUser);
          setIsAuthenticated(true);
      }
  };

  const handleLogout = () => {
      if (window.confirm("Bloquear aplicativo?")) {
          setIsAuthenticated(false);
          setActiveTab('dashboard');
      }
  };

  // Calculations
  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }, [transactions]);

  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), [transactions]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      const cat = curr.category;
      acc[cat] = (acc[cat] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
        .sort((a: [string, number], b: [string, number]) => b[1] - a[1]) // Sort by value desc
        .slice(0, 5) // Top 5 categories
        .map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length]
        }));
  }, [transactions]);

  const handleAddTransaction = (amount: number, description: string, category: string, type: TransactionType) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount,
      description,
      category,
      type,
      date: new Date().toISOString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleUpdateTransaction = (id: string, amount: number, description: string, category: string, type: TransactionType) => {
    setTransactions(transactions.map(t => 
        t.id === id ? { ...t, amount, description, category, type } : t
    ));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleEditRequest = (transaction: Transaction) => {
      setEditingTransaction(transaction);
      setIsModalOpen(true);
  };

  const openAddModal = (type: TransactionType) => {
      setEditingTransaction(null);
      setModalDefaultType(type);
      setIsModalLocked(true);
      setIsModalOpen(true);
  };

  // Utility to format money
  const formatMoney = (val: number) => {
      if (!showValues) return '••••••';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (!isAuthenticated) {
      return (
        <div className="fixed inset-0 bg-zinc-50 flex justify-center overflow-hidden">
            <div className="w-full md:max-w-md h-full bg-white relative md:shadow-2xl overflow-hidden">
                <LoginScreen onLogin={handleLogin} existingUser={user} />
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-black/5 flex justify-center overflow-hidden font-sans">
      <div className="w-full md:max-w-md h-full bg-gray-50/50 flex flex-col relative md:shadow-2xl overflow-hidden">
        
        {/* TOP BAR */}
        <header className="bg-white pt-[max(2.5rem,env(safe-area-inset-top))] pb-3 px-6 sticky top-0 z-20 flex-none flex justify-between items-center">
             <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Bom dia,</span>
                <span className="text-xl font-bold text-gray-900 tracking-tight">{user?.name}</span>
             </div>
             
             <button 
                onClick={handleLogout}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
             >
                <LogOut size={18} />
             </button>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative z-10">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-300">
                
                {/* 1. HERO BALANCE CARD */}
                <div className="px-6 pt-4 pb-6">
                    <div className="bg-zinc-900 rounded-[1.75rem] p-6 text-white shadow-xl shadow-zinc-200 relative overflow-hidden group">
                        {/* Decorative blur */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/30 transition-colors duration-700"></div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-zinc-400 text-xs font-medium tracking-wider uppercase">Saldo Total</span>
                                <button onClick={() => setShowValues(!showValues)} className="text-zinc-500 hover:text-white transition-colors">
                                    {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                            
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold tracking-tight mb-1">
                                    {formatMoney(totalBalance)}
                                </h1>
                            </div>

                            {/* Mini Stats in Card */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center">
                                            <TrendingUp size={10} className="text-green-400" />
                                        </div>
                                        <span className="text-[10px] text-zinc-400 font-medium">Entradas</span>
                                    </div>
                                    <p className="text-sm font-semibold text-zinc-200">{formatMoney(totalIncome)}</p>
                                </div>
                                <div className="w-[1px] bg-zinc-800"></div>
                                <div className="flex-1">
                                     <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center">
                                            <TrendingDown size={10} className="text-red-400" />
                                        </div>
                                        <span className="text-[10px] text-zinc-400 font-medium">Saídas</span>
                                    </div>
                                    <p className="text-sm font-semibold text-zinc-200">{formatMoney(totalExpense)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. QUICK ACTIONS */}
                <div className="px-6 mb-8">
                    <div className="flex gap-3">
                        <button 
                            onClick={() => openAddModal('income')}
                            className="flex-1 bg-green-50 active:bg-green-100 p-4 rounded-2xl flex flex-col items-center gap-2 border border-green-100 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                                <Plus size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-gray-700">Entrada</span>
                        </button>

                        <button 
                            onClick={() => openAddModal('expense')}
                            className="flex-1 bg-red-50 active:bg-red-100 p-4 rounded-2xl flex flex-col items-center gap-2 border border-red-100 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <Minus size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-gray-700">Despesa</span>
                        </button>
                    </div>
                </div>

                {/* 3. CHART SECTION */}
                {chartData.length > 0 && (
                    <div className="px-6 mb-8">
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 text-sm">Gastos por Categoria</h3>
                             </div>
                             
                             <div className="flex items-center">
                                <div className="w-32 h-32 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                innerRadius={45}
                                                outerRadius={60}
                                                paddingAngle={4}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-[10px] font-bold text-gray-400">Top 5</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 ml-4 space-y-2">
                                    {chartData.slice(0, 3).map((entry) => (
                                        <div key={entry.name} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                                <span className="text-gray-600 font-medium truncate max-w-[80px]">{entry.name}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{((entry.value / totalExpense) * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* 4. RECENT TRANSACTIONS HEADER */}
                <div className="px-6">
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="font-bold text-gray-900 text-lg">Últimas</h3>
                        <button onClick={() => setActiveTab('extract')} className="text-xs font-bold text-red-600 hover:text-red-700">
                            Ver Extrato Completo
                        </button>
                    </div>
                    <div>
                         {transactions.slice(0, 4).map(t => (
                            <TransactionItem 
                                key={t.id} 
                                transaction={t} 
                                onDelete={handleDeleteTransaction}
                                onEdit={handleEditRequest}
                            />
                        ))}
                        {transactions.length === 0 && (
                            <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm">Nenhuma movimentação.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          )}

          {/* EXTRACT TAB (Replaces separate Income/Expense tabs) */}
          {activeTab === 'extract' && (
             <WalletView 
                transactions={transactions} 
                onDelete={handleDeleteTransaction} 
                onEdit={handleEditRequest}
                onAddTransaction={() => openAddModal('expense')}
             />
          )}

          {/* MOTIVATION/GOALS TAB */}
          {activeTab === 'motivation' && (
              <MotivationView 
                totalBalance={totalBalance}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                goals={goals}
                onAddGoal={(g) => setGoals([...goals, g])}
                onUpdateGoal={(g) => setGoals(goals.map(item => item.id === g.id ? g : item))}
                onDeleteGoal={(id) => setGoals(goals.filter(item => item.id !== id))}
              />
          )}

          {/* INSIGHTS TAB */}
          {activeTab === 'insights' && (
              <div className="px-6 pt-4">
                  <h2 className="text-2xl font-black text-gray-900 mb-1">Inteligência</h2>
                  <p className="text-sm text-gray-500 mb-6">Análises personalizadas para você.</p>
                  <AIInsights transactions={transactions} />
              </div>
          )}

        </main>

        {/* BOTTOM NAVIGATION - SIMPLIFIED */}
        <nav className="bg-white border-t border-gray-100 flex justify-between items-center px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 absolute bottom-0 w-full z-40">
           <button 
             onClick={() => setActiveTab('dashboard')}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-zinc-900' : 'text-gray-400 hover:text-gray-600'}`}
           >
             <LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
             <span className="text-[10px] font-bold">Início</span>
           </button>

           <button 
             onClick={() => setActiveTab('extract')}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'extract' ? 'text-zinc-900' : 'text-gray-400 hover:text-gray-600'}`}
           >
             <ListFilter size={24} strokeWidth={activeTab === 'extract' ? 2.5 : 2} />
             <span className="text-[10px] font-bold">Extrato</span>
           </button>

           <button 
             onClick={() => setActiveTab('motivation')}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'motivation' ? 'text-zinc-900' : 'text-gray-400 hover:text-gray-600'}`}
           >
             <PiggyBank size={24} strokeWidth={activeTab === 'motivation' ? 2.5 : 2} />
             <span className="text-[10px] font-bold">Metas</span>
           </button>

           <button 
             onClick={() => setActiveTab('insights')}
             className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'insights' ? 'text-zinc-900' : 'text-gray-400 hover:text-gray-600'}`}
           >
             <Sparkles size={24} strokeWidth={activeTab === 'insights' ? 2.5 : 2} />
             <span className="text-[10px] font-bold">Dicas</span>
           </button>
        </nav>

        {/* Modal */}
        <AddTransactionModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddTransaction}
            onUpdate={handleUpdateTransaction}
            defaultType={modalDefaultType}
            isTypeLocked={isModalLocked}
            editingTransaction={editingTransaction}
        />
      </div>
    </div>
  );
}