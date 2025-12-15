import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, Zap, Plus } from 'lucide-react';
import { generateMotivationalQuote } from '../services/geminiService';
import { SavingsGoal } from '../types';
import GoalModal from './GoalModal';

interface Props {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  goals: SavingsGoal[];
  onAddGoal: (goal: SavingsGoal) => void;
  onUpdateGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
}

const MotivationView: React.FC<Props> = ({ 
    totalBalance, 
    totalIncome, 
    totalExpense, 
    goals, 
    onAddGoal, 
    onUpdateGoal, 
    onDeleteGoal 
}) => {
  const [quote, setQuote] = useState<string>("Analisando seus hábitos...");
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  useEffect(() => {
    const fetchQuote = async () => {
      const q = await generateMotivationalQuote(totalBalance, savingsRate);
      setQuote(q);
    };
    fetchQuote();
  }, [totalBalance, savingsRate]);

  const handleEditClick = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (goal: SavingsGoal) => {
    if (selectedGoal) {
        onUpdateGoal(goal);
    } else {
        onAddGoal(goal);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* Hero Card - RED AND BLACK GRADIENT */}
      <div className="bg-gradient-to-br from-red-600 to-black rounded-3xl p-6 text-white shadow-xl shadow-red-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        <div className="flex items-start justify-between mb-4 relative z-10">
            <div>
                <h2 className="text-red-100 font-medium text-sm mb-1">Saldo Disponível</h2>
                <h1 className="text-3xl font-black">R$ {totalBalance.toFixed(2)}</h1>
            </div>
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                <TrendingUp size={24} className="text-white" />
            </div>
        </div>
        
        <div className="bg-black/30 rounded-xl p-4 backdrop-blur-md relative z-10 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">Motivação</span>
            </div>
            <p className="text-sm font-medium leading-relaxed italic">"{quote}"</p>
        </div>
      </div>

      {/* Savings Rate Gauge */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-black font-bold text-lg mb-4">Eficiência Mensal</h3>
        <div className="relative pt-2">
            <div className="flex items-end justify-between mb-2">
                <span className="text-sm text-gray-500 font-medium">Economia sobre Renda</span>
                <span className={`text-2xl font-bold ${savingsRate > 20 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.max(0, savingsRate).toFixed(1)}%
                </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${savingsRate > 20 ? 'bg-green-600' : 'bg-red-600'}`}
                    style={{ width: `${Math.min(Math.max(0, savingsRate), 100)}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
                {savingsRate > 20 
                    ? "Excelente! Você está no caminho certo para a liberdade financeira." 
                    : "Atenção! Tente reduzir gastos para aumentar sua reserva."}
            </p>
        </div>
      </div>

      {/* Goals List */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-black font-bold text-lg flex items-center gap-2">
            <Target className="text-red-600" size={20} />
            Metas de Economia
        </h3>
        <button 
            onClick={handleCreateClick}
            className="text-xs font-bold text-white bg-black px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
        >
            + Nova Meta
        </button>
      </div>
      
      <div className="space-y-4">
        {goals.length === 0 ? (
            <div className="text-center py-8 bg-white border border-dashed border-gray-200 rounded-2xl">
                <p className="text-gray-400 text-sm mb-2">Nenhuma meta definida ainda.</p>
                <button onClick={handleCreateClick} className="text-red-600 font-bold text-sm">Crie sua primeira meta</button>
            </div>
        ) : (
            goals.map(goal => {
                const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                return (
                    <div 
                        key={goal.id} 
                        onClick={() => handleEditClick(goal)}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-xl">
                            {goal.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-bold text-black text-sm">{goal.name}</h4>
                                <span className="text-xs font-bold text-gray-600">{percentage.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                    className="bg-red-600 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-gray-500 font-medium">R$ {goal.currentAmount} guardado</span>
                                <span className="text-[10px] text-gray-500">Alvo: R$ {goal.targetAmount}</span>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      <GoalModal 
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        onDelete={onDeleteGoal}
        existingGoal={selectedGoal}
      />

    </div>
  );
};

export default MotivationView;