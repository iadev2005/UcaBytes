import React, { useState, useEffect, useRef } from 'react';

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
  const [imageUrls, setImageUrls] = useState<string[]>(['']); // Array de URLs de imágenes
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Array de previews
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [postImageIndices, setPostImageIndices] = useState<{[key: string]: number}>({});
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [viewMode, setViewMode] = useState<'posts' | 'stories'>('posts');
  const [showStories, setShowStories] = useState(false);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [storyMediaUrl, setStoryMediaUrl] = useState('');
  const [storyPreview, setStoryPreview] = useState('');
  const [publishingStory, setPublishingStory] = useState(false);
  const [storyPublishMsg, setStoryPublishMsg] = useState<string | null>(null);
  
  // Ejecutar script de historias cuando se carga el componente
  useEffect(() => {
    const updateStories = async () => {
      try {
        console.log('Actualizando historias de Instagram al cargar el componente...');
        const updateResponse = await fetch('http://localhost:3001/api/instagram/update-stories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (updateResponse.ok) {
          console.log('Historias actualizadas exitosamente al cargar el componente');
        } else {
          console.error('Error al actualizar historias al cargar el componente');
        }
      } catch (error) {
        console.error('Error ejecutando script de historias:', error);
      }
    };
    
    updateStories();
  }, []);
  
  // Función para detectar si una URL es de video
  const isVideoUrl = (url: string): boolean => {
    return url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) !== null || 
           url.includes('video') || 
           url.includes('reel');
  };

  // Componente de video estilo Instagram
  const InstagramVideo = ({ src, className, style, showControls = true, isPreview = false }: { 
    src: string; 
    className?: string; 
    style?: React.CSSProperties; 
    showControls?: boolean;
    isPreview?: boolean;
  }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(!isPreview); // En vista previa, no muted por defecto
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handlePlayPause = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (videoRef.current) {
        try {
          if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          } else {
            await videoRef.current.play();
            setIsPlaying(true);
          }
        } catch (err) {
          console.error('Error al reproducir video:', err);
          setError('No se pudo reproducir el video');
        }
      }
    };

    const handleMuteToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    const handleTimeUpdate = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <div 
        className={`relative group instagram-video ${className}`} 
        style={style}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setError('Error al cargar el video')}
          muted={isMuted}
          loop
          preload="metadata"
          playsInline
        />
        
        {showControls && (
          <>
            {/* Overlay de reproducción/pausa - estilo Instagram */}
            <div 
              className={`absolute inset-0 flex items-center justify-center cursor-pointer ${isPreview ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} video-hover`}
              onClick={handlePlayPause}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className={`bg-black/60 backdrop-blur-sm rounded-full shadow-lg ${isPreview ? 'p-2' : 'p-4'}`}>
                {isPlaying ? (
                  <svg className={`text-white ${isPreview ? 'w-6 h-6' : 'w-10 h-10'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className={`text-white ${isPreview ? 'w-6 h-6' : 'w-10 h-10'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Controles inferiores - estilo Instagram */}
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent ${isPreview ? 'opacity-100 p-2' : 'opacity-0 group-hover:opacity-100 p-4'} video-hover`}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Barra de progreso */}
              <div 
                className={`w-full bg-white/20 rounded-full mb-2 ${isPreview ? 'h-1' : 'h-1.5 mb-3'}`}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div 
                  className={`bg-white rounded-full transition-all duration-200 ${isPreview ? 'h-1' : 'h-1.5'}`}
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              
              {/* Controles de tiempo y volumen - solo mostrar en vistas grandes */}
              {!isPreview && (
                <div className="flex items-center justify-between text-white text-sm font-medium">
                  <span className="font-mono">{formatTime(currentTime)}</span>
                  <div className="flex items-center gap-3">
                                      <button
                    onClick={handleMuteToggle}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="hover:opacity-80 transition-opacity p-1"
                  >
                      {isMuted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      )}
                    </button>
                    <span className="font-mono">{formatTime(duration)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Indicador de video en la esquina - estilo Instagram */}
            <div className={`absolute bg-black/80 backdrop-blur-sm text-white rounded-lg font-semibold tracking-wide ${isPreview ? 'top-1 left-1 px-1.5 py-0.5 text-xs' : 'top-3 left-3 px-2.5 py-1.5 text-xs'}`}>
              VIDEO
            </div>

            {/* Indicador de error */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  
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
    // Si es un carrusel, usar el índice actual de la vista previa
    if ((post.media_type === 'CAROUSEL' || post.media_type === 'CAROUSEL_ALBUM') && getCarouselImages(post).length > 0) {
      const currentIndex = postImageIndices[post.id] || 0;
      setCurrentImageIndex(currentIndex);
    } else {
      setCurrentImageIndex(0);
    }
    setShowPostModal(true);
  };
  
  // Función para cerrar el modal
  const handleClosePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
    setCurrentImageIndex(0);
  };
  
  // Función para obtener las imágenes del carrusel (maneja ambos formatos)
  const getCarouselImages = (post: any) => {
    if (post.children) {
      // Si children es un array directo (nuestros posts creados)
      if (Array.isArray(post.children)) {
        return post.children;
      }
      // Si children es un objeto con data (posts de la API de Instagram)
      if (post.children.data && Array.isArray(post.children.data)) {
        return post.children.data;
      }
    }
    return [];
  };
  
  // Función para navegar a la siguiente imagen del carrusel
  const handleNextImage = () => {
    const images = getCarouselImages(selectedPost);
    if (images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };
  
  // Función para navegar a la imagen anterior del carrusel
  const handlePrevImage = () => {
    const images = getCarouselImages(selectedPost);
    if (images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };
  
  // Función para navegar a la siguiente imagen en la vista previa
  const handleNextPreviewImage = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se abra el modal
    const post = posts?.find(p => p.id === postId);
    if (post) {
      const images = getCarouselImages(post);
      if (images.length > 1) {
        setPostImageIndices(prev => {
          const currentIndex = prev[postId] || 0;
          const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
          return { ...prev, [postId]: nextIndex };
        });
      }
    }
  };
  
  // Función para navegar a la imagen anterior en la vista previa
  const handlePrevPreviewImage = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se abra el modal
    const post = posts?.find(p => p.id === postId);
    if (post) {
      const images = getCarouselImages(post);
      if (images.length > 1) {
        setPostImageIndices(prev => {
          const currentIndex = prev[postId] || 0;
          const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
          return { ...prev, [postId]: prevIndex };
        });
      }
    }
  };
  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newPreview = ev.target?.result as string;
        setImagePreviews([newPreview]);
        setImageUrls(['']);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    
    const newPreviews = [...imagePreviews];
    newPreviews[index] = value ? value : '';
    setImagePreviews(newPreviews);
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
    setImagePreviews([...imagePreviews, '']);
  };

  const removeImageUrl = (index: number) => {
    if (imageUrls.length > 1) {
      const newUrls = imageUrls.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImageUrls(newUrls);
      setImagePreviews(newPreviews);
    }
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
    
    // Filtrar URLs válidas
    const validUrls = imageUrls.filter(url => url.trim() !== '');
    const validPreviews = imagePreviews.filter(preview => preview !== '');
    
    if (validUrls.length === 0 && validPreviews.length === 0) {
      setPublishMsg('Debes ingresar al menos una URL de imagen o video.');
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
      // Detectar automáticamente si es video basándose en la URL
      const firstUrl = validUrls[0] || validPreviews[0];
      const isVideo = firstUrl.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) || 
                     firstUrl.includes('video') || 
                     firstUrl.includes('reel');
      
      let endpoint = '';
      let body: any = {
        caption: caption.trim(),
      };
      
      // Verificar si es carrusel (múltiples URLs)
      const isCarousel = validUrls.length > 1 || validPreviews.length > 1;
      
      if (isCarousel) {
        // Es un carrusel (puede ser mixto o solo imágenes)
        const hasVideos = validUrls.some(url => 
          url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) || 
          url.includes('video') || 
          url.includes('reel')
        );
        
        const hasImages = validUrls.some(url => 
          !url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) && 
          !url.includes('video') && 
          !url.includes('reel')
        );
        
        if (hasVideos && hasImages) {
          // Carrusel mixto
          endpoint = 'http://localhost:3001/api/instagram/create-mixed-carousel';
          body.media_urls = validUrls.filter(url => url.trim() !== '');
        } else if (hasVideos) {
          // Carrusel solo videos
          endpoint = 'http://localhost:3001/api/instagram/create-mixed-carousel';
          body.media_urls = validUrls.filter(url => url.trim() !== '');
        } else {
          // Carrusel solo imágenes
          endpoint = 'http://localhost:3001/api/instagram/create-carousel';
          body.image_urls = validUrls.filter(url => url.trim() !== '');
        }
      } else if (isVideo) {
        // Es un video individual
        endpoint = 'http://localhost:3001/api/instagram/create-video';
        body.video_url = firstUrl;
        
        if (date && time) {
          setPublishMsg('La programación de videos no está disponible aún.');
          setPublishing(false);
          return;
        }
      } else {
        // Post simple de imagen
        endpoint = 'http://localhost:3001/api/instagram/create-post';
        body.image_url = firstUrl;
      }
      
      // Manejar programación si se especificó fecha y hora
      if (date && time) {
        const isCarouselForScheduling = validUrls.length > 1 || validPreviews.length > 1;
        endpoint = isCarouselForScheduling 
          ? 'http://localhost:3001/api/instagram/schedule-carousel'
          : 'http://localhost:3001/api/instagram/schedule-post';
        body.date = date;
        body.time = time;
      }
      
      console.log('Frontend enviando:', { endpoint, body });
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (data.success) {
        setPublishMsg('¡Publicación realizada con éxito!');
        
        // Limpiar formulario
        setImageUrls(['']);
        setImagePreviews([]);
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

  const loadStories = async () => {
    setLoadingStories(true);
    try {
      const response = await fetch('http://localhost:3001/api/instagram/update-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
        setViewMode('stories');
      } else {
        console.error('Error al cargar historias');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingStories(false);
    }
  };

  const handleShowStories = async () => {
    setViewMode('stories');
    setShowStories(true);
    setShowAddPost(false);
    setShowStoryForm(true);
    setShowScheduled(false);
    setShowSuggestions(false);
    setLoadingStories(true);
    
    try {
      // Leer directamente el archivo JSON de historias
      const response = await fetch('http://localhost:3001/api/instagram/stories');
      
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      } else {
        console.error('Error al cargar historias');
        setStories([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setStories([]);
    } finally {
      setLoadingStories(false);
    }
  };

  const handleShowPosts = () => {
    setViewMode('posts');
    setShowStories(false);
    setShowAddPost(true);
    setShowStoryForm(false);
    setShowScheduled(false);
    setShowSuggestions(false);
  };

  // No cargar historias automáticamente, solo cuando se presione el botón

  const handleStoryDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newPreview = ev.target?.result as string;
        setStoryPreview(newPreview);
        setStoryMediaUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStoryUrlChange = (value: string) => {
    setStoryMediaUrl(value);
    setStoryPreview(value ? value : '');
  };

  const handlePublishStory = async () => {
    console.log('[DEBUG] handlePublishStory iniciado');
    console.log('[DEBUG] storyMediaUrl:', storyMediaUrl);
    console.log('[DEBUG] storyPreview:', storyPreview);
    
    if (!storyMediaUrl.trim() && !storyPreview) {
      console.log('[DEBUG] URL y preview vacíos, mostrando mensaje de error');
      setStoryPublishMsg('Por favor ingresa una URL de imagen o video o arrastra un archivo');
      return;
    }

    console.log('[DEBUG] Iniciando publicación de historia...');
    setPublishingStory(true);
    setStoryPublishMsg(null);

    try {
      const mediaUrl = storyMediaUrl.trim() || storyPreview;
      const requestBody = {
        media_url: mediaUrl
      };
      console.log('[DEBUG] Enviando request al backend:', requestBody);
      
      const response = await fetch('http://localhost:3001/api/instagram/create-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[DEBUG] Response status:', response.status);
      console.log('[DEBUG] Response ok:', response.ok);

      const data = await response.json();
      console.log('[DEBUG] Response data:', data);

      if (data.success) {
        console.log('[DEBUG] Historia publicada exitosamente');
        setStoryPublishMsg('Historia publicada con éxito!');
        setStoryMediaUrl('');
        setStoryPreview('');
        // Recargar las historias después de publicar
        handleShowStories();
      } else {
        console.log('[DEBUG] Error en la respuesta:', data.error);
        setStoryPublishMsg(data.error || 'Error al publicar la historia');
      }
    } catch (error) {
      console.error('[DEBUG] Error en handlePublishStory:', error);
      setStoryPublishMsg('Error de red o backend.');
    }
    setPublishingStory(false);
    console.log('[DEBUG] handlePublishStory finalizado');
  };

  return (
    <div className="h-screen bg-[var(--color-background)] flex flex-row p-4 lg:p-6 gap-4 lg:gap-6 overflow-hidden">
      {/* Panel izquierdo - Posts/Historias */}
      <div className="w-full max-w-md lg:max-w-lg bg-white rounded-2xl lg:rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] flex flex-col">
        <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-2 lg:pb-3 border-b flex-shrink-0">
          <h2 className="text-lg lg:text-xl font-semibold text-[var(--color-primary-700)] text-center mx-auto">
            {viewMode === 'stories' ? 'Últimas historias' : 'Últimos posts'}
          </h2>
        </div>
        <div className="flex flex-col gap-4 lg:gap-6 px-4 lg:px-6 pb-4 lg:pb-6 pt-2 lg:pt-3 flex-1 overflow-y-auto custom-scrollbar">
          {viewMode === 'stories' ? (
            <>
              {loadingStories && <div className="text-center text-gray-500">Cargando historias...</div>}
              {!loadingStories && stories.length === 0 && <div className="text-center text-gray-500">No hay historias activas.</div>}
              <div className="flex flex-col gap-8 items-center w-full">
                {stories.map(story => (
                  <div
                    key={story.id}
                    className="flex flex-col items-center justify-center w-full max-w-[420px] aspect-[9/12] bg-gradient-to-tr from-black via-[#232347] to-black rounded-2xl p-1 shadow-lg relative group"
                  >
                    <div className="flex items-center gap-2 absolute top-4 left-4 z-10">
                      <img
                        src="https://scontent.fccs11-2.fna.fbcdn.net/v/t51.82787-15/523364984_17847760164526720_6719431624113204233_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=7d201b&_nc_ohc=Jwva6KWDPW0Q7kNvwGFzX-V&_nc_oc=Adks6t3CwfGCiReMXFxiO7DmfzuDxpQCrSamaSOASlHSpfksGrEROkUqslW28Ev62nM&_nc_zt=23&_nc_ht=scontent.fccs11-2.fna&edm=AGaHXAAEAAAA&_nc_gid=qJA6BaZAO1sj-VfYGhyzfw&oh=00_AfSt5x4zmozukhttFkm6CpLrbfiSwq2Q7YyRjY3el49HRw&oe=6889B457"
                        alt="Foto de perfil"
                        className="w-9 h-9 rounded-full border-2 border-white object-cover shadow"
                      />
                      <span className="text-white font-semibold text-base drop-shadow">empr.esaprueba</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center w-full h-full">
                      {story.media_type === 'VIDEO' ? (
                        <InstagramVideo 
                          src={story.media_url} 
                          className="object-cover w-full h-full rounded-xl"
                          style={{ maxHeight: 'calc(100% - 80px)' }}
                          isPreview={true}
                        />
                      ) : (
                        <img
                          src={story.media_url}
                          alt={story.caption || 'Instagram story'}
                          className="object-cover w-full h-full rounded-xl"
                          style={{ maxHeight: 'calc(100% - 80px)' }}
                        />
                      )}
                    </div>
                    <div className="absolute bottom-4 left-0 w-full flex flex-col items-center z-10">
                      <span className="text-xs text-white bg-black/40 px-3 py-1 rounded-full shadow">
                        {story.timestamp ? new Date(story.timestamp).toLocaleString('es-ES') : 'Sin fecha'}
                      </span>
                      {story.insights && story.insights.status === 'insufficient_data' && (
                        <span className="text-xs text-white/80 mt-1 bg-black/40 px-2 py-0.5 rounded-full text-center block">
                          Aún no hay suficientes visualizaciones para mostrar estadísticas de esta historia.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
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
              <div className="w-full relative">
                {(post.media_type === 'CAROUSEL' || post.media_type === 'CAROUSEL_ALBUM') ? (
                  (() => {
                    const images = getCarouselImages(post);
                    if (images.length > 0) {
                      const currentIndex = postImageIndices[post.id] || 0;
                      return (
                        <>
                          {(() => {
                            const currentMedia = images[currentIndex];
                            const mediaUrl = currentMedia.media_url;
                            const isVideo = currentMedia.media_type === 'VIDEO' || currentMedia.media_type === 'REELS' || isVideoUrl(mediaUrl);
                            
                            if (isVideo) {
                              return (
                                <InstagramVideo 
                                  src={mediaUrl} 
                                  className="object-cover w-full"
                                  style={{ maxHeight: '300px' }}
                                  isPreview={true}
                                />
                              );
                            } else {
                              return (
                                <img
                                  src={mediaUrl}
                                  alt={post.caption || 'Instagram carousel'}
                                  className="object-cover w-full"
                                  style={{ maxHeight: '300px' }}
                                />
                              );
                            }
                          })()}
                          {/* Indicador de carrusel */}
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                            <span>{currentIndex + 1}/{images.length}</span>
                          </div>
                          
                          {/* Botones de navegación en vista previa */}
                          {images.length > 1 && (
                            <>
                              <button
                                onClick={(e) => handlePrevPreviewImage(post.id, e)}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors text-sm"
                              >
                                ‹
                              </button>
                              <button
                                onClick={(e) => handleNextPreviewImage(post.id, e)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors text-sm"
                              >
                                ›
                              </button>
                            </>
                          )}
                        </>
                      );
                    }
                    return null;
                  })()
                ) : (
                  (() => {
                    const mediaUrl = post.media_url || post.image || '';
                    const isVideo = post.media_type === 'VIDEO' || post.media_type === 'REELS' || isVideoUrl(mediaUrl);
                    
                    if (isVideo) {
                      return (
                        <InstagramVideo 
                          src={mediaUrl} 
                          className="object-cover w-full" 
                          style={{ maxHeight: '300px' }}
                        />
                      );
                    } else {
                      return (
                        <img
                          src={mediaUrl}
                          alt={post.caption || 'Instagram post'}
                          className="object-cover w-full"
                          style={{ maxHeight: '300px' }}
                        />
                      );
                    }
                  })()
                )}
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
            </>
          )}
        </div>
      </div>
      {/* Panel derecho - Controles y formularios */}
      <div className="flex flex-col min-w-[400px] lg:min-w-[480px] flex-1">
        {/* Botones principales - Fijos en la parte superior */}
        <div className={`flex flex-col gap-3 lg:gap-4 flex-shrink-0${isSidebarCollapsed ? ' ml-27' : ''}`}>
          <div className="flex flex-row gap-2 lg:gap-4 flex-wrap">
            <div className="flex flex-col min-w-[140px] lg:min-w-[160px]">
              <button className="bg-[var(--color-secondary-600)] text-white rounded-lg px-3 lg:px-4 py-2 text-sm lg:text-base font-medium shadow hover:bg-[var(--color-secondary-700)] transition-colors cursor-pointer" onClick={() => { setShowAddPost(true); setShowScheduled(false); setShowSuggestions(false); }}>Agregar post</button>
            </div>
            <div className="flex flex-col min-w-[140px] lg:min-w-[160px]">
              <button className="bg-[var(--color-secondary-600)] text-white rounded-lg px-3 lg:px-4 py-2 text-sm lg:text-base font-medium shadow hover:bg-[var(--color-secondary-700)] transition-colors cursor-pointer" onClick={() => { setShowSuggestions(true); setShowAddPost(false); setShowScheduled(false); handleShowSuggestions(); }}>Sugerencias (IA)</button>
            </div>
            <div className="flex flex-col min-w-[140px] lg:min-w-[160px]">
              <button onClick={() => { setShowScheduled(true); setShowAddPost(false); setShowSuggestions(false); handleShowScheduled(); }} className="bg-[var(--color-secondary-600)] text-white rounded-lg px-3 lg:px-4 py-2 text-sm lg:text-base font-medium shadow hover:bg-[var(--color-secondary-700)] transition-colors cursor-pointer">Ver programación</button>
            </div>
          </div>
          
          {/* Subbotones centrados */}
          {(showAddPost || viewMode === 'stories') && (
            <div className="flex justify-center">
              <div className="flex flex-row gap-2 lg:gap-4">
                <button 
                  className={`rounded-lg px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium shadow transition-colors cursor-pointer ${
                    viewMode === 'posts' 
                      ? 'bg-[var(--color-primary-700)] text-white' 
                      : 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]'
                  }`}
                  onClick={handleShowPosts}
                >
                  Fotos/Reels
                </button>
                <button 
                  className={`rounded-lg px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium shadow transition-colors cursor-pointer ${
                    viewMode === 'stories' 
                      ? 'bg-[var(--color-primary-700)] text-white' 
                      : 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]'
                  }`}
                  onClick={handleShowStories}
                >
                  Historias
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Área de contenido - Con scroll */}
        <div className="flex-1 overflow-y-auto mt-4 lg:mt-6">
          {/* Sugerencias IA */}
          {showSuggestions && !showAddPost && !showScheduled && (
            <div className={`mb-4 lg:mb-8 p-4 lg:p-6 bg-gray-50 border border-gray-200 rounded-xl max-w-[600px] lg:max-w-[650px] w-full${isSidebarCollapsed ? ' ml-8' : ''}`}>
              {loadingSuggestions ? (
                <div className="text-gray-500 w-full text-center">Cargando sugerencias...</div>
              ) : suggestions ? (
                <div className="whitespace-pre-line text-gray-700 text-xs lg:text-sm w-full text-left px-2 min-h-[1.5em]">{cleanSuggestions(suggestions)}</div>
              ) : null}
            </div>
          )}
          {showAddPost && !showScheduled && !showSuggestions ? (
            <form className={`flex flex-col gap-3 lg:gap-4 w-full max-w-[600px] lg:max-w-[650px] pb-8${isSidebarCollapsed ? ' ml-13' : ''}`} onSubmit={e => { e.preventDefault(); handlePublish(); }}>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                  Medios {imageUrls.length > 1 ? '(Carrusel)' : ''}
                </label>
                <div
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg px-2 lg:px-3 py-4 lg:py-6 text-center cursor-pointer hover:border-[var(--color-primary-700)] transition-colors mb-2 bg-gray-50"
                  onDrop={handleImageDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  {imagePreviews.length > 0 && imagePreviews.some(preview => preview && preview.trim() !== '') ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {imagePreviews.map((preview, index) => (
                        preview && preview.trim() !== '' && (
                          <div key={index} className="relative">
                            {isVideoUrl(imageUrls[index]) ? (
                              <InstagramVideo 
                                src={preview} 
                                className="max-h-32 rounded" 
                                showControls={true}
                                isPreview={true}
                              />
                            ) : (
                              <img src={preview} alt={`preview ${index + 1}`} className="max-h-32 rounded" />
                            )}
                            {imageUrls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeImageUrl(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs lg:text-sm">Arrastra una imagen/video aquí o ingresa las URLs abajo</span>
                  )}
                </div>
                
                {/* URLs de imágenes */}
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]"
                      placeholder={`URL de imagen/video ${index + 1}...`}
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="px-2 lg:px-3 py-1.5 lg:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer text-xs lg:text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Botón para agregar más URLs */}
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="w-full mt-2 bg-gray-100 text-gray-600 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs lg:text-sm"
                >
                  <span className="text-lg lg:text-xl font-bold">+</span>
                  Agregar otra imagen/video
                </button>
                
                {imageUrls.length > 1 && (
                  <div className="text-xs text-blue-600 mt-2 text-center">
                    {(() => {
                      const hasVideos = imageUrls.some(url => 
                        url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) || 
                        url.includes('video') || 
                        url.includes('reel')
                      );
                      
                      const hasImages = imageUrls.some(url => 
                        !url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) && 
                        !url.includes('video') && 
                        !url.includes('reel')
                      );
                      
                      if (hasVideos && hasImages) {
                        return `Se creará un carrusel mixto con ${imageUrls.filter(url => url.trim() !== '').length} medios (fotos + videos)`;
                      } else if (hasVideos) {
                        return `Se creará un carrusel de videos con ${imageUrls.filter(url => url.trim() !== '').length} videos`;
                      } else {
                        return `Se creará un carrusel de Instagram con ${imageUrls.filter(url => url.trim() !== '').length} imágenes`;
                      }
                    })()}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Caption</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)] resize-none"
                  rows={2}
                  placeholder="Escribe el caption..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Fecha de publicación (opcional)</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Hora (opcional)</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">Si no se especifica fecha y hora, la publicación se realizará inmediatamente.</div>
              <div className="flex gap-2 mt-3 lg:mt-4 justify-center">
                <button type="submit" className="bg-[var(--color-secondary-600)] text-white rounded-lg px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold shadow hover:bg-[var(--color-secondary-700)] transition-colors cursor-pointer" disabled={publishing}>{publishing ? 'Publicando...' : 'Publicar'}</button>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 rounded-lg px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold shadow hover:bg-gray-300 transition-colors cursor-pointer"
                  onClick={() => {
                    setImageUrls(['']);
                    setImagePreviews([]);
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
              {publishMsg && <div className={`text-center text-xs lg:text-sm mt-3 lg:mt-4 ${publishMsg.includes('éxito') ? 'text-green-600' : 'text-red-600'}`}>{publishMsg}</div>}
              {/* Espacio adicional para asegurar que los botones sean visibles */}
              <div className="h-20 lg:h-24"></div>
            </form>
                      ) : showStoryForm && !showScheduled && !showSuggestions ? (
            <form className={`flex flex-col gap-4 w-full max-w-[600px] lg:max-w-[650px] pb-8${isSidebarCollapsed ? ' ml-13' : ''}`} onSubmit={e => { 
              console.log('[DEBUG] Formulario de historia enviado');
              e.preventDefault(); 
              handlePublishStory(); 
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medio</label>
                <div
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg px-3 py-6 text-center cursor-pointer hover:border-[var(--color-primary-700)] transition-colors mb-2 bg-gray-50"
                  onDrop={handleStoryDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  {storyPreview ? (
                    <div className="flex justify-center">
                      {isVideoUrl(storyPreview) ? (
                        <InstagramVideo 
                          src={storyPreview} 
                          className="max-h-32 rounded" 
                          showControls={true}
                          isPreview={true}
                        />
                      ) : (
                        <img src={storyPreview} alt="preview" className="max-h-32 rounded" />
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Arrastra una imagen/video aquí o ingresa la URL abajo</span>
                  )}
                </div>
                
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]"
                  placeholder="URL de imagen/video..."
                  value={storyMediaUrl}
                  onChange={(e) => handleStoryUrlChange(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 mt-4 justify-center">
                <button 
                  type="submit" 
                  className="bg-[var(--color-secondary-600)] text-white rounded-lg px-4 py-2 font-semibold shadow hover:bg-[var(--color-secondary-700)] transition-colors cursor-pointer" 
                  disabled={publishingStory}
                  onClick={() => console.log('[DEBUG] Botón Publicar Historia clickeado')}
                >
                  {publishingStory ? 'Publicando...' : 'Publicar'}
                </button>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-semibold shadow hover:bg-gray-300 transition-colors cursor-pointer"
                  onClick={() => {
                    setStoryMediaUrl('');
                    setStoryPreview('');
                    setStoryPublishMsg(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
              {storyPublishMsg && <div className={`text-center text-sm mt-4 ${storyPublishMsg.includes('éxito') ? 'text-green-600' : 'text-red-600'}`}>{storyPublishMsg}</div>}
              {/* Espacio adicional para asegurar que los botones sean visibles */}
              <div className="h-20 lg:h-24"></div>
            </form>
                      ) : showScheduled && !showAddPost && !showSuggestions ? (
            loadingScheduled ? (
              <div className={`text-gray-500 max-w-[600px] lg:max-w-[650px] pb-8${isSidebarCollapsed ? ' ml-16' : ''}`}>Cargando...</div>
            ) : scheduledPosts.length === 0 ? (
              <div className={`text-gray-500 max-w-[600px] lg:max-w-[650px] pb-8${isSidebarCollapsed ? ' ml-16' : ''}`}>No hay publicaciones programadas.</div>
            ) : (
              <div className={`max-w-[600px] lg:max-w-[650px] pb-8${isSidebarCollapsed ? ' ml-16' : ''}`}>
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
          {/* Espacio adicional al final para asegurar scroll completo */}
          <div className="h-16 lg:h-20"></div>
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
        
        /* Estilos para videos estilo Instagram */
        .instagram-video {
          background: #000;
        }
        
        .instagram-video video {
          display: block;
        }
        
        /* Animaciones suaves para controles */
        .video-controls {
          transition: all 0.2s ease-in-out;
        }
        
        /* Efecto de hover más suave */
        .video-hover {
          transition: opacity 0.15s ease-in-out;
        }
      `}</style>
      
      {/* Modal de detalles del post */}
      {showPostModal && selectedPost && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-80'
        }`}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
            {/* Imagen del post (lado izquierdo en desktop) */}
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative">
              {/* Determinar qué imagen mostrar */}
              {selectedPost.media_type === 'CAROUSEL' || selectedPost.media_type === 'CAROUSEL_ALBUM' ? (
                (() => {
                  const images = getCarouselImages(selectedPost);
                  if (images.length > 0) {
                    return (
                      <>
                        {(() => {
                          const currentMedia = images[currentImageIndex];
                          const mediaUrl = currentMedia.media_url;
                          const isVideo = currentMedia.media_type === 'VIDEO' || currentMedia.media_type === 'REELS' || isVideoUrl(mediaUrl);
                          
                          if (isVideo) {
                            return (
                              <InstagramVideo 
                                src={mediaUrl} 
                                className="object-contain max-h-[70vh] w-full"
                              />
                            );
                          } else {
                            return (
                              <img
                                src={mediaUrl}
                                alt={selectedPost.caption || 'Instagram carousel'}
                                className="object-contain max-h-[70vh] w-full"
                              />
                            );
                          }
                        })()}
                        
                        {/* Indicadores de navegación */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {images.map((_: any, index: number) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                        
                        {/* Botones de navegación */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={handlePrevImage}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                              ‹
                            </button>
                            <button
                              onClick={handleNextImage}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                              ›
                            </button>
                          </>
                        )}
                        
                        {/* Contador de imágenes */}
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    );
                  }
                  return null;
                })()
              ) : (
                (() => {
                  const mediaUrl = selectedPost.media_url || selectedPost.image || '';
                  const isVideo = selectedPost.media_type === 'VIDEO' || selectedPost.media_type === 'REELS' || isVideoUrl(mediaUrl);
                  
                  if (isVideo) {
                    return (
                      <InstagramVideo 
                        src={mediaUrl} 
                        className="object-contain max-h-[70vh] w-full"
                      />
                    );
                  } else {
                    return (
                      <img
                        src={mediaUrl}
                        alt={selectedPost.caption || 'Instagram post'}
                        className="object-contain max-h-[70vh] w-full"
                      />
                    );
                  }
                })()
              )}
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