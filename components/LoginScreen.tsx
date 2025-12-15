import React, { useState } from 'react';
import { DollarSign, ArrowRight, ShieldCheck, Lock, User, Download, Smartphone } from 'lucide-react';
import { UserProfile } from '../types';
import { Capacitor } from '@capacitor/core';

interface Props {
  onLogin: (name: string, password: string) => void;
  existingUser: UserProfile | null;
}

const LoginScreen: React.FC<Props> = ({ onLogin, existingUser }) => {
  const [name, setName] = useState(existingUser?.name || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isRegistering = !existingUser;
  // Check if running on Web (Vercel) or Native (Android app)
  const isWeb = !Capacitor.isNativePlatform();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering && !name.trim()) {
      setError('Por favor, digite seu nome.');
      return;
    }

    if (!password.trim()) {
      setError('Por favor, digite sua senha.');
      return;
    }

    if (password.length < 4) {
        setError('A senha deve ter pelo menos 4 caracteres.');
        return;
    }

    onLogin(name.trim(), password.trim());
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-20%] opacity-5 pointer-events-none">
        <DollarSign size={400} className="text-red-600 rotate-12" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-red-100">
                <span className="text-white font-bold text-xl">CF</span>
            </div>
            
            {isRegistering ? (
                <>
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                    Criar <br/> <span className="text-red-600">Conta</span>
                    </h1>
                    <p className="text-gray-500 font-medium">
                    Comece a controlar suas finanças hoje mesmo.
                    </p>
                </>
            ) : (
                <>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                    Bem-vindo, <br/> <span className="text-red-600">{existingUser.name}</span>
                    </h1>
                    <p className="text-gray-500 font-medium">
                    Digite sua senha para acessar.
                    </p>
                </>
            )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Input - Only show if registering */}
          {isRegistering && (
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Nome
                </label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full p-4 pl-12 bg-gray-50 rounded-xl text-lg font-bold text-gray-900 border-2 border-transparent focus:border-red-600 focus:bg-white outline-none transition-all placeholder:font-normal placeholder:text-gray-300"
                    />
                </div>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Senha
            </label>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                type="password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                }}
                placeholder="******"
                className="w-full p-4 pl-12 bg-gray-50 rounded-xl text-lg font-bold text-gray-900 border-2 border-transparent focus:border-red-600 focus:bg-white outline-none transition-all placeholder:font-normal placeholder:text-gray-300"
                />
            </div>
            {error && <p className="text-red-500 text-xs mt-2 font-bold ml-1 animate-pulse">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2 group mt-4"
          >
            {isRegistering ? 'Criar Acesso' : 'Entrar'}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {!isRegistering && (
             <button 
                type="button"
                onClick={() => {
                    if(window.confirm('Isso apagará todos os seus dados deste celular. Tem certeza?')) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }}
                className="w-full py-2 text-gray-400 text-xs font-medium hover:text-red-500 transition-colors"
             >
                Esqueci minha senha / Resetar App
             </button>
          )}
        </form>

        {/* APK Download Button - Only visible on Web */}
        {isWeb && (
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                <a 
                    href="/app.apk" 
                    download="ControleFinanceiro.apk"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors group"
                >
                    <div className="bg-green-100 p-2 rounded-lg text-green-700 group-hover:scale-110 transition-transform">
                        <Smartphone size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm">Baixar App para Android</h4>
                        <p className="text-[10px] text-gray-500 leading-tight">Instale e use offline (.apk)</p>
                    </div>
                    <Download size={20} className="text-gray-400" />
                </a>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                    Nota: Ao instalar, permita "Fontes Desconhecidas" nas configurações.
                </p>
            </div>
        )}
      </div>

      <div className="p-6 text-center z-10">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck size={12} />
            Seus dados são criptografados localmente.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;