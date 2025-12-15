import React from 'react';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, Coffee, Bus, Home, Film, Activity, DollarSign, Briefcase, ShoppingBag, Trash2, Pencil } from 'lucide-react';

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
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

const TransactionItem: React.FC<Props> = ({ transaction, onDelete, onEdit }) => {
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 mb-3 hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {getIcon(transaction.category)}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{transaction.description}</p>
          <p className="text-xs text-gray-500">{transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`font-bold text-sm ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>
          {isIncome ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
        </span>
        <div className="flex items-center gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button 
                onClick={() => onEdit(transaction)}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                title="Editar"
            >
                <Pencil size={14} />
            </button>
            <button 
                onClick={() => {
                    if(window.confirm('Excluir esta transação?')) onDelete(transaction.id);
                }}
                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                title="Excluir"
            >
                <Trash2 size={14} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;