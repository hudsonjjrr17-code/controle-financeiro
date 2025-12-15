import React from 'react';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, Coffee, Bus, Home, Film, Activity, DollarSign, Briefcase, ShoppingBag } from 'lucide-react';

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

const getIcon = (category: string) => {
  // Map Portuguese categories to Icons
  if (category.includes('Alimentação')) return <Coffee size={18} />;
  if (category.includes('Transporte')) return <Bus size={18} />;
  if (category.includes('Moradia')) return <Home size={18} />;
  if (category.includes('Lazer')) return <Film size={18} />;
  if (category.includes('Saúde')) return <Activity size={18} />;
  if (category.includes('Salário')) return <DollarSign size={18} />;
  if (category.includes('Renda') || category.includes('Freelance')) return <Briefcase size={18} />;
  return <ShoppingBag size={18} />;
};

const TransactionItem: React.FC<Props> = ({ transaction, onDelete }) => {
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {getIcon(transaction.category)}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{transaction.description}</p>
          <p className="text-xs text-gray-500">{transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className={`font-bold text-sm ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>
          {isIncome ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
        </span>
        <button 
            onClick={() => onDelete(transaction.id)}
            className="text-xs text-gray-400 mt-1 hover:text-red-500"
        >
            Excluir
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;