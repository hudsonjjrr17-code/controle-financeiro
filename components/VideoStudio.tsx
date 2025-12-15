import React, { useState, useRef } from 'react';
import { Upload, Film, Play, Loader2, Download, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { generateVideo } from '../services/geminiService';

const VideoStudio: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit check
        setError("A imagem deve ter menos de 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Extract base64 and mime
        const base64 = result.split(',')[1];
        const mime = result.split(';')[0].split(':')[1];
        
        setImage(result); // For preview
        setMimeType(mime);
        setError(null);
        setVideoUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !mimeType) {
      setError("Por favor, selecione uma imagem.");
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      // Clean base64 for API (remove header)
      const base64Data = image.split(',')[1];
      
      const url = await generateVideo(
        base64Data, 
        mimeType, 
        prompt || "Animate this image cinematically with high quality motion", 
        aspectRatio
      );
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao gerar vídeo. Verifique sua conexão e API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setVideoUrl(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-black flex items-center gap-2">
            <Film className="text-red-600" />
            Veo Studio
          </h2>
          <p className="text-xs text-gray-500">Dê vida às suas fotos com IA</p>
        </div>
        {videoUrl && (
          <button onClick={handleReset} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
            Novo
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-4 flex items-center gap-2">
          <X size={16} />
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-lg shadow-gray-100/50">
        
        {!image ? (
          // UPLOAD STATE
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-100 group relative overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="absolute inset-0 bg-red-600/5 blur-3xl"></div>
            </div>
            <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform relative z-10">
              <Upload className="text-red-600" size={24} />
            </div>
            <p className="text-sm font-bold text-gray-900 relative z-10">Toque para enviar foto</p>
            <p className="text-xs text-gray-400 mt-1 relative z-10">JPG ou PNG</p>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </div>
        ) : !videoUrl && !loading ? (
          // PREVIEW & CONFIG STATE
          <div className="p-6">
            <div className="relative rounded-xl overflow-hidden mb-6 bg-black">
                <img src={image} alt="Preview" className="w-full h-48 object-contain opacity-80" />
                <button 
                    onClick={handleReset}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descrição (Prompt)</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Animar o logo com brilho dourado e movimento cinematográfico..."
                        className="w-full p-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-red-100 outline-none resize-none h-24"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Formato</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setAspectRatio('16:9')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${aspectRatio === '16:9' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                            16:9 (Paisagem)
                        </button>
                        <button 
                             onClick={() => setAspectRatio('9:16')}
                             className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${aspectRatio === '9:16' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                            9:16 (Stories)
                        </button>
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <Sparkles size={20} />
                    Gerar Vídeo
                </button>
            </div>
          </div>
        ) : loading ? (
          // LOADING STATE
          <div className="aspect-[4/5] flex flex-col items-center justify-center p-8 text-center bg-gray-900 text-white">
             <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse"></div>
                <Loader2 size={48} className="animate-spin text-red-500 relative z-10" />
             </div>
             <h3 className="text-xl font-bold mb-2">Criando Mágica...</h3>
             <p className="text-sm text-gray-400 max-w-[200px]">Isso pode levar alguns minutos. A IA está processando frame por frame.</p>
          </div>
        ) : (
          // RESULT STATE
          <div className="bg-black relative group">
             <video 
                src={videoUrl || ''} 
                controls 
                autoPlay 
                loop 
                className="w-full aspect-video object-contain"
             />
             <div className="p-4 bg-white">
                <a 
                    href={videoUrl || ''} 
                    download="video-veo.mp4"
                    target="_blank"
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <Download size={18} />
                    Baixar Vídeo
                </a>
                <p className="text-[10px] text-gray-400 text-center mt-3">Gerado com Veo 3.1 Preview</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStudio;
