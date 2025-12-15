import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, LayoutDashboard, Sparkles, PiggyBank, TrendingUp, TrendingDown, Wallet, Target, ArrowRight, DollarSign, LogOut } from 'lucide-react';
import TransactionItem from './components/TransactionItem';
import AddTransactionModal from './components/AddTransactionModal';
import AIInsights from './components/AIInsights';
import WalletView from './components/WalletView';
import MotivationView from './components/MotivationView';
import LoginScreen from './components/LoginScreen';
import { Transaction, Category, TransactionType, ChartDataPoint, SavingsGoal, UserProfile } from './types';

// ZERO Data - Clean State
const DEFAULT_TRANSACTIONS: Transaction[] = [];

// Red, Black, Gray Palette
const COLORS = ['#DC2626', '#000000', '#525252', '#A3A3A3', '#EF4444', '#7F1D1D'];

type Tab = 'dashboard' | 'income' | 'expenses' | 'motivation' | 'insights';

export default function App() {
  // --- AUTH STATE ---
  // "user" holds the saved profile from disk (might not be logged in yet)
  const [user, setUser] = useState<UserProfile | null>(() => {
      try {
          const savedUser = localStorage.getItem('user_profile');
          return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
          return null;
      }
  });

  // "isAuthenticated" determines if we show the main app
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

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');
  const [isModalLocked, setIsModalLocked] = useState(false);
  
  // Animation State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  // Persist User Profile updates
  useEffect(() => {
     if (user) {
         localStorage.setItem('user_profile', JSON.stringify(user));
     }
  }, [user]);

  // Cycle through dashboard slides
  useEffect(() => {
    if (activeTab === 'dashboard') {
        const interval = setInterval(() => {
            setCurrentHeroSlide((prev) => (prev + 1) % 4); // 4 Slides total
        }, 4000);
        return () => clearInterval(interval);
    }
  }, [activeTab]);

  // --- HANDLERS ---

  const handleLogin = (name: string, password: string) => {
      if (user) {
          // Login Mode: Check password
          if (user.password === password) {
              setIsAuthenticated(true);
          } else {
              alert("Senha incorreta. Tente novamente.");
          }
      } else {
          // Registration Mode
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
      if (window.confirm("Deseja bloquear o aplicativo?")) {
          setIsAuthenticated(false); // Just lock, don't delete data
          setActiveTab('dashboard');
      }
  };

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

    return Object.entries(grouped).map(([name, value], index) => ({
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

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleAddGoal = (goal: SavingsGoal) => {
    setGoals([...goals, goal]);
  };

  const handleUpdateGoal = (updatedGoal: SavingsGoal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const openAddModal = (type: TransactionType, lockType: boolean = false) => {
      setModalDefaultType(type);
      setIsModalLocked(lockType);
      setIsModalOpen(true);
  };

  // Prepare slides data for the animation
  const heroSlides = [
    {
        id: 'balance',
        label: 'Saldo Disponível',
        value: `R$ ${totalBalance.toFixed(2)}`,
        icon: <Wallet size={24} className="text-black" />,
        bg: 'bg-gray-50',
        text: 'text-black',
        border: 'border-gray-200'
    },
    {
        id: 'income',
        label: 'Receitas do Mês',
        value: `R$ ${totalIncome.toFixed(2)}`,
        icon: <TrendingUp size={24} className="text-green-600" />,
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-100'
    },
    {
        id: 'expense',
        label: 'Despesas do Mês',
        value: `R$ ${totalExpense.toFixed(2)}`,
        icon: <TrendingDown size={24} className="text-red-600" />,
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-100'
    },
    {
        id: 'goals',
        label: 'Total Guardado',
        value: `R$ ${goals.reduce((acc, g) => acc + g.currentAmount, 0).toFixed(2)}`,
        icon: <Target size={24} className="text-white" />,
        bg: 'bg-black',
        text: 'text-white',
        border: 'border-gray-800'
    }
  ];

  // --- RENDER LOGIN IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
      return (
        <div className="fixed inset-0 bg-black/5 flex justify-center overflow-hidden">
            <div className="w-full md:max-w-md h-full bg-white relative md:shadow-2xl md:h-[95vh] md:my-auto md:rounded-[2.5rem] overflow-hidden">
                <LoginScreen onLogin={handleLogin} existingUser={user} />
            </div>
        </div>
      );
  }

  // --- MAIN APP ---
  return (
    // FULL SCREEN CONTAINER FOR ANDROID
    <div className="fixed inset-0 bg-black/5 flex justify-center overflow-hidden">
      
      {/* Responsive Container */}
      <div className="w-full md:max-w-md h-full bg-white flex flex-col relative md:shadow-2xl md:h-[95vh] md:my-auto md:rounded-[2.5rem] overflow-hidden">
        
        {/* BACKGROUND WATERMARK */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <DollarSign 
                size={700} 
                className="text-red-600 opacity-[0.07] -rotate-12 translate-x-10 translate-y-20" 
                strokeWidth={1.5} 
            />
        </div>

        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm pt-[max(2.5rem,env(safe-area-inset-top))] pb-4 px-6 sticky top-0 z-20 border-b border-gray-100 flex-none">
          <div className="flex justify-between items-center">
             <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                   Controle Financeiro
                </p>
                <h1 className="text-2xl font-black text-black tracking-tight leading-none truncate pr-2">
                   Olá, {user?.name}
                </h1>
             </div>
             
             {/* Avatar / Logout */}
             <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:bg-gray-800"
                title="Sair / Bloquear"
             >
                <LogOut size={16} className="ml-0.5" />
             </button>
          </div>
        </header>

        {/* Dashboard Animated Header - Only on Dashboard Tab */}
        {activeTab === 'dashboard' && (
           <div className="px-6 py-4 bg-white/0 relative z-10 flex-none mb-2">
              <div className="relative h-32 w-full">
                {heroSlides.map((slide, index) => (
                    <div 
                        key={slide.id}
                        className={`absolute inset-0 w-full h-full rounded-2xl p-6 border transition-all duration-700 ease-in-out flex flex-col justify-center shadow-sm ${slide.bg} ${slide.border}
                        ${index === currentHeroSlide ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-8 scale-95 z-0'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <p className={`text-xs font-bold uppercase tracking-widest ${index === 3 ? 'text-gray-400' : 'text-gray-500'}`}>{slide.label}</p>
                            <div className={`${index === 3 ? 'bg-white/20' : 'bg-white'} p-2 rounded-full shadow-sm`}>
                                {slide.icon}
                            </div>
                        </div>
                        <h2 className={`text-3xl font-black tracking-tight ${slide.text}`}>
                            {slide.value}
                        </h2>
                    </div>
                ))}
              </div>
              
              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-4">
                  {heroSlides.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${currentHeroSlide === idx ? 'w-6 bg-black' : 'w-1.5 bg-gray-200'}`}
                      />
                  ))}
              </div>
           </div>
        )}

        {/* Main Content */}
        <main className="flex-1 px-6 pb-28 overflow-y-auto no-scrollbar bg-transparent relative z-10 scroll-smooth">
          
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-300 space-y-6 pt-2">
              
              {/* Chart */}
              <div>
                  <h3 className="text-lg font-bold text-black mb-4 bg-white/80 inline-block px-2 rounded-lg backdrop-blur-sm">Onde você gastou</h3>
                  {chartData.length > 0 ? (
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-sm flex flex-col items-center">
                      <div className="w-full h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Saldo Total</span>
                            <span className="text-lg font-black text-black">R$ {totalBalance.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center mt-6">
                        {chartData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                <span className="text-xs font-bold text-gray-700">{entry.name}</span>
                            </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50/90 p-8 rounded-3xl border border-gray-100 text-center text-gray-400 backdrop-blur-sm">
                        <p>Nenhuma despesa registrada.</p>
                    </div>
                  )}
              </div>

              {/* Recent Transactions */}
              <div className="pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-black bg-white/80 px-2 rounded-lg backdrop-blur-sm">Atividade Recente</h3>
                  <button onClick={() => setActiveTab('expenses')} className="text-xs text-red-600 font-bold px-3 py-1 bg-red-50 rounded-full shadow-sm">Ver Extrato</button>
                </div>
                <div>
                  {transactions.slice(0, 3).map(t => (
                    <TransactionItem key={t.id} transaction={t} onDelete={handleDeleteTransaction} />
                  ))}
                  {transactions.length === 0 && (
                      <p className="text-center text-gray-400 text-sm py-4 bg-white/50 rounded-xl">Nenhuma transação ainda.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'income' && (
            <WalletView 
                transactions={transactions} 
                onDelete={handleDeleteTransaction} 
                viewMode="income" 
                onAddTransaction={() => openAddModal('income', true)}
            />
          )}

          {activeTab === 'expenses' && (
            <WalletView 
                transactions={transactions} 
                onDelete={handleDeleteTransaction} 
                viewMode="expense" 
                onAddTransaction={() => openAddModal('expense', true)}
            />
          )}

          {activeTab === 'motivation' && (
            <MotivationView 
                totalBalance={totalBalance} 
                totalIncome={totalIncome} 
                totalExpense={totalExpense} 
                goals={goals}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeTab === 'insights' && (
            <AIInsights transactions={transactions} />
          )}

        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 pt-3 flex justify-between items-center z-40 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-5px_15px_rgba(0,0,0,0.02)] overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col flex-1 items-center gap-1 p-2 min-w-[60px] rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-red-600 scale-105' : 'text-gray-400 active:scale-95'}`}
          >
            <LayoutDashboard size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-bold whitespace-nowrap">Início</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('income')}
            className={`flex flex-col flex-1 items-center gap-1 p-2 min-w-[60px] rounded-xl transition-all ${activeTab === 'income' ? 'text-red-600 scale-105' : 'text-gray-400 active:scale-95'}`}
          >
            <TrendingUp size={22} strokeWidth={activeTab === 'income' ? 2.5 : 2} />
            <span className="text-[10px] font-bold whitespace-nowrap">Receitas</span>
          </button>

          <button 
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col flex-1 items-center gap-1 p-2 min-w-[60px] rounded-xl transition-all ${activeTab === 'expenses' ? 'text-red-600 scale-105' : 'text-gray-400 active:scale-95'}`}
          >
            <TrendingDown size={22} strokeWidth={activeTab === 'expenses' ? 2.5 : 2} />
            <span className="text-[10px] font-bold whitespace-nowrap">Despesas</span>
          </button>

          <button 
            onClick={() => setActiveTab('motivation')}
            className={`flex flex-col flex-1 items-center gap-1 p-2 min-w-[60px] rounded-xl transition-all ${activeTab === 'motivation' ? 'text-red-600 scale-105' : 'text-gray-400 active:scale-95'}`}
          >
            <PiggyBank size={22} strokeWidth={activeTab === 'motivation' ? 2.5 : 2} />
            <span className="text-[10px] font-bold whitespace-nowrap">Guardar</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex flex-col flex-1 items-center gap-1 p-2 min-w-[60px] rounded-xl transition-all ${activeTab === 'insights' ? 'text-red-600 scale-105' : 'text-gray-400 active:scale-95'}`}
          >
            <Sparkles size={22} strokeWidth={activeTab === 'insights' ? 2.5 : 2} />
            <span className="text-[10px] font-bold whitespace-nowrap">Dicas</span>
          </button>
        </nav>

        {/* Modals */}
        <AddTransactionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onAdd={handleAddTransaction}
            defaultType={modalDefaultType}
            isTypeLocked={isModalLocked}
        />

      </div>
    </div>
  );
}