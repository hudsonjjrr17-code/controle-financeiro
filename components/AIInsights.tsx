import React, { useEffect, useState } from 'react';
import { Transaction, FinancialInsight } from '../types';
import { generateFinancialInsights } from '../services/geminiService';
import { Sparkles, RefreshCcw, AlertTriangle, TrendingUp, Info } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const AIInsights: React.FC<Props> = ({ transactions }) => {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const data = await generateFinancialInsights(transactions);
    setInsights(data);
    setLoading(false);
    setHasLoaded(true);
  };

  useEffect(() => {
    // Auto-fetch on mount if never loaded, else user triggers manually
    if (!hasLoaded) {
      fetchInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="text-green-500" />;
      case 'warning': return <AlertTriangle className="text-orange-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-50 border-green-100';
      case 'warning': return 'bg-orange-50 border-orange-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          Dicas da IA (Gemini)
        </h2>
        <button 
          onClick={fetchInsights} 
          disabled={loading}
          className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:text-primary disabled:opacity-50"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-4">
           <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
           <p className="text-sm">Analisando suas finanças...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${getSentimentBg(insight.sentiment)}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getSentimentIcon(insight.sentiment)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{insight.advice}</p>
                </div>
              </div>
            </div>
          ))}
          {insights.length === 0 && !loading && (
             <p className="text-center text-gray-400 text-sm py-8">Nenhuma dica disponível. Tente adicionar mais transações.</p>
          )}
        </div>
      )}
      
      <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg mt-6">
        <h3 className="font-bold text-sm mb-1">Você sabia?</h3>
        <p className="text-xs opacity-90">Acompanhar pequenos gastos, como o cafezinho diário, pode ajudar a identificar para onde vai até 15% da sua renda.</p>
      </div>
    </div>
  );
};

export default AIInsights;