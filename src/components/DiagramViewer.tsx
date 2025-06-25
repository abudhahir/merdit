import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, memo } from 'react';
import { ZoomIn, ZoomOut, Maximize2, X, RotateCcw } from 'lucide-react';

interface DiagramViewerProps {
  className?: string;
  children?: React.ReactNode;
}

export interface DiagramViewerHandle {
  getDiagramContainer: () => HTMLDivElement | null;
}

const DiagramViewer = forwardRef<DiagramViewerHandle, DiagramViewerProps>(
  ({ className = '', children }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const diagramRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useImperativeHandle(ref, () => ({
      getDiagramContainer: () => contentRef.current || diagramRef.current
    }));

    // Zoom controls
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
    const handleReset = () => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };

    // Pan controls
    const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
      const step = 50;
      setPosition(prev => {
        switch (direction) {
          case 'up': return { ...prev, y: prev.y + step };
          case 'down': return { ...prev, y: prev.y - step };
          case 'left': return { ...prev, x: prev.x + step };
          case 'right': return { ...prev, x: prev.x - step };
          default: return prev;
        }
      });
    };

    // Mouse wheel zoom
    useEffect(() => {
      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
        }
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
      }
    }, []);

    // Drag to pan
    const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button === 0) { // Left click only
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Fullscreen handling
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isFullscreen) {
          setIsFullscreen(false);
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isFullscreen]);

    const ControlButton = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClick();
        }}
        title={title}
        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
      >
        {children}
      </button>
    );

    const DiagramContent = () => (
      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <div
            ref={diagramRef}
            className="diagram-container"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <div ref={contentRef} className="w-full h-full">
              {children}
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <ControlButton onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="w-5 h-5" />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="w-5 h-5" />
          </ControlButton>
          <ControlButton onClick={handleReset} title="Reset View">
            <RotateCcw className="w-5 h-5" />
          </ControlButton>
          <ControlButton onClick={() => setIsFullscreen(true)} title="Fullscreen">
            <Maximize2 className="w-5 h-5" />
          </ControlButton>
        </div>

        {/* Navigation arrows */}
        <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handlePan('left');
            }}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
            title="Pan Left"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handlePan('right');
            }}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
            title="Pan Right"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handlePan('up');
            }}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
            title="Pan Up"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handlePan('down');
            }}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
            title="Pan Down"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-md z-10">
          <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
        </div>
      </div>
    );

    return (
      <>
        <div className={className}>
          <DiagramContent />
        </div>

        {/* Fullscreen Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
                title="Exit Fullscreen (ESC)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="w-full h-full">
              <DiagramContent />
            </div>
          </div>
        )}
      </>
    );
  }
);

DiagramViewer.displayName = 'DiagramViewer';

export default memo(DiagramViewer);