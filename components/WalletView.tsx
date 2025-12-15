import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import TransactionItem from './TransactionItem';
import { ArrowDownCircle, ArrowUpCircle, Calendar, Filter } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onAddTransaction: () => void;
}

type FilterType = 'all' | 'income' | 'expense';

const WalletView: React.FC<Props> = ({ transactions, onDelete, onEdit, onAddTransaction }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter Logic
  const filteredList = useMemo(() => {
    return transactions
        .filter(t => filter === 'all' ? true : t.type === filter)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter]);

  const totalFiltered = filteredList.reduce((acc, t) => acc + t.amount, 0);

  // Grouping Logic (Professional Feature)
  const groupedTransactions = useMemo(() => {
      const groups: Record<string, Transaction[]> = {};
      const today = new Date().toLocaleDateString('pt-BR');
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('pt-BR');

      filteredList.forEach(t => {
          const dateKey = new Date(t.date).toLocaleDateString('pt-BR');
          let label = dateKey;
          if (dateKey === today) label = 'Hoje';
          else if (dateKey === yesterday) label = 'Ontem';
          
          if (!groups[label]) groups[label] = [];
          groups[label].push(t);
      });
      return groups;
  }, [filteredList]);

  return (
    <div className="px-6 pt-4 pb-20 animate-in fade-in duration-300">
      
      {/* Title & Filter Header */}
      <div className="flex flex-col gap-4 mb-6 bg-white sticky top-0 z-10 pb-2">
        <h2 className="text-2xl font-black text-gray-900">Extrato</h2>
        
        {/* Modern Segmented Control */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
            <button 
                onClick={() => setFilter('all')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
            >
                Tudo
            </button>
            <button 
                onClick={() => setFilter('income')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'income' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
            >
                Entradas
            </button>
            <button 
                onClick={() => setFilter('expense')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
            >
                Saídas
            </button>
        </div>
      </div>

      {/* Summary Card for Filtered View */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                  {filter === 'income' ? 'Total Recebido' : filter === 'expense' ? 'Total Gasto' : 'Movimentação'}
              </p>
              <p className={`text-xl font-black ${filter === 'income' ? 'text-green-600' : filter === 'expense' ? 'text-red-600' : 'text-gray-900'}`}>
                  R$ {totalFiltered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
          </div>
          <div className="bg-gray-50 p-2 rounded-full text-gray-400">
              <Filter size={18} />
          </div>
      </div>

      {/* Transaction List Grouped by Date */}
      {Object.keys(groupedTransactions).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
              <Calendar size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nenhuma transação encontrada.</p>
          </div>
      ) : (
          <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([dateLabel, items]: [string, Transaction[]]) => (
                  <div key={dateLabel}>
                      <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1 tracking-wider sticky top-12">{dateLabel}</h3>
                      <div className="space-y-3">
                          {items.map(t => (
                              <TransactionItem key={t.id} transaction={t} onDelete={onDelete} onEdit={onEdit} />
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default WalletView;