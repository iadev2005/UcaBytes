import React, { useState, useEffect } from 'react';

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

// Función auxiliar para obtener el número de veces que se guardó un post
function getSavedCount(post: any): number {
  if (!post.insights || !post.insights.data) return 0;
  
  const savedInsight = post.insights.data.find((insight: any) =>
    insight.title === "Veces que se guardó"
  );
  
  return savedInsight && savedInsight.values && savedInsight.values[0]
    ? savedInsight.values[0].value
    : 0;
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
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  
  // Efecto para cargar las sugerencias al montar el componente
  useEffect(() => {
    // Solo cargar sugerencias si showSuggestions es true (que lo será por defecto)
    if (showSuggestions) {
      handleShowSuggestions();
    }
  }, []); // Array vacío para que solo se ejecute al montar el componente
  
  // Función para abrir el modal con los detalles del post
  const handleOpenPostModal = (post: any) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };
  
  // Función para cerrar el modal
  const handleClosePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
  };
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
              className="flex flex-col bg-white rounded-xl shadow-md w-full mb-6 cursor-pointer hover:shadow-lg transition-shadow"
              style={{ boxShadow: '0 4px 16px 0 rgba(31,38,135,0.10)' }}
              onClick={() => handleOpenPostModal(post)}
            >
              {/* Encabezado del post */}
              <div className="flex items-center p-3 border-b border-gray-100">
                <img
                  src="https://scontent.fccs11-2.fna.fbcdn.net/v/t51.82787-15/523364984_17847760164526720_6719431624113204233_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=7d201b&_nc_ohc=Jwva6KWDPW0Q7kNvwGFzX-V&_nc_oc=Adks6t3CwfGCiReMXFxiO7DmfzuDxpQCrSamaSOASlHSpfksGrEROkUqslW28Ev62nM&_nc_zt=23&_nc_ht=scontent.fccs11-2.fna&edm=AGaHXAAEAAAA&_nc_gid=qJA6BaZAO1sj-VfYGhyzfw&oh=00_AfSt5x4zmozukhttFkm6CpLrbfiSwq2Q7YyRjY3el49HRw&oe=6889B457"
                  alt="Foto de perfil"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="ml-2">
                  <p className="font-semibold text-sm">empr.esaprueba</p>
                  <p className="text-xs text-gray-500">Prueba</p>
                </div>
                <div className="ml-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
              </div>
              
              {/* Imagen del post */}
              <div className="w-full">
                <img
                  src={post.media_url || post.image || ''}
                  alt={post.caption || 'Instagram post'}
                  className="object-cover w-full"
                  style={{ maxHeight: '300px' }}
                />
              </div>
              
              {/* Iconos de interacción con contadores */}
              <div className="flex items-center p-3">
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="ml-1 text-sm">{post.like_count}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="ml-1 text-sm">{post.comments_count}</span>
                  </div>
                </div>
                <div className="ml-auto flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="ml-1 text-sm">{getSavedCount(post)}</span>
                </div>
              </div>
              
              {/* Caption */}
              <div className="px-3 pb-2">
                <p className="text-sm">
                  <span className="font-semibold">empr.esaprueba</span> {post.caption}
                </p>
                {post.comments_count > 0 && (
                  <p className="text-gray-500 text-sm mt-1">
                    Ver los {post.comments_count} comentarios
                  </p>
                )}
              </div>
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
      
      {/* Modal de detalles del post */}
      {showPostModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
            {/* Imagen del post (lado izquierdo en desktop) */}
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
              <img
                src={selectedPost.media_url || selectedPost.image || ''}
                alt={selectedPost.caption || 'Instagram post'}
                className="object-contain max-h-[70vh] w-full"
              />
            </div>
            
            {/* Detalles del post (lado derecho en desktop) */}
            <div className="w-full md:w-1/2 flex flex-col h-full">
              {/* Contenido y comentarios */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Botón de cerrar */}
                <div className="flex justify-end mb-4">
                  <button
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={handleClosePostModal}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Caption con foto de perfil y nombre de usuario */}
                <div className="flex mb-4">
                  <img
                    src="https://scontent.fccs11-2.fna.fbcdn.net/v/t51.82787-15/523364984_17847760164526720_6719431624113204233_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=7d201b&_nc_ohc=Jwva6KWDPW0Q7kNvwGFzX-V&_nc_oc=Adks6t3CwfGCiReMXFxiO7DmfzuDxpQCrSamaSOASlHSpfksGrEROkUqslW28Ev62nM&_nc_zt=23&_nc_ht=scontent.fccs11-2.fna&edm=AGaHXAAEAAAA&_nc_gid=qJA6BaZAO1sj-VfYGhyzfw&oh=00_AfSt5x4zmozukhttFkm6CpLrbfiSwq2Q7YyRjY3el49HRw&oe=6889B457"
                    alt="Foto de perfil"
                    className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">empr.esaprueba</span> {selectedPost.caption}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Hace 2 días</p>
                  </div>
                </div>
                
                {/* Comentarios */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-sm mb-3">Comentarios</h3>
                  
                  <div className="max-h-40 overflow-y-auto pr-2">
                    {selectedPost.comments && selectedPost.comments.data && selectedPost.comments.data.length > 0 ? (
                      selectedPost.comments.data.map((comment: any, index: number) => (
                        <div key={index} className="mb-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm">{comment.text}</p>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : 'Fecha desconocida'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No hay comentarios en esta publicación.</p>
                    )}
                  </div>
                </div>
                
                {/* Estadísticas */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-semibold text-sm mb-3">Estadísticas</h3>
                  
                  {selectedPost.insights && selectedPost.insights.data && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPost.insights.data.map((insight: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">{insight.title}</p>
                          <p className="text-lg font-semibold">
                            {insight.values && insight.values[0] ? insight.values[0].value : 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Iconos de interacción */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="ml-1 text-sm">{selectedPost.like_count}</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="ml-1 text-sm">{selectedPost.comments_count}</span>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="ml-1 text-sm">{getSavedCount(selectedPost)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}