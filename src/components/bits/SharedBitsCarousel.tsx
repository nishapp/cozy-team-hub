
import React, { useState, useEffect } from "react";
import BitCard from "./BitCard";
import { useInterval } from "@/hooks/useInterval";

interface SharedBit {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  visibility: string;
  wdylt_comment?: string;
  image_url?: string;
  created_at: string;
  shared_by: string;
}

interface SharedBitsCarouselProps {
  sharedBits: SharedBit[];
}

const SharedBitsCarousel: React.FC<SharedBitsCarouselProps> = ({ sharedBits }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedBits, setDisplayedBits] = useState<SharedBit[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Number of cards to display at once based on screen size
  const getDisplayCount = () => {
    if (window.innerWidth >= 1280) return 5; // xl
    if (window.innerWidth >= 1024) return 4; // lg
    if (window.innerWidth >= 768) return 3;  // md
    if (window.innerWidth >= 640) return 2;  // sm
    return 1;                                // xs
  };
  
  const [displayCount, setDisplayCount] = useState(getDisplayCount());
  
  // Update display count on window resize
  useEffect(() => {
    const handleResize = () => {
      setDisplayCount(getDisplayCount());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Initialize displayed bits
  useEffect(() => {
    if (sharedBits.length > 0) {
      updateDisplayedBits();
    }
  }, [sharedBits, displayCount]);
  
  // Auto-scroll every 10 seconds
  useInterval(() => {
    if (sharedBits.length > displayCount) {
      rotateCards();
    }
  }, 10000);
  
  const rotateCards = () => {
    setIsTransitioning(true);
    
    // After fade out animation completes, update the cards
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % sharedBits.length);
      
      // Reset transition state
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 500); // Duration of fade-out animation
  };
  
  const updateDisplayedBits = () => {
    const bits = [];
    for (let i = 0; i < displayCount; i++) {
      const index = (currentIndex + i) % sharedBits.length;
      bits.push(sharedBits[index]);
    }
    setDisplayedBits(bits);
  };
  
  // Update displayed bits when currentIndex changes
  useEffect(() => {
    updateDisplayedBits();
  }, [currentIndex, displayCount, sharedBits]);
  
  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Shared by friends</h2>
        <p className="text-muted-foreground mb-4">Discover bits that your friends have shared with you</p>
      </div>
      
      <div 
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
      >
        {displayedBits.map((bit) => (
          <div key={bit.id} className="relative">
            <BitCard bit={bit} />
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {bit.shared_by}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedBitsCarousel;
