import { useState, useEffect, useRef } from 'react';
import { analyzeText as analyzeIntellectual } from '../agents/intellectualCritic';
import { analyzeText as analyzeStylistic } from '../agents/stylisticCritic';
import { analyzeText as analyzeInquiryIntegration } from '../agents/inquiryIntegrationAgent';
import textChangeDetector from '../utils/textChangeDetector';
import suggestionEvaluator from '../services/suggestionEvaluator';
import inquiryComplexService from '../services/inquiryComplexService';

export const useWritingAnalysis = (content, purpose, isMonitoring) => {
  const [feedback, setFeedback] = useState([]);
  const [lastAnalyzedLength, setLastAnalyzedLength] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const previousContentRef = useRef('');
  const originalContentRef = useRef(''); // Content when suggestions were created

  // Effect to handle text changes and update existing suggestions
  useEffect(() => {
    if (previousContentRef.current && previousContentRef.current !== content) {
      const changeAnalysis = textChangeDetector.analyzeChanges(content);
      
      if (changeAnalysis.type === 'update' && changeAnalysis.changes.length > 0) {
        setFeedback(currentFeedback => {
          // First update positions for all suggestions
          const updatedFeedback = textChangeDetector.updateSuggestionPositions(currentFeedback, changeAnalysis.changes);
          
          // Then identify suggestions that need AI evaluation
          const suggestionsNeedingEvaluation = updatedFeedback.filter(item => 
            item.status === 'active' && 
            textChangeDetector.needsAIEvaluation(item, changeAnalysis.changes)
          );

          // Queue AI evaluations for affected suggestions
          if (suggestionsNeedingEvaluation.length > 0 && !isEvaluating) {
            setIsEvaluating(true);
            
            // Process AI evaluations asynchronously
            Promise.all(
              suggestionsNeedingEvaluation.map(async (suggestion) => {
                try {
                  const evaluation = await suggestionEvaluator.queueForEvaluation(
                    suggestion,
                    originalContentRef.current,
                    content,
                    changeAnalysis.changes
                  );
                  
                  return {
                    suggestionId: suggestion.id,
                    evaluation
                  };
                } catch (error) {
                  console.error(`Failed to evaluate suggestion ${suggestion.id}:`, error);
                  return {
                    suggestionId: suggestion.id,
                    evaluation: {
                      status: 'active',
                      confidence: 0.1,
                      reasoning: 'Evaluation failed, keeping active'
                    }
                  };
                }
              })
            ).then(evaluationResults => {
              // Apply AI evaluation results
              setFeedback(prevFeedback => {
                return prevFeedback.map(item => {
                  const result = evaluationResults.find(r => r.suggestionId === item.id);
                  if (result) {
                    const { evaluation } = result;
                    
                    if (evaluation.status === 'resolved') {
                      return { 
                        ...item, 
                        status: 'resolved', 
                        resolvedAt: new Date(),
                        resolvedBy: 'ai',
                        aiEvaluation: evaluation
                      };
                    } else if (evaluation.status === 'retracted') {
                      return { 
                        ...item, 
                        status: 'retracted',
                        retractedReason: evaluation.reasoning,
                        aiEvaluation: evaluation
                      };
                    }
                    
                    // Keep as active but store AI evaluation for debugging
                    return { ...item, aiEvaluation: evaluation };
                  }
                  return item;
                });
              });
              
              setIsEvaluating(false);
            });
          }
          
          return updatedFeedback;
        });
      }
    }
    previousContentRef.current = content;
  }, [content, isEvaluating]);

  useEffect(() => {
    if (!isMonitoring || content.length < 50 || content.length <= lastAnalyzedLength + 20) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      const newFeedback = [];
      
      try {
        // Analyze with intellectual critic
        const intellectualFeedback = await analyzeIntellectual(content, purpose);
        if (intellectualFeedback) {
          intellectualFeedback.forEach((item, index) => {
            const feedbackItem = {
              id: `intellectual-${Date.now()}-${index}`,
              type: item.type || 'intellectual',
              agent: 'Dialectical Critic',
              severity: item.severity || 'medium',
              title: item.title || 'Intellectual Analysis',
              feedback: item.feedback || item.message || 'Analysis provided',
              suggestion: item.suggestion || '',
              position: item.position || { start: 0, end: 100 },
              timestamp: new Date(),
              status: 'active' // New suggestions start as active
            };
            newFeedback.push(feedbackItem);
          });
        }

        // Analyze with stylistic critic
        const stylisticFeedback = await analyzeStylistic(content, purpose);
        if (stylisticFeedback) {
          stylisticFeedback.forEach((item, index) => {
            const feedbackItem = {
              id: `stylistic-${Date.now()}-${index}`,
              type: item.type || 'stylistic',
              agent: 'Style Guide',
              severity: item.severity || 'medium',
              title: item.title || 'Style Analysis',
              feedback: item.feedback || item.message || 'Analysis provided',
              suggestion: item.suggestion || '',
              position: item.position || { start: 0, end: 100 },
              timestamp: new Date(),
              status: 'active' // New suggestions start as active
            };
            newFeedback.push(feedbackItem);
          });
        }

        // Analyze with inquiry integration agent (less frequent, only for substantial content)
        if (content.length > 200 && content.length % 500 < 100) { // Throttle this agent
          const existingComplexes = inquiryComplexService.getAllComplexes();
          const inquiryInsights = await analyzeInquiryIntegration(content, purpose, existingComplexes);
          
          if (inquiryInsights && inquiryInsights.length > 0) {
            inquiryInsights.forEach((insight, index) => {
              const feedbackItem = {
                id: `inquiry-${Date.now()}-${index}`,
                type: insight.type || 'inquiry_integration',
                agent: 'Inquiry Integration',
                severity: insight.priority === 'high' ? 'high' : insight.priority === 'medium' ? 'medium' : 'low',
                title: insight.title,
                feedback: insight.message,
                suggestion: insight.action?.suggestion || '',
                position: { start: 0, end: Math.min(content.length, 200) },
                timestamp: new Date(),
                status: 'active',
                actionData: insight.action // Store action data for special handling
              };
              newFeedback.push(feedbackItem);
            });
          }
        }

        if (newFeedback.length > 0) {
          setFeedback(prev => [...prev, ...newFeedback]);
          setLastAnalyzedLength(content.length);
          
          // Store current content as original content for new suggestions
          if (!originalContentRef.current) {
            originalContentRef.current = content;
          }
        }
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 2000); // Increased delay for AI API calls

    return () => clearTimeout(timer);
  }, [content, isMonitoring, purpose, lastAnalyzedLength]);

  const clearFeedback = () => {
    setFeedback([]);
    setLastAnalyzedLength(0);
    textChangeDetector.previousContent = '';
    previousContentRef.current = '';
    originalContentRef.current = '';
    suggestionEvaluator.clearCache();
  };

  const dismissSuggestion = (suggestionId) => {
    setFeedback(prev => prev.map(item => 
      item.id === suggestionId 
        ? { ...item, status: 'dismissed', dismissedAt: new Date() }
        : item
    ));
  };

  const markSuggestionResolved = (suggestionId) => {
    setFeedback(prev => prev.map(item => 
      item.id === suggestionId 
        ? { ...item, status: 'resolved', resolvedAt: new Date() }
        : item
    ));
  };

  // Filter feedback to only show active suggestions (not retracted, dismissed, or resolved)
  const activeFeedback = feedback.filter(item => 
    !item.status || item.status === 'active'
  );

  return {
    feedback: activeFeedback,
    allFeedback: feedback, // For debugging or showing history
    clearFeedback,
    dismissSuggestion,
    markSuggestionResolved,
    isAnalyzing,
    isEvaluating
  };
};