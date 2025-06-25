import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ZoomIn, ZoomOut, Maximize2, X, RotateCcw } from 'lucide-react';

interface DiagramViewerProps {
  className?: string;
}

export interface DiagramViewerHandle {
  getDiagramContainer: () => HTMLDivElement | null;
}

const DiagramViewerSimple = forwardRef<DiagramViewerHandle, DiagramViewerProps>(
  ({ className = '' }, ref) => {
    const diagramRef = useRef<HTMLDivElement>(null);
    const transformRef = useRef<HTMLDivElement>(null);
    const scaleRef = useRef(1);
    const positionRef = useRef({ x: 0, y: 0 });
    const isFullscreenRef = useRef(false);
    const fullscreenContainerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      getDiagramContainer: () => diagramRef.current
    }));

    // Apply transform without React state
    const applyTransform = () => {
      if (transformRef.current) {
        transformRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) scale(${scaleRef.current})`;
      }
    };

    const handleZoomIn = () => {
      scaleRef.current = Math.min(scaleRef.current + 0.2, 3);
      applyTransform();
      updateZoomDisplay();
    };

    const handleZoomOut = () => {
      scaleRef.current = Math.max(scaleRef.current - 0.2, 0.5);
      applyTransform();
      updateZoomDisplay();
    };

    const handleReset = () => {
      scaleRef.current = 1;
      positionRef.current = { x: 0, y: 0 };
      applyTransform();
      updateZoomDisplay();
    };

    const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
      const step = 50;
      switch (direction) {
        case 'up': positionRef.current.y += step; break;
        case 'down': positionRef.current.y -= step; break;
        case 'left': positionRef.current.x += step; break;
        case 'right': positionRef.current.x -= step; break;
      }
      applyTransform();
    };

    const updateZoomDisplay = () => {
      const zoomDisplay = document.getElementById('zoom-display');
      if (zoomDisplay) {
        zoomDisplay.textContent = `${Math.round(scaleRef.current * 100)}%`;
      }
    };

    const toggleFullscreen = () => {
      isFullscreenRef.current = !isFullscreenRef.current;
      const modal = document.getElementById('diagram-fullscreen-modal');
      const fullscreenContent = document.getElementById('fullscreen-diagram-content');
      
      if (modal && fullscreenContent) {
        if (isFullscreenRef.current) {
          // Clone the current diagram to fullscreen
          const currentDiagram = diagramRef.current?.innerHTML;
          if (currentDiagram) {
            fullscreenContent.innerHTML = currentDiagram;
          }
          modal.style.display = 'block';
        } else {
          modal.style.display = 'none';
          fullscreenContent.innerHTML = '';
        }
      }
    };

    // Mouse wheel zoom
    useEffect(() => {
      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          scaleRef.current = Math.max(0.5, Math.min(3, scaleRef.current + delta));
          applyTransform();
          updateZoomDisplay();
        }
      };

      const container = transformRef.current?.parentElement;
      if (container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
      }
    }, []);

    // Escape key for fullscreen
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isFullscreenRef.current) {
          toggleFullscreen();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Drag to pan
    useEffect(() => {
      let isDragging = false;
      let dragStart = { x: 0, y: 0 };

      const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 0 && transformRef.current?.parentElement?.contains(e.target as Node)) {
          isDragging = true;
          dragStart = { x: e.clientX - positionRef.current.x, y: e.clientY - positionRef.current.y };
          if (transformRef.current?.parentElement) {
            transformRef.current.parentElement.style.cursor = 'grabbing';
          }
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          positionRef.current = {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
          };
          applyTransform();
        }
      };

      const handleMouseUp = () => {
        isDragging = false;
        if (transformRef.current?.parentElement) {
          transformRef.current.parentElement.style.cursor = 'grab';
        }
      };

      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);

    const ControlButton = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) => (
      <button
        onClick={onClick}
        title={title}
        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
      >
        {children}
      </button>
    );

    return (
      <>
        <div className={`${className} relative overflow-hidden bg-gray-50 dark:bg-gray-900`} style={{ cursor: 'grab' }}>
          <div
            ref={transformRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-out'
            }}
          >
            <div ref={diagramRef} className="diagram-container" />
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
            <ControlButton onClick={toggleFullscreen} title="Fullscreen">
              <Maximize2 className="w-5 h-5" />
            </ControlButton>
          </div>

          {/* Navigation arrows */}
          <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10">
            <button
              onClick={() => handlePan('left')}
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
              onClick={() => handlePan('right')}
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
              onClick={() => handlePan('up')}
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
              onClick={() => handlePan('down')}
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
            <span id="zoom-display" className="text-sm font-medium">100%</span>
          </div>
        </div>

        {/* Fullscreen Modal */}
        <div id="diagram-fullscreen-modal" className="fixed inset-0 z-50 bg-white dark:bg-gray-900" style={{ display: 'none' }}>
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
              title="Exit Fullscreen (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div ref={fullscreenContainerRef} className="w-full h-full flex items-center justify-center p-8">
            <div id="fullscreen-diagram-content" className="max-w-full max-h-full overflow-auto" />
          </div>
        </div>
      </>
    );
  }
);

DiagramViewerSimple.displayName = 'DiagramViewerSimple';

export default DiagramViewerSimple;