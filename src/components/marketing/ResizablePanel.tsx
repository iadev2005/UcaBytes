import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface ResizablePanelProps {
  title: string;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  position?: 'left' | 'right';
  onClose?: () => void;
  className?: string;
}

export default function ResizablePanel({
  title,
  children,
  defaultWidth = 320,
  defaultHeight = 400,
  minWidth = 240,
  minHeight = 200,
  position = 'right',
  onClose,
  className
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position_, setPosition] = useState({ x: position === 'right' ? window.innerWidth - defaultWidth - 20 : 20, y: 80 });
  
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isResizing && !isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.max(minWidth, width + (position === 'right' ? -e.movementX : e.movementX));
        const newHeight = Math.max(minHeight, height + e.movementY);
        setWidth(newWidth);
        setHeight(newHeight);
      } else if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - width, position_.x + e.movementX)),
          y: Math.max(0, Math.min(window.innerHeight - height, position_.y + e.movementY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isDragging, width, height, position_, minWidth, minHeight, position]);

  const handleMouseDown = (e: React.MouseEvent, type: 'resize' | 'drag') => {
    e.preventDefault();
    if (type === 'resize') {
      setIsResizing(true);
    } else {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position_.x,
        y: e.clientY - position_.y
      };
    }
  };

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed bg-white rounded-lg shadow-lg overflow-hidden z-50 transition-transform",
        isMinimized && "h-12 overflow-visible",
        className
      )}
      style={{
        width: isMinimized ? 200 : width,
        height: isMinimized ? 48 : height,
        transform: `translate(${position_.x}px, ${position_.y}px)`,
        resize: 'both'
      }}
    >
      {/* Barra de título */}
      <div
        className="h-12 bg-gray-100 flex items-center justify-between px-4 cursor-move select-none"
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
      >
        <h3 className="font-medium truncate">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-200 rounded"
            title={isMinimized ? "Expandir" : "Minimizar"}
          >
            {isMinimized ? '□' : '−'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded"
              title="Cerrar"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className={cn(
        "h-[calc(100%-3rem)] overflow-y-auto transition-all",
        isMinimized && "hidden"
      )}>
        {children}
      </div>

      {/* Bordes para redimensionar */}
      {!isMinimized && (
        <>
          <div
            className={cn(
              "absolute w-1 h-full cursor-ew-resize top-0 hover:bg-primary/10",
              position === 'right' ? "left-0" : "right-0"
            )}
            onMouseDown={(e) => handleMouseDown(e, 'resize')}
          />
          <div
            className="absolute h-1 w-full cursor-ns-resize bottom-0 hover:bg-primary/10"
            onMouseDown={(e) => handleMouseDown(e, 'resize')}
          />
          <div
            className={cn(
              "absolute w-2 h-2 cursor-nwse-resize bottom-0",
              position === 'right' ? "left-0" : "right-0",
              "hover:bg-primary/10"
            )}
            onMouseDown={(e) => handleMouseDown(e, 'resize')}
          />
        </>
      )}
    </div>
  );
} 