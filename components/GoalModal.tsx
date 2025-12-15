import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { SavingsGoal } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: SavingsGoal) => void;
  onDelete?: (id: string) => void;
  existingGoal?: SavingsGoal | null;
}

const ICONS = ['💰', '🏝️', '🚗', '🏠', '💻', '🎓', '🚑', '💍', '👶', '🎸'];

const GoalModal: React.FC<Props> = ({ isOpen, onClose, onSave, onDelete, existingGoal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (existingGoal) {
      setName(existingGoal.name);
      setTargetAmount(existingGoal.targetAmount.toString());
      setCurrentAmount(existingGoal.currentAmount.toString());
      setIcon(existingGoal.icon);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setIcon(ICONS[0]);
    }
  }, [existingGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    onSave({
      id: existingGoal ? existingGoal.id : Date.now().toString(),
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      icon
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {existingGoal ? 'Editar Meta' : 'Nova Meta'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Escolha um Ícone</label>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-xl transition-all ${icon === i ? 'bg-primary text-white scale-110' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nome da Meta</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Carro Novo"
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Alvo (R$)</label>
                <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0,00"
                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none"
                required
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Guardado (R$)</label>
                <input
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0,00"
                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none"
                />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {existingGoal && onDelete && (
                <button
                    type="button"
                    onClick={() => { onDelete(existingGoal.id); onClose(); }}
                    className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                >
                    <Trash2 size={20} />
                </button>
            )}
            <button
                type="submit"
                className="flex-1 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
                <Save size={20} />
                Salvar Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;