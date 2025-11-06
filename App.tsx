
import React, { useState, useEffect, useMemo } from 'react';
import { useTimer } from './hooks/useTimer';

// Constants
const NUM_PARTICLES = 600;
const HEART_FORMATION_DURATION = 3000; // ms
const FINAL_SCENE_DELAY = 1000; // ms after heart forms
const OUTLINE_PARTICLE_COUNT = Math.floor(NUM_PARTICLES * 0.4);
const ANNIVERSARY_DATE = '2023-10-27T00:00:00Z';

// Type definition for a particle
interface Particle {
  id: number;
  initialX: number;
  initialY: number;
  heartX: number;
  heartY: number;
  delay: number;
  size: number;
  color: string;
}

// Function to get a point on the heart curve
const getHeartPoint = (t: number): { x: number; y: number } => {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x, y };
};

// Main App Component
const App: React.FC = () => {
  const [animationStep, setAnimationStep] = useState(0); // 0: initial, 1: forming heart, 2: final scene
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showGlow, setShowGlow] = useState(false); // State to trigger the 'nova burst'
  const time = useTimer(animationStep === 2, ANNIVERSARY_DATE);

  // Generate particles on component mount
  useEffect(() => {
    const generatedParticles: Particle[] = [];
    const colors = [
      '#FFFFFF', '#FFFACD', '#ADD8E6', '#E6E6FA', '#FFDAB9',
      '#F08080', '#20B2AA', '#9370DB', '#87CEEB', '#FFB6C1'
    ];
    
    const boundaryPoints: { x: number; y: number }[] = [];
    for (let i = 0; i < 100; i++) {
        const t = (i / 100) * 2 * Math.PI;
        boundaryPoints.push(getHeartPoint(t));
    }

    const minX = Math.min(...boundaryPoints.map(p => p.x));
    const maxX = Math.max(...boundaryPoints.map(p => p.x));
    const minY = Math.min(...boundaryPoints.map(p => p.y));
    const maxY = Math.max(...boundaryPoints.map(p => p.y));
    const heartWidth = maxX - minX;
    const heartHeight = maxY - minY;

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const isOutlineParticle = i < OUTLINE_PARTICLE_COUNT;
      let t: number, scale: number, size: number;

      if (isOutlineParticle) {
        t = (i / OUTLINE_PARTICLE_COUNT) * 2 * Math.PI;
        scale = 1 - Math.random() * 0.08;
        size = Math.random() * 2 + 2.0;
      } else {
        t = Math.random() * 2 * Math.PI;
        scale = Math.pow(Math.random(), 0.5) * 0.95;
        size = Math.random() * 2 + 1.5;
      }
      
      const pointOnBoundary = getHeartPoint(t);
      const finalPoint = {
          x: pointOnBoundary.x * scale,
          y: pointOnBoundary.y * scale,
      };

      const normalizedX = (finalPoint.x - minX) / heartWidth;
      const normalizedY = (finalPoint.y - minY) / heartHeight;
      
      const heartX = 35 + normalizedX * 30;
      const heartY = 30 + normalizedY * 40;
      
      generatedParticles.push({
        id: i,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        heartX,
        heartY,
        delay: Math.random() * 1.5,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(generatedParticles);
  }, []);

  // Handle animation sequencing and glow effect
  useEffect(() => {
    if (animationStep === 1) {
      const glowTimer = setTimeout(() => {
          setShowGlow(true);
      }, HEART_FORMATION_DURATION);

      const finalSceneTimer = setTimeout(() => {
        setAnimationStep(2);
      }, HEART_FORMATION_DURATION + FINAL_SCENE_DELAY);
      
      return () => {
          clearTimeout(glowTimer);
          clearTimeout(finalSceneTimer);
      };
    }
  }, [animationStep]);

  const handleBeginClick = () => {
    if (animationStep === 0 && particles.length > 0) {
      setAnimationStep(1);
    }
  };
  
  const heartContainerClasses = useMemo(() => {
    // Make heart larger in final scene
    return `absolute inset-0 transition-all duration-1000 ease-in-out ${
      animationStep === 2 ? 'scale-95 -translate-y-[15%]' : 'scale-100 translate-y-0'
    }`;
  }, [animationStep]);
  
  const finalSceneClasses = useMemo(() => {
    return `transition-opacity duration-1000 ease-in ${
      animationStep === 2 ? 'opacity-100' : 'opacity-0'
    }`;
  }, [animationStep]);

  return (
    <div
      className="fixed inset-0 overflow-hidden cursor-pointer select-none"
      onClick={handleBeginClick}
    >
      {/* Initial "Click to Begin" Message */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${animationStep === 0 ? 'opacity-100' : 'opacity-0'}`}>
        {particles.length > 0 && (
          <h1 className="text-3xl md:text-5xl text-white/80 italic">
            Click to Begin
          </h1>
        )}
      </div>

      {/* Heart Formation Glow Burst */}
      {showGlow && (
          <div 
              className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-200/80 rounded-full animate-cosmic-glow-burst pointer-events-none"
              style={{
                  filter: 'blur(100px)',
                  transformOrigin: 'center',
              }}
          />
      )}

      {/* Particles and Heart Container */}
      <div className={heartContainerClasses}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${
              animationStep === 0 ? 'animate-particle-drift' : ''
            } ${animationStep >= 1 ? 'animate-shimmer animate-particle-swarm' : ''}`}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${animationStep >= 1 ? particle.heartX : particle.initialX}%`,
              top: `${animationStep >= 1 ? particle.heartY : particle.initialY}%`,
              backgroundColor: particle.color,
              transition: `all ${HEART_FORMATION_DURATION / 1000}s cubic-bezier(0.68, -0.55, 0.27, 1.55)`,
              transitionDelay: `${particle.delay}s`,
              animationDelay: `${particle.delay}s`,
              boxShadow: `0 0 12px 3px ${particle.color}90`,
            }}
          />
        ))}
      </div>
      
      {/* Final Scene Elements */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${finalSceneClasses} pointer-events-none`}>
        <div className="text-center text-white mt-auto pb-16 md:pb-24">
           <h2 className="text-4xl md:text-6xl text-white/90 italic" style={{ textShadow: '0 0 25px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.6)' }}>
            Peter & Ellie
          </h2>
          <p className="text-lg md:text-xl font-sans font-light mt-4 text-white/70 tracking-widest">
            Since October 27, 2023
          </p>
          <p className="text-2xl md:text-4xl font-sans font-light mt-2 tracking-widest text-white/80">
            {time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
