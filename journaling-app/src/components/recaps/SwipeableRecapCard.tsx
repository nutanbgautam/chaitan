'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { 
  Heart, 
  Users, 
  MapPin, 
  Brain, 
  Target, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Share2,
  Bookmark
} from 'lucide-react';

interface RecapCard {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  content: string;
  insights: string[];
  highlights: string[];
  data: any;
}

interface SwipeableRecapCardProps {
  cards: RecapCard[];
  onCardComplete?: (cardId: string) => void;
  onShare?: (cardId: string) => void;
  onSave?: (cardId: string) => void;
}

export default function SwipeableRecapCard({ 
  cards, 
  onCardComplete, 
  onShare, 
  onSave 
}: SwipeableRecapCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  const currentCard = cards[currentIndex];

  // Auto-advance functionality
  useEffect(() => {
    if (!isAutoPlaying || isPaused || currentIndex >= cards.length - 1) return;

    const timer = setTimeout(() => {
      handleNext();
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [currentIndex, isAutoPlaying, isPaused, cards.length]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handleSwipe = async (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold) {
      // Swipe right - go to previous
      await controls.start({ x: 300, opacity: 0 });
      handlePrevious();
    } else if (info.offset.x < -swipeThreshold) {
      // Swipe left - go to next
      await controls.start({ x: -300, opacity: 0 });
      handleNext();
    } else {
      // Return to center
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handleTap = () => {
    // Toggle pause/play
    setIsPaused(!isPaused);
  };

  const handleShare = () => {
    onShare?.(currentCard.id);
  };

  const handleSave = () => {
    onSave?.(currentCard.id);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'people': <Users className="w-6 h-6" />,
      'mood': <Heart className="w-6 h-6" />,
      'places': <MapPin className="w-6 h-6" />,
      'growth': <Brain className="w-6 h-6" />,
      'goals': <Target className="w-6 h-6" />,
      'finance': <DollarSign className="w-6 h-6" />
    };
    return iconMap[category] || <Users className="w-6 h-6" />;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'people': 'bg-primary',
      'mood': 'bg-danger',
      'places': 'bg-success',
      'growth': 'bg-info',
      'goals': 'bg-warning',
      'finance': 'bg-secondary'
    };
    return colorMap[category] || 'bg-primary';
  };

  if (!currentCard) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100">
        <div className="text-center">
          <div className="display-1 mb-4">🎉</div>
          <h2 className="text-white display-6 fw-bold mb-3">Recap Complete!</h2>
          <p className="text-white opacity-75 fs-5">You've seen all your highlights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="position-relative h-100 d-flex flex-column">
      {/* Progress Bar */}
      <div className="position-absolute top-0 start-0 end-0 p-3 z-3">
        <div className="d-flex align-items-center justify-content-between text-white mb-3">
          <span className="fs-6 fw-medium">
            {currentIndex + 1} of {cards.length}
          </span>
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="btn btn-light btn-sm rounded-circle p-2"
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShare}
              className="btn btn-light btn-sm rounded-circle p-2"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="btn btn-light btn-sm rounded-circle p-2"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="progress bg-white bg-opacity-25" style={{ height: '4px' }}>
          <div 
            className="progress-bar bg-white"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
        <motion.div
          ref={cardRef}
          className="w-100 h-100 d-flex align-items-center justify-content-center"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleSwipe}
          onClick={handleTap}
          animate={controls}
          initial={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="card border-0 shadow-lg overflow-hidden w-100" style={{ 
            borderRadius: '20px', 
            maxWidth: '400px',
            maxHeight: '90%',
            minHeight: '400px'
          }}>
            {/* Card Header */}
            <div className={`${getCategoryColor(currentCard.category)} text-white p-4`}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                    {getCategoryIcon(currentCard.category)}
                  </div>
                  <div>
                    <div className="text-white opacity-75 small">{currentCard.subtitle}</div>
                  </div>
                </div>
              </div>
              <h2 className="fs-4 fw-bold mb-0">{currentCard.title}</h2>
            </div>

            {/* Card Content */}
            <div className="card-body p-4 d-flex flex-column" style={{ height: 'calc(100% - 120px)' }}>
              <div className="text-dark fs-6 lh-base mb-4 flex-grow-1">
                {currentCard.content}
              </div>

              {/* Insights */}
              {currentCard.insights.length > 0 && (
                <div className="mb-3">
                  <h6 className="text-dark fw-semibold mb-2 d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                      <div className="text-primary small">💡</div>
                    </div>
                    Key Insights
                  </h6>
                  <ul className="list-unstyled">
                    {currentCard.insights.map((insight, index) => (
                      <li key={index} className="d-flex align-items-start mb-1">
                        <div className="text-primary me-2 mt-1 small">•</div>
                        <span className="text-dark small">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Highlights */}
              {currentCard.highlights.length > 0 && (
                <div className="mt-auto">
                  <h6 className="text-dark fw-semibold mb-2 d-flex align-items-center">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-1 me-2">
                      <div className="text-warning small">⭐</div>
                    </div>
                    Highlights
                  </h6>
                  <ul className="list-unstyled">
                    {currentCard.highlights.map((highlight, index) => (
                      <li key={index} className="d-flex align-items-start mb-1">
                        <div className="text-warning me-2 mt-1 small">✨</div>
                        <span className="text-dark small">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x p-3">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`btn rounded-circle ${currentIndex === 0 ? 'btn-secondary' : 'btn-light'} p-2`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-white fs-6 fw-medium">
            {currentIndex + 1} / {cards.length}
          </div>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className={`btn rounded-circle ${currentIndex === cards.length - 1 ? 'btn-secondary' : 'btn-light'} p-2`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 