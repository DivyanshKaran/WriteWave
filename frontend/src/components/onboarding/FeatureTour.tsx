"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Target, Star, TrendingUp, Users, BookOpen, Zap, CheckCircle } from 'lucide-react';

interface FeatureTourProps {
  onComplete: () => void;
  className?: string;
}

interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  icon: React.ReactNode;
  action?: string;
  tips?: string[];
  interactive?: boolean;
}

export const FeatureTour: React.FC<FeatureTourProps> = ({ onComplete, className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'xp-display',
      target: '.xp-display',
      title: 'Your Learning Progress',
      content: 'This shows your XP and current level. Earn XP by completing lessons and practicing characters!',
      placement: 'bottom',
      icon: <Star className="w-5 h-5" />,
      action: 'Click to see level details',
      tips: ['XP is earned through practice', 'Higher levels unlock new features', 'Daily XP goals keep you motivated'],
      interactive: true
    },
    {
      id: 'daily-goal',
      target: '.daily-goal',
      title: 'Daily Learning Goal',
      content: 'Your daily goal helps you stay consistent. Try to reach it every day to build strong learning habits!',
      placement: 'bottom',
      icon: <Target className="w-5 h-5" />,
      action: 'Tap to adjust your goal',
      tips: ['Consistent daily practice is key', 'Start with achievable goals', 'You can change your goal anytime'],
      interactive: true
    },
    {
      id: 'streak-counter',
      target: '.streak-counter',
      title: 'Learning Streak',
      content: 'Your streak shows how many days in a row you\'ve studied. Don\'t break it - consistency is the secret to success!',
      placement: 'bottom',
      icon: <TrendingUp className="w-5 h-5" />,
      action: 'View streak history',
      tips: ['Streaks build momentum', 'Even 5 minutes counts', 'Don\'t worry if you miss a day'],
      interactive: true
    },
    {
      id: 'character-grid',
      target: '.character-grid',
      title: 'Character Practice',
      content: 'Here you can practice characters you\'ve learned or discover new ones. Each character has interactive lessons!',
      placement: 'top',
      icon: <BookOpen className="w-5 h-5" />,
      action: 'Try practicing a character',
      tips: ['Start with characters you know', 'Practice stroke order', 'Use the drawing canvas'],
      interactive: true
    },
    {
      id: 'progress-section',
      target: '.progress-section',
      title: 'Learning Progress',
      content: 'Track your progress through each writing system. See how far you\'ve come and what\'s next!',
      placement: 'top',
      icon: <Zap className="w-5 h-5" />,
      action: 'Explore your progress',
      tips: ['Hiragana is the foundation', 'Katakana is for foreign words', 'Kanji builds vocabulary'],
      interactive: true
    },
    {
      id: 'community-features',
      target: '.community-features',
      title: 'Community & Social',
      content: 'Connect with other learners, join study groups, and share your progress. Learning is better together!',
      placement: 'top',
      icon: <Users className="w-5 h-5" />,
      action: 'Join the community',
      tips: ['Study groups keep you motivated', 'Share your achievements', 'Help other learners'],
      interactive: true
    }
  ];

  useEffect(() => {
    // Start the tour after a short delay
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isActive && currentStep < tourSteps.length) {
      const currentStepData = tourSteps[currentStep];
      const element = document.querySelector(currentStepData.target) as HTMLElement;
      
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setShowTips(false);
    } else {
      setIsActive(false);
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowTips(false);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    onComplete();
  };

  const handleActionComplete = (stepId: string) => {
    setCompletedActions(prev => new Set([...prev, stepId]));
  };

  const getTooltipPosition = (element: HTMLElement, placement: string) => {
    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    
    let top = 0;
    let left = 0;
    
    switch (placement) {
      case 'top':
        top = rect.top - tooltipHeight - 20;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - 20;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + 20;
        break;
    }
    
    // Ensure tooltip stays within viewport
    left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));
    top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
    
    return { top, left };
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 ${className}`}>
      {/* Mock UI Elements for Tour */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white border-base rounded-lg shadow-sm">
          <div className="flex items-center gap-6">
            <div className="xp-display p-4 border-base rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <div className="text-sm text-gray-500">Level 1</div>
              <div className="text-2xl font-bold text-primary">150 XP</div>
            </div>
            <div className="daily-goal p-4 border-base rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
              <div className="text-sm text-gray-500">Daily Goal</div>
              <div className="text-2xl font-bold text-green-600">75 XP</div>
            </div>
            <div className="streak-counter p-4 border-base rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
              <div className="text-sm text-gray-500">Streak</div>
              <div className="text-2xl font-bold text-orange-600">🔥 3 days</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character Grid */}
          <div className="character-grid space-y-4">
            <h3 className="heading text-xl font-semibold">Practice Characters</h3>
            <div className="grid grid-cols-4 gap-4">
              {['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く'].map((char, index) => (
                <div
                  key={char}
                  className="aspect-square border-base rounded-lg flex items-center justify-center text-3xl font-bold hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                >
                  {char}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Section */}
          <div className="progress-section space-y-4">
            <h3 className="heading text-xl font-semibold">Your Progress</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Hiragana</span>
                  <span className="text-gray-600">8/46</span>
                </div>
                <div className="progress-bar w-full bg-gray-200 h-3 rounded-full">
                  <div className="bg-primary h-3 rounded-full transition-all duration-300" style={{ width: '17%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Katakana</span>
                  <span className="text-gray-600">0/46</span>
                </div>
                <div className="progress-bar w-full bg-gray-200 h-3 rounded-full">
                  <div className="bg-primary h-3 rounded-full transition-all duration-300" style={{ width: '0%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Kanji</span>
                  <span className="text-gray-600">0/100</span>
                </div>
                <div className="progress-bar w-full bg-gray-200 h-3 rounded-full">
                  <div className="bg-primary h-3 rounded-full transition-all duration-300" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Community Features */}
          <div className="community-features space-y-4">
            <h3 className="heading text-xl font-semibold">Community</h3>
            <div className="space-y-3">
              <div className="p-4 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Study Groups</div>
                    <div className="text-sm text-gray-600">Join other learners</div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="font-medium">Leaderboard</div>
                    <div className="text-sm text-gray-600">See your ranking</div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium">Achievements</div>
                    <div className="text-sm text-gray-600">Unlock badges</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tour Instructions */}
        <div className="text-center space-y-6">
          <div>
            <h2 className="heading text-3xl font-bold text-gray-900">Welcome to WriteWave!</h2>
            <p className="body text-lg text-gray-600 mt-2">
              Let's take a quick tour of the key features to get you started
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setIsActive(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              <Play className="w-4 h-4 mr-2 inline" />
              Start Tour
            </button>
            <button
              onClick={onComplete}
              className="px-6 py-3 text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              Skip Tour
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Tour Overlay */}
      <AnimatePresence>
        {isActive && highlightedElement && (
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Dark overlay with spotlight */}
            <div className="absolute inset-0 bg-black bg-opacity-60" />
            
            {/* Spotlight effect */}
            <div
              className="absolute rounded-lg border-2 border-white shadow-2xl"
              style={{
                top: highlightedElement.getBoundingClientRect().top - 8,
                left: highlightedElement.getBoundingClientRect().left - 8,
                width: highlightedElement.getBoundingClientRect().width + 16,
                height: highlightedElement.getBoundingClientRect().height + 16,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
              }}
            />
            
            {/* Tooltip */}
            <motion.div
              className="absolute bg-white border-base rounded-lg shadow-2xl p-6 max-w-sm"
              style={getTooltipPosition(highlightedElement, tourSteps[currentStep].placement)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-primary">
                      {tourSteps[currentStep].icon}
                    </div>
                    <h3 className="font-semibold text-lg">{tourSteps[currentStep].title}</h3>
                  </div>
                  <button
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600">
                  {tourSteps[currentStep].content}
                </p>
                
                {tourSteps[currentStep].action && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleActionComplete(tourSteps[currentStep].id)}
                      className="px-3 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      {tourSteps[currentStep].action}
                    </button>
                    {completedActions.has(tourSteps[currentStep].id) && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="text-xs text-primary hover:text-primary-dark transition-colors"
                  >
                    {showTips ? 'Hide tips' : 'Show tips'}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-500">
                      {currentStep + 1} of {tourSteps.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {showTips && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2 border-t border-gray-200"
                    >
                      <h4 className="text-xs font-medium text-gray-700">Pro Tips:</h4>
                      <ul className="space-y-1">
                        {tourSteps[currentStep].tips?.map((tip, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                            <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex justify-between pt-2">
                  <button
                    onClick={handleSkip}
                    className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                  >
                    Skip Tour
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark transition-colors"
                  >
                    {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
