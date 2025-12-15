import React from 'react';
import { Transaction } from '../types';
import { Coffee, Bus, Home, Film, Activity, DollarSign, Briefcase, ShoppingBag, Trash2, Pencil, Smartphone, Zap } from 'lucide-react';

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const getIcon = (category: string) => {
  if (category.includes('Alimentação')) return <Coffee size={16} />;
  if (category.includes('Transporte')) return <Bus size={16} />;
  if (category.includes('Moradia')) return <Home size={16} />;
  if (category.includes('Lazer')) return <Film size={16} />;
  if (category.includes('Saúde')) return <Activity size={16} />;
  if (category.includes('Salário')) return <DollarSign size={16} />;
  if (category.includes('Renda')) return <Briefcase size={16} />;
  if (category.includes('Outros')) return <Zap size={16} />;
  return <ShoppingBag size={16} />;
};

const TransactionItem: React.FC<Props> = ({ transaction, onDelete, onEdit }) => {
  const isIncome = transaction.type === 'income';

  return (
    <div className="group flex items-center justify-between p-3 bg-white rounded-xl border border-transparent hover:border-gray-100 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3">
        {/* Icon Container */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {getIcon(transaction.category)}
        </div>
        
        {/* Text */}
        <div className="overflow-hidden">
          <p className="font-bold text-gray-900 text-sm truncate pr-2">{transaction.description}</p>
          <p className="text-[11px] text-gray-400 font-medium truncate">{transaction.category}</p>
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`font-bold text-sm ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>
          {isIncome ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
        
        {/* Hidden Actions that appear on hover/touch */}
        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={() => onEdit(transaction)} className="text-gray-400 hover:text-blue-600">
                <Pencil size={12} />
             </button>
             <button onClick={() => { if(window.confirm('Excluir?')) onDelete(transaction.id); }} className="text-gray-400 hover:text-red-600">
                <Trash2 size={12} />
             </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;