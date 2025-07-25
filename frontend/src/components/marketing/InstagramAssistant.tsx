import React, { useState } from 'react';

interface InstagramAssistantProps {
  posts: any[] | null;
  isSidebarCollapsed?: boolean;
}

function formatDateDMYHM(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const dmy = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const hm = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${dmy} ${hm}`;
}

export default function InstagramAssistant({ posts, isSidebarCollapsed }: InstagramAssistantProps) {
  const [showScheduled, setShowScheduled] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [showAddPost, setShowAddPost] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
        setImageUrl('');
      };
      reader.readAsDataURL(file);
    }
  };
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setImagePreview(e.target.value ? e.target.value : null);
  };

  const handleShowScheduled = async () => {
    setLoadingScheduled(true);
    try {
      const res = await fetch('http://localhost:3001/api/instagram/scheduled-posts');
      const data = await res.json();
      setScheduledPosts(data);
      setShowScheduled(true);
    } catch (e) {
      alert('Error al cargar posts programados');
    }
    setLoadingScheduled(false);
  };

  const handleDeleteScheduled = async (creation_id: string) => {
    try {
      await fetch(`http://localhost:3001/api/instagram/scheduled-posts/${creation_id}`, { method: 'DELETE' });
      setScheduledPosts(scheduledPosts.filter(post => String(post.creation_id) !== String(creation_id)));
    } catch (e) {
      alert('Error al eliminar publicación programada');
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishMsg(null);
    if (!imagePreview && !imageUrl) {
      setPublishMsg('Debes ingresar o arrastrar una imagen.');
      setPublishing(false);
      return;
    }
    if (imageError) {
      setPublishMsg(imageError);
      setPublishing(false);
      return;
    }
    if (!caption.trim()) {
      setPublishMsg('El caption es obligatorio.');
      setPublishing(false);
      return;
    }
    if ((date && !time) || (!date && time)) {
      setPublishMsg('Debes ingresar tanto fecha como hora para programar la publicación.');
      setPublishing(false);
      return;
    }
    try {
      let endpoint = 'http://localhost:3001/api/instagram/create-post';
      let body: any = {
        image_url: imagePreview || imageUrl,
        caption: caption.trim(),
      };
      if (date && time) {
        endpoint = 'http://localhost:3001/api/instagram/schedule-post';
        body.date = date;
        body.time = time;
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setPublishMsg(date && time ? '¡Publicación programada con éxito!' : '¡Publicación realizada con éxito!');
        setImageUrl('');
        setImagePreview(null);
        setCaption('');
        setDate('');
        setTime('');
      } else {
        setPublishMsg(data.error || 'Error al publicar.');
      }
    } catch (e) {
      setPublishMsg('Error de red o backend.');
    }
    setPublishing(false);
  };

  const handleShowSuggestions = async () => {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    setSuggestions(null);
    try {
      // Pedimos sugerencias concisas
      const res = await fetch('http://localhost:3001/api/instagram/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concise: true })
      });
      const data = await res.json();
      setSuggestions(data.suggestions || 'No se recibieron sugerencias.');
    } catch (e) {
      setSuggestions('Error al obtener sugerencias de IA.');
    }
    setLoadingSuggestions(false);
  };

  function cleanSuggestions(text: string) {
    // Elimina asteriscos y encabezados tipo '**Overall Assessment:**'
    return text
      .replace(/\*\*[^\*]+\*\*:?/g, '') // elimina encabezados en negrita
      .replace(/\*/g, '') // elimina asteriscos sueltos
      .replace(/\n{2,}/g, '\n') // elimina saltos de línea extra
      .trim();
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-row items-start p-8 gap-8 h-screen w-full overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-0">
        <div className="px-6 pt-6 pb-3 border-b">
          <h2 className="text-xl font-semibold text-[var(--color-primary-700)] text-center mx-auto">Últimos posts</h2>
        </div>
        <div className="flex flex-col gap-6 px-6 pb-6 pt-3 h-[80vh] overflow-y-auto custom-scrollbar">
          {!posts && <div className="text-center text-gray-500">Cargando publicaciones...</div>}
          {posts && posts.length === 0 && <div className="text-center text-gray-500">No hay publicaciones.</div>}
          {posts && posts.map(post => (
            <div
              key={post.id}
              className="flex flex-col items-center bg-white rounded-xl shadow-md p-3 pt-3 pb-6 w-full polaroid-post"
              style={{ boxShadow: '0 4px 16px 0 rgba(31,38,135,0.10)' }}
            >
              <div className="bg-white rounded-md overflow-hidden w-full flex justify-center" style={{ padding: '8px 8px 24px 8px' }}>
                <img
                  src={post.media_url || post.image || ''}
                  alt={post.caption || 'Instagram post'}
                  className="object-cover rounded-md w-full h-56"
                  style={{ boxShadow: '0 2px 8px 0 rgba(31,38,135,0.08)' }}
                />
              </div>
              <p className="text-gray-700 text-center mt-2 text-base font-medium w-full" style={{ minHeight: '2.5em' }}>{post.caption}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col min-w-[480px] pt-6 ml-12">
        <div className={`flex flex-row gap-4${isSidebarCollapsed ? ' ml-27' : ''}`}>
          <div className="flex flex-col min-w-[160px]">
            <button className="bg-[var(--color-secondary-600)] text-white rounded-lg px-4 py-2 text-base font-medium shadow hover:bg-[var(--color-secondary-700)] transition-colors cursor-pointer" onClick={() => { setShowAddPost(true); setShowScheduled(false); setShowSuggestions(false); }}>Agregar post</button>
          </div>
          <div className="flex flex-col min-w-[160px]">
            <button className="bg-[var(--color-secondary-600)] text-white rounded-lg px-4 py-2 text-base font-medium shadow hover:bg-[var(--color-secondary-700)] transition-colors cursor-pointer" onClick={() => { setShowSuggestions(true); setShowAddPost(false); setShowScheduled(false); handleShowSuggestions(); }}>Sugerencias (IA)</button>
          </div>
          <div className="flex flex-col min-w-[160px]">
            <button onClick={() => { setShowScheduled(true); setShowAddPost(false); setShowSuggestions(false); handleShowScheduled(); }} className="bg-[var(--color-secondary-600)] text-white rounded-lg px-4 py-2 text-base font-medium shadow hover:bg-[var(--color-secondary-700)] transition-colors cursor-pointer mb-4">Ver programación</button>
          </div>
        </div>
        {/* Bloque debajo de los botones: inputs o lista */}
        <div className="mt-8">
          {/* Sugerencias IA */}
          {showSuggestions && !showAddPost && !showScheduled && (
            <div className={`mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl h-[73vh] flex items-center justify-center max-w-[650px] w-full${isSidebarCollapsed ? ' ml-8' : ''}`}>
              {loadingSuggestions ? (
                <div className="text-gray-500 w-full text-center">Cargando sugerencias...</div>
              ) : suggestions ? (
                <div className="whitespace-pre-line text-gray-700 text-sm w-full h-full overflow-y-auto text-left px-2 min-h-[1.5em]">{cleanSuggestions(suggestions)}</div>
              ) : null}
            </div>
          )}
          {showAddPost && !showScheduled && !showSuggestions ? (
            <form className={`flex flex-col gap-4 w-full${isSidebarCollapsed ? ' ml-13' : ''}`} onSubmit={e => { e.preventDefault(); handlePublish(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                <div
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg px-3 py-6 text-center cursor-pointer hover:border-[var(--color-primary-700)] transition-colors mb-2 bg-gray-50"
                  onDrop={handleImageDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="mx-auto max-h-40 rounded mb-2" />
                  ) : (
                    <span className="text-gray-400">Arrastra una imagen aquí o ingresa la URL abajo</span>
                  )}
                </div>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)] resize-none"
                  rows={3}
                  placeholder="Escribe el caption..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de publicación (opcional)</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora (opcional)</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">Si no se especifica fecha y hora, la publicación se realizará inmediatamente.</div>
              {publishMsg && <div className={`text-center text-sm mt-2 ${publishMsg.includes('éxito') ? 'text-green-600' : 'text-red-600'}`}>{publishMsg}</div>}
              <div className="flex gap-2 mt-4 justify-center">
                <button type="submit" className="bg-[var(--color-secondary-600)] text-white rounded-lg px-4 py-2 font-semibold shadow hover:bg-[var(--color-secondary-700)] transition-colors" disabled={publishing}>{publishing ? 'Publicando...' : 'Publicar'}</button>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-semibold shadow hover:bg-gray-300 transition-colors"
                  onClick={() => {
                    setImageUrl('');
                    setImagePreview(null);
                    setCaption('');
                    setDate('');
                    setTime('');
                    setPublishMsg(null);
                    setImageError(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : showScheduled && !showAddPost && !showSuggestions ? (
            loadingScheduled ? (
              <div className={`text-gray-500${isSidebarCollapsed ? ' ml-16' : ''}`}>Cargando...</div>
            ) : scheduledPosts.length === 0 ? (
              <div className={`text-gray-500${isSidebarCollapsed ? ' ml-16' : ''}`}>No hay publicaciones programadas.</div>
            ) : (
              <div className={isSidebarCollapsed ? 'ml-16' : ''}>
                {scheduledPosts.map((post, idx) => (
                  <div key={idx} className="mb-6 group relative">
                    <button
                      className="absolute top-0 right-0 text-gray-400 hover:text-red-500 text-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar publicación"
                      onClick={() => handleDeleteScheduled(post.creation_id)}
                    >×</button>
                    <div className="font-normal text-lg text-gray-700">
                      Próximo post programado: {formatDateDMYHM(post.scheduled_time)} - "{post.caption}"
                    </div>
                    {idx < scheduledPosts.length - 1 && <hr className="my-4 border-gray-200" />}
                  </div>
                ))}
              </div>
            )
          ) : null}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e0e0e0;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #e0e0e0 transparent;
        }
      `}</style>
    </div>
  );
}