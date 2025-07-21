import React, { useRef, useEffect, useState, useMemo } from 'react';

const WritingArea = ({ content, onContentChange, autoFocus = false, feedback = [], hoveredFeedback = null }) => {
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Sync scroll between textarea and overlay
  const handleScroll = (e) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.target.scrollTop;
      overlayRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  // Memoize highlights to prevent recalculation on every render
  const highlights = useMemo(() => {
    if (!content || feedback.length === 0) {
      return [];
    }

    const result = [];

    // Collect all feedback positions and remove overlaps
    feedback.forEach((item) => {
      if (item.position && item.position.start !== undefined && item.position.end !== undefined) {
        const start = Math.max(0, Math.min(item.position.start, content.length));
        const end = Math.max(0, Math.min(item.position.end, content.length));
        
        if (start < end) {
          // Check for overlaps with existing highlights
          const hasOverlap = result.some(existing => 
            (start >= existing.start && start < existing.end) ||
            (end > existing.start && end <= existing.end) ||
            (start < existing.start && end > existing.end)
          );
          
          if (!hasOverlap) {
            result.push({
              start,
              end,
              type: item.type,
              severity: item.severity,
              id: item.id,
              isHovered: hoveredFeedback === item.id,
              text: content.slice(start, end)
            });
          }
        }
      }
    });

    return result.sort((a, b) => a.start - b.start);
  }, [content, feedback, hoveredFeedback]);

  const getHighlightClass = (type, severity, isHovered) => {
    const baseClasses = 'relative rounded px-1 transition-all duration-200';
    const typeClasses = {
      intellectual: 'bg-purple-100 border-b-2 border-purple-300',
      stylistic: 'bg-blue-100 border-b-2 border-blue-300'
    };
    const severityClasses = {
      high: 'bg-opacity-60',
      medium: 'bg-opacity-40', 
      low: 'bg-opacity-20'
    };
    const hoverClasses = isHovered ? 'bg-opacity-80 shadow-sm' : '';

    return `${baseClasses} ${typeClasses[type] || typeClasses.intellectual} ${severityClasses[severity] || severityClasses.medium} ${hoverClasses}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg h-[calc(100vh-200px)]">
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800">Your Writing</h2>
      </div>
      
      <div className="relative h-[calc(100%-60px)]">
        {/* Text overlay with highlights - only when highlights exist */}
        {highlights.length > 0 && (
          <div
            ref={overlayRef}
            className="absolute inset-0 p-6 text-slate-800 leading-relaxed pointer-events-none overflow-hidden whitespace-pre-wrap break-words z-5"
            style={{
              font: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              letterSpacing: 'inherit',
              wordSpacing: 'inherit'
            }}
          >
            {(() => {
              let lastIndex = 0;
              const elements = [];
              
              highlights.forEach((highlight, idx) => {
                // Add text before highlight
                if (highlight.start > lastIndex) {
                  elements.push(
                    <span key={`text-${idx}`}>
                      {content.slice(lastIndex, highlight.start)}
                    </span>
                  );
                }
                
                // Add highlighted text
                const highlightClass = getHighlightClass(highlight.type, highlight.severity, highlight.isHovered);
                elements.push(
                  <span 
                    key={`highlight-${idx}`} 
                    className={highlightClass}
                    data-feedback-id={highlight.id}
                  >
                    {highlight.text}
                  </span>
                );
                
                lastIndex = highlight.end;
              });
              
              // Add remaining text
              if (lastIndex < content.length) {
                elements.push(
                  <span key="text-end">
                    {content.slice(lastIndex)}
                  </span>
                );
              }
              
              return elements;
            })()}
          </div>
        )}
        
        {/* Actual textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          onScroll={handleScroll}
          onFocus={() => setIsTextareaFocused(true)}
          onBlur={() => setIsTextareaFocused(false)}
          placeholder="Start writing here. Your AI critics will provide real-time feedback..."
          className={`relative w-full h-full p-6 border-none focus:outline-none resize-none leading-relaxed bg-transparent z-10 ${
            highlights.length > 0 ? 'text-transparent' : 'text-slate-800'
          }`}
          style={{
            caretColor: '#1e293b' // Ensure cursor is visible
          }}
        />
      </div>
    </div>
  );
};

export default WritingArea;