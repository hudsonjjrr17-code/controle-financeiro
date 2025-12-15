import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import TransactionItem from './TransactionItem';
import { Filter, ArrowDownCircle, ArrowUpCircle, Calendar, Plus } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  viewMode?: 'all' | 'income' | 'expense';
  onAddTransaction?: () => void;
}

type FilterType = 'all' | 'income' | 'expense';
type DateRangeType = 'all' | 'month' | 'week' | 'custom';

const WalletView: React.FC<Props> = ({ transactions, onDelete, onEdit, viewMode = 'all', onAddTransaction }) => {
  const [filter, setFilter] = useState<FilterType>(viewMode);
  const [dateRange, setDateRange] = useState<DateRangeType>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    setFilter(viewMode);
  }, [viewMode]);

  const isInDateRange = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();

    if (dateRange === 'all') return true;

    if (dateRange === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }

    if (dateRange === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return d >= sevenDaysAgo;
    }

    if (dateRange === 'custom') {
      if (!customStart && !customEnd) return true;
      
      const start = customStart ? new Date(customStart) : new Date('1970-01-01');
      start.setHours(0, 0, 0, 0);

      const end = customEnd ? new Date(customEnd) : new Date();
      end.setHours(23, 59, 59, 999);

      return d >= start && d <= end;
    }

    return true;
  };

  const filteredTransactions = transactions.filter(t => {
    if (!isInDateRange(t.date)) return false;
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const totalFiltered = filteredTransactions.reduce((acc, t) => {
      return acc + t.amount;
  }, 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">
                {filter === 'income' ? 'Entradas' : filter === 'expense' ? 'Saídas' : 'Histórico'}
            </h2>
            
            {viewMode === 'all' && (
                <div className="flex gap-2">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${filter === 'all' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                    >
                        Tudo
                    </button>
                    <button 
                        onClick={() => setFilter('income')}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${filter === 'income' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                    >
                        Entradas
                    </button>
                    <button 
                        onClick={() => setFilter('expense')}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${filter === 'expense' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                    >
                        Saídas
                    </button>
                </div>
            )}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
                onClick={() => setDateRange('all')}
                className={`flex items-center gap-1 flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${dateRange === 'all' ? 'bg-white border-black text-black shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}
            >
                <Calendar size={14} />
                Todo o Período
            </button>
            <button 
                onClick={() => setDateRange('month')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${dateRange === 'month' ? 'bg-white border-black text-black shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}
            >
                Este Mês
            </button>
            <button 
                onClick={() => setDateRange('week')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${dateRange === 'week' ? 'bg-white border-black text-black shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}
            >
                7 Dias
            </button>
            <button 
                onClick={() => setDateRange('custom')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${dateRange === 'custom' ? 'bg-white border-black text-black shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}
            >
                Data...
            </button>
        </div>

        {dateRange === 'custom' && (
            <div className="bg-gray-50 p-3 rounded-xl flex gap-2 animate-in slide-in-from-top-2 duration-200">
                <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">De</label>
                    <input 
                        type="date" 
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full bg-white border-none rounded-lg text-xs font-semibold text-gray-900 focus:ring-1 focus:ring-black h-8"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Até</label>
                    <input 
                        type="date" 
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full bg-white border-none rounded-lg text-xs font-semibold text-gray-900 focus:ring-1 focus:ring-black h-8"
                    />
                </div>
            </div>
        )}
      </div>

      {filter !== 'all' && (
          <div className={`p-6 rounded-2xl mb-4 shadow-sm flex items-center justify-between border ${filter === 'income' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div>
                  <p className="text-xs font-bold opacity-60 uppercase tracking-wide text-gray-800">
                      Total {filter === 'income' ? 'Recebido' : 'Gasto'}
                  </p>
                  <p className={`text-2xl font-black ${filter === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                      R$ {totalFiltered.toFixed(2)}
                  </p>
              </div>
              <div className={`p-3 rounded-full ${filter === 'income' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {filter === 'income' ? <ArrowDownCircle size={24} /> : <ArrowUpCircle size={24} />}
              </div>
          </div>
      )}
      
      {filter === 'all' && filteredTransactions.length > 0 && (
          <div className="p-4 rounded-2xl mb-4 bg-gray-50 border border-gray-100 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Movimentado no Período</p>
                  <p className="text-xl font-bold text-gray-900">R$ {totalFiltered.toFixed(2)}</p>
               </div>
          </div>
      )}

      {/* Add Button Logic - Only show if not generic view or if specific handler provided */}
      {viewMode !== 'all' && onAddTransaction && (
         <button
            onClick={onAddTransaction}
            className={`w-full py-3 rounded-xl mb-6 flex items-center justify-center gap-2 font-bold text-white shadow-lg active:scale-95 transition-transform ${viewMode === 'income' ? 'bg-green-600 shadow-green-200' : 'bg-red-600 shadow-red-200'}`}
         >
            <Plus size={20} strokeWidth={3} />
            {viewMode === 'income' ? 'Nova Receita' : 'Nova Despesa'}
         </button>
      )}

      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
                <Filter size={40} className="mx-auto mb-3 opacity-20" />
                <p>Nenhuma transação encontrada neste período.</p>
            </div>
        ) : (
            filteredTransactions.map(t => (
                <TransactionItem key={t.id} transaction={t} onDelete={onDelete} onEdit={onEdit} />
            ))
        )}
      </div>
    </div>
  );
};

export default WalletView;