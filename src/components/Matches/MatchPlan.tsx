import { useState } from 'react';
import { Presentation, Youtube } from 'lucide-react';

export default function MatchPlan() {
  const [slidesUrl, setSlidesUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId(youtubeUrl);

  // Extract src from iframe string if user pastes full iframe code
  const extractIframeSrc = (input: string) => {
    if (input.includes('<iframe')) {
      const match = input.match(/src="([^"]+)"/);
      return match ? match[1] : input;
    }
    return input;
  };

  const processedSlidesUrl = extractIframeSrc(slidesUrl);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full min-h-[600px]">
      {/* Google Slides Section */}
      <div className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-red-500">
          <Presentation size={20} />
          <h3 className="font-black uppercase tracking-widest text-sm">Presentación Táctica</h3>
        </div>
        
        <input
          type="text"
          value={slidesUrl}
          onChange={(e) => setSlidesUrl(e.target.value)}
          className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition-colors"
          placeholder="Pega el código de inserción o URL de Google Slides..."
        />

        <div className="flex-1 bg-brand-slate-950 rounded-2xl border border-brand-slate-800 overflow-hidden relative">
          {processedSlidesUrl ? (
            <iframe
              src={processedSlidesUrl}
              frameBorder="0"
              className="absolute inset-0 w-full h-full"
              allowFullScreen={true}
              mozallowfullscreen="true"
              webkitallowfullscreen="true"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-4">
              <Presentation size={48} />
              <span className="text-xs font-bold uppercase tracking-widest text-center px-6">
                Pega la URL de tu presentación táctica
              </span>
            </div>
          )}
        </div>
      </div>

      {/* YouTube Section */}
      <div className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-red-500">
          <Youtube size={20} />
          <h3 className="font-black uppercase tracking-widest text-sm">Video de Referencia</h3>
        </div>
        
        <input
          type="text"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition-colors"
          placeholder="Introduce la URL de YouTube..."
        />

        <div className="flex-1 bg-brand-slate-950 rounded-2xl border border-brand-slate-800 overflow-hidden relative">
          {youtubeId ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-4">
              <Youtube size={48} />
              <span className="text-xs font-bold uppercase tracking-widest text-center px-6">
                Añade un video de referencia
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
