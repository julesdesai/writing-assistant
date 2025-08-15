import React, { useRef, useEffect, useState, useMemo } from 'react';

const WritingArea = ({ content, onContentChange, autoFocus = false, feedback = [], hoveredFeedback = null }) => {
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const cycleIntervalRef = useRef(null);
  
  // Auto-scroll to highlighted feedback when hovered, cycling through multiple positions
  useEffect(() => {
    // Clear any existing interval
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    
    if (hoveredFeedback && textareaRef.current) {
      const hoveredFeedbackData = feedback.find(f => f.id === hoveredFeedback);
      if (hoveredFeedbackData) {
        const textarea = textareaRef.current;
        
        // Get positions from either old format or new multi-position format
        let positions;
        if (hoveredFeedbackData.positions && hoveredFeedbackData.positions.length > 0) {
          positions = hoveredFeedbackData.positions;
        } else if (hoveredFeedbackData.position) {
          positions = [hoveredFeedbackData.position];
        }
        
        if (positions && positions.length > 0) {
          // Reset position index when feedback changes
          setCurrentPositionIndex(0);
          
          const scrollToPosition = (positionIndex) => {
            const targetPosition = positions[positionIndex];
            if (targetPosition) {
              const { start } = targetPosition;
              
              
              // Get actual line height from textarea
              const textarea = textareaRef.current;
              const computedStyle = window.getComputedStyle(textarea);
              const actualLineHeight = parseInt(computedStyle.lineHeight) || 24;
              
              
              // Calculate line number and scroll position
              const textBeforeStart = content.substring(0, start);
              const lineNumber = textBeforeStart.split('\n').length;
              const scrollTop = Math.max(0, (lineNumber - 3) * actualLineHeight); // Show 3 lines above
              
              
              // Smooth scroll to the position
              textarea.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
              });
              
              // Also scroll the overlay if it exists
              if (overlayRef.current) {
                overlayRef.current.scrollTo({
                  top: scrollTop,
                  behavior: 'smooth'
                });
              }
            }
          };
          
          // Scroll to first position immediately
          scrollToPosition(0);
          
          // If there are multiple positions, cycle through them
          if (positions.length > 1) {
            let currentIndex = 0;
            cycleIntervalRef.current = setInterval(() => {
              currentIndex = (currentIndex + 1) % positions.length;
              setCurrentPositionIndex(currentIndex);
              scrollToPosition(currentIndex);
            }, 2000); // Cycle every 2 seconds
          }
        }
      }
    } else {
      // Reset position index when not hovering
      setCurrentPositionIndex(0);
    }
    
    // Cleanup interval on unmount or dependency change
    return () => {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
    };
  }, [hoveredFeedback, content]);

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

    // Collect all feedback positions (supporting both single and multi-position formats)
    feedback.forEach((item) => {
      const positions = item.positions || (item.position ? [item.position] : []);
      
      positions.forEach((position, positionIndex) => {
        if (position.start !== undefined && position.end !== undefined) {
          const start = Math.max(0, Math.min(position.start, content.length));
          const end = Math.max(start, Math.min(position.end, content.length));
          
          if (start < end) {
            // Verify the position matches the expected text (for accuracy)
            const actualText = content.substring(start, end);
            const expectedText = position.text;
            
            // If we have expected text and it doesn't match, try to find the correct position
            let adjustedStart = start;
            let adjustedEnd = end;
            
            if (expectedText && actualText !== expectedText) {
              // Try to find the expected text near the suggested position
              const searchRadius = 100; // Look within 100 characters
              const searchStart = Math.max(0, start - searchRadius);
              const searchEnd = Math.min(content.length, end + searchRadius);
              const searchArea = content.substring(searchStart, searchEnd);
              
              const foundIndex = searchArea.indexOf(expectedText);
              if (foundIndex !== -1) {
                adjustedStart = searchStart + foundIndex;
                adjustedEnd = adjustedStart + expectedText.length;
              }
            }
            
            // Check for overlaps with existing highlights
            const hasOverlap = result.some(existing => 
              (adjustedStart >= existing.start && adjustedStart < existing.end) ||
              (adjustedEnd > existing.start && adjustedEnd <= existing.end) ||
              (adjustedStart < existing.start && adjustedEnd > existing.end)
            );
            
            if (!hasOverlap) {
              result.push({
                start: adjustedStart,
                end: adjustedEnd,
                type: item.type,
                severity: item.severity,
                id: item.id,
                positionIndex,
                isHovered: hoveredFeedback === item.id,
                isCurrentPosition: hoveredFeedback === item.id && currentPositionIndex === positionIndex,
                text: content.slice(adjustedStart, adjustedEnd)
              });
            }
          }
        }
      });
    });

    return result.sort((a, b) => a.start - b.start);
  }, [content, feedback, hoveredFeedback, currentPositionIndex]);

  const getHighlightClass = (type, severity, isHovered, isCurrentPosition) => {
    const baseClasses = 'relative rounded px-1 transition-all duration-300';
    const typeClasses = {
      intellectual: 'bg-purple-100 border-b-2 border-purple-300',
      stylistic: 'bg-blue-100 border-b-2 border-blue-300',
      inquiry_integration: 'bg-green-100 border-b-2 border-green-300',
      complex_suggestion: 'bg-green-100 border-b-2 border-green-300',
      complex_insight: 'bg-yellow-100 border-b-2 border-yellow-300',
      framework_connection: 'bg-indigo-100 border-b-2 border-indigo-300'
    };
    const severityClasses = {
      high: 'bg-opacity-70 shadow-md',
      medium: 'bg-opacity-50 shadow-sm', 
      low: 'bg-opacity-30'
    };
    const hoverClasses = isHovered ? 'bg-opacity-90 shadow-lg scale-105 z-10 ring-2 ring-blue-300 ring-opacity-50' : '';
    const currentPositionClasses = isCurrentPosition ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' : '';

    return `${baseClasses} ${typeClasses[type] || typeClasses.intellectual} ${severityClasses[severity] || severityClasses.medium} ${hoverClasses} ${currentPositionClasses}`;
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
                const highlightClass = getHighlightClass(highlight.type, highlight.severity, highlight.isHovered, highlight.isCurrentPosition);
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