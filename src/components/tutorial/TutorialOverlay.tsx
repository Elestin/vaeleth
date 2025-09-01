import React, { useEffect, useState } from 'react';
import { ArrowRight, SkipForward, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { TutorialStep, TutorialProgress } from '@/types/tutorial';
import { tutorialService } from '@/services/tutorialService';

interface TutorialOverlayProps {
  progress: TutorialProgress | null;
  currentStep: TutorialStep | null;
  onStepComplete: (stepId: string) => void;
  onSkipTutorial: () => void;
  onRestartTutorial: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  progress,
  currentStep,
  onStepComplete,
  onSkipTutorial,
  onRestartTutorial
}) => {
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (currentStep?.target && currentStep.highlightElement) {
      const element = document.querySelector(currentStep.target);
      if (element) {
        setHighlightedElement(element);
        updateTooltipPosition(element, currentStep.position);
        
        // Add highlight styling
        element.classList.add('tutorial-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedElement(null);
    }

    return () => {
      // Cleanup highlight
      if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-highlight');
      }
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
    };
  }, [currentStep, highlightedElement]);

  const updateTooltipPosition = (element: Element, position: TutorialStep['position']) => {
    const rect = element.getBoundingClientRect();
    const tooltip = { x: 0, y: 0 };

    switch (position) {
      case 'top':
        tooltip.x = rect.left + rect.width / 2;
        tooltip.y = rect.top - 10;
        break;
      case 'bottom':
        tooltip.x = rect.left + rect.width / 2;
        tooltip.y = rect.bottom + 10;
        break;
      case 'left':
        tooltip.x = rect.left - 10;
        tooltip.y = rect.top + rect.height / 2;
        break;
      case 'right':
        tooltip.x = rect.right + 10;
        tooltip.y = rect.top + rect.height / 2;
        break;
      case 'center':
        tooltip.x = window.innerWidth / 2;
        tooltip.y = window.innerHeight / 2;
        break;
    }

    setTooltipPosition(tooltip);
  };

  const handleNextStep = () => {
    if (currentStep && progress?.userId) {
      onStepComplete(currentStep.id);
    }
  };

  const handleElementClick = (e: React.MouseEvent) => {
    if (currentStep?.action === 'click' && currentStep.target) {
      const target = e.target as Element;
      if (target.matches(currentStep.target) || target.closest(currentStep.target)) {
        handleNextStep();
      }
    }
  };

  useEffect(() => {
    if (currentStep?.action === 'click') {
      document.addEventListener('click', handleElementClick as any);
      return () => document.removeEventListener('click', handleElementClick as any);
    }
  }, [currentStep]);

  if (!progress?.isActive || !currentStep || !progress.completedSteps) {
    return null;
  }

  const isOverlay = currentStep.overlay || currentStep.position === 'center';
  const stepNumber = (progress?.currentStep || 0) + 1;
  const totalSteps = tutorialService.getCurrentStep(progress) ? 20 : 1; // Approximate total steps

  return (
    <>
      {/* Dark overlay for center/overlay steps */}
      {isOverlay && (
        <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
      )}
      
      {/* Tutorial tooltip */}
      <div
        className={`fixed z-50 max-w-sm bg-fantasy-blue/95 backdrop-blur-sm border border-fantasy-gold/50 rounded-lg shadow-xl p-6 transform transition-all duration-300 ${
          isOverlay ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
        }`}
        style={!isOverlay ? { 
          left: `${tooltipPosition.x}px`, 
          top: `${tooltipPosition.y}px`,
          transform: getTooltipTransform(currentStep.position)
        } : {}}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-fantasy-gold rounded-full flex items-center justify-center text-fantasy-dark font-bold text-sm">
              {stepNumber}
            </div>
            <span className="text-xs text-gray-400">
              Step {stepNumber} of {totalSteps}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentStep.skippable && (
              <button
                onClick={onSkipTutorial}
                className="text-gray-400 hover:text-gray-300 transition-colors"
                title="Skip tutorial"
              >
                <SkipForward size={16} />
              </button>
            )}
            <button
              onClick={onRestartTutorial}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              title="Restart tutorial"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-fantasy-gold font-fantasy text-lg mb-3">
            {currentStep.title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {currentStep.content}
          </p>
        </div>

        {/* Action hint */}
        {currentStep.action && (
          <div className="mb-4 p-3 bg-fantasy-dark/50 rounded border border-fantasy-purple/30">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-fantasy-gold rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">
                {currentStep.action === 'click' && 'Click the highlighted element to continue'}
                {currentStep.action === 'input' && 'Enter text in the highlighted field'}
                {currentStep.action === 'navigate' && 'Navigate to the specified section'}
                {currentStep.action === 'wait' && 'Please wait for the action to complete'}
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {progress?.completedSteps?.length || 0} completed
          </div>
          
          <div className="flex items-center space-x-3">
            {currentStep.nextTrigger === 'click' && (
              <Button
                onClick={handleNextStep}
                size="sm"
                className="text-sm"
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
            
            {currentStep.nextTrigger === 'auto' && (
              <div className="text-xs text-gray-400 italic">
                Continuing automatically...
              </div>
            )}
          </div>
        </div>

        {/* Tooltip arrow */}
        {!isOverlay && (
          <div 
            className={`absolute w-0 h-0 border-8 border-transparent ${getArrowClasses(currentStep.position)}`}
          />
        )}
      </div>

      {/* Highlight overlay for specific elements */}
      {highlightedElement && (
        <style>{`
          .tutorial-highlight {
            position: relative !important;
            z-index: 41 !important;
            box-shadow: 0 0 0 4px rgba(243, 156, 18, 0.5), 0 0 0 8px rgba(243, 156, 18, 0.2) !important;
            border-radius: 4px !important;
            animation: tutorial-pulse 2s infinite !important;
          }
          
          @keyframes tutorial-pulse {
            0% { box-shadow: 0 0 0 4px rgba(243, 156, 18, 0.5), 0 0 0 8px rgba(243, 156, 18, 0.2); }
            50% { box-shadow: 0 0 0 4px rgba(243, 156, 18, 0.8), 0 0 0 12px rgba(243, 156, 18, 0.1); }
            100% { box-shadow: 0 0 0 4px rgba(243, 156, 18, 0.5), 0 0 0 8px rgba(243, 156, 18, 0.2); }
          }
        `}</style>
      )}
    </>
  );
};

function getTooltipTransform(position: TutorialStep['position']): string {
  switch (position) {
    case 'top':
      return 'translate(-50%, -100%)';
    case 'bottom':
      return 'translate(-50%, 0%)';
    case 'left':
      return 'translate(-100%, -50%)';
    case 'right':
      return 'translate(0%, -50%)';
    case 'center':
      return 'translate(-50%, -50%)';
    default:
      return 'translate(-50%, -50%)';
  }
}

function getArrowClasses(position: TutorialStep['position']): string {
  switch (position) {
    case 'top':
      return 'top-full left-1/2 transform -translate-x-1/2 border-t-fantasy-blue/95';
    case 'bottom':
      return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-fantasy-blue/95';
    case 'left':
      return 'left-full top-1/2 transform -translate-y-1/2 border-l-fantasy-blue/95';
    case 'right':
      return 'right-full top-1/2 transform -translate-y-1/2 border-r-fantasy-blue/95';
    default:
      return 'hidden';
  }
}

export default TutorialOverlay;