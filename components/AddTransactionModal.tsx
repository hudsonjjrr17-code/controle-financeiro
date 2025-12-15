import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TransactionType, Category, Transaction } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (amount: number, description: string, category: string, type: TransactionType) => void;
  onUpdate: (id: string, amount: number, description: string, category: string, type: TransactionType) => void;
  defaultType?: TransactionType;
  isTypeLocked?: boolean;
  editingTransaction?: Transaction | null;
}

const AddTransactionModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  onUpdate,
  defaultType = 'expense',
  isTypeLocked = false,
  editingTransaction = null
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(Category.FOOD);
  const [type, setType] = useState<TransactionType>(defaultType);

  // Reset or Load Data
  useEffect(() => {
    if (isOpen) {
        if (editingTransaction) {
            // Edit Mode
            setAmount(editingTransaction.amount.toString());
            setDescription(editingTransaction.description);
            setCategory(editingTransaction.category);
            setType(editingTransaction.type);
        } else {
            // Add Mode
            setType(defaultType);
            setAmount('');
            setDescription('');
            setCategory(Category.FOOD);
        }
    }
  }, [isOpen, defaultType, editingTransaction]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    // Logic for Simplified Income (No description/category required from user)
    const isIncome = type === 'income';
    const finalDescription = isIncome 
        ? (description || 'Nova Entrada') // Default description for income
        : description;
        
    const finalCategory = isIncome
        ? 'Receita' // Default category for income
        : category;

    if (!isIncome && !description) return; // Force description for expenses

    if (editingTransaction) {
        onUpdate(editingTransaction.id, parseFloat(amount), finalDescription, finalCategory, type);
    } else {
        onAdd(parseFloat(amount), finalDescription, finalCategory, type);
    }
    
    onClose();
  };

  const isIncome = type === 'income';
  const isEditing = !!editingTransaction;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
             {isEditing ? 'Editar Transação' : (isIncome ? 'Adicionar Valor' : 'Nova Despesa')}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Type Toggle - Only show if NOT locked and NOT editing */}
          {!isTypeLocked && !isEditing && (
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                onClick={() => setType('expense')}
                >
                Despesa
                </button>
                <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                onClick={() => setType('income')}
                >
                Receita
                </button>
            </div>
          )}

          {/* Amount Input - Always Visible */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full text-5xl font-black text-gray-900 placeholder-gray-200 border-none focus:ring-0 p-0 tracking-tight"
              autoFocus
            />
          </div>

          {/* Fields HIDDEN for Income, VISIBLE for Expense */}
          {!isIncome && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                    <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="ex: Almoço, Uber, Mercado..."
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
                    <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                    {Object.values(Category).map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                    </select>
                </div>
              </div>
          )}

          <button
            type="submit"
            className={`w-full py-4 text-white font-bold text-lg rounded-xl shadow-lg active:scale-95 transition-transform mt-4 ${isIncome ? 'bg-green-600 shadow-green-200' : 'bg-red-600 shadow-red-200'}`}
          >
            {isEditing ? 'Salvar Alterações' : (isIncome ? 'Confirmar Entrada' : 'Adicionar Despesa')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;