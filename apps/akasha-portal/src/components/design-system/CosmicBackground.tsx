import { cn } from '@/lib/shared/utils';

interface CosmicBackgroundProps {
  variant?: 'default' | 'dense' | 'subtle';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Mystical cosmic background component with CSS-only animated stars and nebula effects.
 * Purely decorative Server Component that wraps pages.
 * 
 * @example
 * ```tsx
 * <CosmicBackground variant="default">
 *   <YourPageContent />
 * </CosmicBackground>
 * ```
 */
export function CosmicBackground({ variant = 'default', className = '', children }: CosmicBackgroundProps) {
  return (
    <div
      className={cn('cosmic-bg-wrapper relative overflow-hidden', className)}
      aria-hidden="true"
    >
      {/* Stars layer - CSS box-shadow generated stars */}
      <div
        className={cn(
          'cosmic-stars absolute inset-0',
          variant === 'dense' && 'cosmic-stars--dense',
          variant === 'subtle' && 'cosmic-stars--subtle'
        )}
      />

      {/* Nebula gradients */}
      <div
        className={cn(
          'cosmic-nebula absolute inset-0',
          variant === 'dense' && 'cosmic-nebula--dense',
          variant === 'subtle' && 'cosmic-nebula--subtle'
        )}
      />

      {/* Floating particle pseudo-elements */}
      <div className="cosmic-particles absolute inset-0" />

      {/* Content slot */}
      <div className="relative z-10">
        {children}
      </div>

      <style jsx>{`
        /* Void background */
        .cosmic-bg-wrapper {
          background-color: #0a0a0f;
        }

        /* ========================================
         * STAR TWINKLE ANIMATION
         * Stars created with multiple box-shadows
         * ======================================== */
        .cosmic-stars {
          animation: starTwinkle 4s ease-in-out infinite;
        }

        .cosmic-stars--dense {
          animation-duration: 3s;
        }

        .cosmic-stars--subtle {
          animation-duration: 6s;
          opacity: 0.5;
        }

        .cosmic-stars::before {
          content: '';
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          box-shadow:
            /* Bright white stars */
            5vw 10vh 0 0 rgba(255, 255, 255, 0.9),
            15vw 25vh 0 0 rgba(255, 255, 255, 0.8),
            25vw 5vh 0 0 rgba(255, 255, 255, 0.95),
            35vw 40vh 0 0 rgba(255, 255, 255, 0.7),
            45vw 15vh 0 0 rgba(255, 255, 255, 0.85),
            55vw 35vh 0 0 rgba(255, 255, 255, 0.9),
            65vw 8vh 0 0 rgba(255, 255, 255, 0.75),
            75vw 45vh 0 0 rgba(255, 255, 255, 0.8),
            85vw 20vh 0 0 rgba(255, 255, 255, 0.9),
            95vw 50vh 0 0 rgba(255, 255, 255, 0.85),
            10vw 60vh 0 0 rgba(255, 255, 255, 0.8),
            20vw 75vh 0 0 rgba(255, 255, 255, 0.9),
            30vw 85vh 0 0 rgba(255, 255, 255, 0.75),
            40vw 65vh 0 0 rgba(255, 255, 255, 0.85),
            50vw 90vh 0 0 rgba(255, 255, 255, 0.8),
            60vw 70vh 0 0 rgba(255, 255, 255, 0.9),
            70vw 80vh 0 0 rgba(255, 255, 255, 0.7),
            80vw 55vh 0 0 rgba(255, 255, 255, 0.85),
            90vw 95vh 0 0 rgba(255, 255, 255, 0.8),
            /* Gold-tinted stars */
            8vw 30vh 0 0 rgba(212, 175, 55, 0.8),
            18vw 55vh 0 0 rgba(212, 175, 55, 0.7),
            38vw 22vh 0 0 rgba(212, 175, 55, 0.85),
            58vw 48vh 0 0 rgba(212, 175, 55, 0.75),
            78vw 12vh 0 0 rgba(212, 175, 55, 0.8),
            88vw 68vh 0 0 rgba(212, 175, 55, 0.7),
            /* Violet-tinted stars */
            12vw 42vh 0 0 rgba(139, 92, 246, 0.7),
            32vw 78vh 0 0 rgba(139, 92, 246, 0.8),
            52vw 28vh 0 0 rgba(139, 92, 246, 0.75),
            72vw 88vh 0 0 rgba(139, 92, 246, 0.7);
        }

        /* Dense variant - more stars */
        .cosmic-stars--dense::after {
          content: '';
          position: absolute;
          width: 1px;
          height: 1px;
          background: white;
          border-radius: 50%;
          box-shadow:
            /* Additional small dim stars for density */
            3vw 7vh 0 0 rgba(255, 255, 255, 0.5),
            7vw 18vh 0 0 rgba(255, 255, 255, 0.4),
            13vw 33vh 0 0 rgba(255, 255, 255, 0.6),
            17vw 52vh 0 0 rgba(255, 255, 255, 0.45),
            23vw 8vh 0 0 rgba(255, 255, 255, 0.55),
            27vw 62vh 0 0 rgba(255, 255, 255, 0.4),
            33vw 28vh 0 0 rgba(255, 255, 255, 0.5),
            37vw 72vh 0 0 rgba(255, 255, 255, 0.45),
            43vw 3vh 0 0 rgba(255, 255, 255, 0.55),
            47vw 58vh 0 0 rgba(255, 255, 255, 0.4),
            53vw 82vh 0 0 rgba(255, 255, 255, 0.5),
            57vw 12vh 0 0 rgba(255, 255, 255, 0.45),
            63vw 42vh 0 0 rgba(255, 255, 255, 0.55),
            67vw 68vh 0 0 rgba(255, 255, 255, 0.4),
            73vw 22vh 0 0 rgba(255, 255, 255, 0.5),
            77vw 48vh 0 0 rgba(255, 255, 255, 0.45),
            83vw 78vh 0 0 rgba(255, 255, 255, 0.55),
            87vw 32vh 0 0 rgba(255, 255, 255, 0.4),
            93vw 58vh 0 0 rgba(255, 255, 255, 0.5),
            2vw 88vh 0 0 rgba(255, 255, 255, 0.45),
            92vw 2vh 0 0 rgba(255, 255, 255, 0.55),
            48vw 52vh 0 0 rgba(255, 255, 255, 0.4);
        }

        /* ========================================
         * NEBULA GRADIENTS
         * ======================================== */
        .cosmic-nebula {
          animation: nebulaDrift 20s ease-in-out infinite;
        }

        .cosmic-nebula--dense {
          animation-duration: 15s;
        }

        .cosmic-nebula--subtle {
          animation-duration: 30s;
          opacity: 0.6;
        }

        .cosmic-nebula::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            /* Purple nebula - top left */
            radial-gradient(ellipse at 15% 25%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
            /* Gold nebula - bottom right */
            radial-gradient(ellipse at 85% 75%, rgba(212, 175, 55, 0.08) 0%, transparent 45%),
            /* Deep violet accent */
            radial-gradient(ellipse at 60% 15%, rgba(107, 33, 168, 0.1) 0%, transparent 40%);
        }

        .cosmic-nebula::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            /* Secondary purple glow - top right */
            radial-gradient(ellipse at 75% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 35%),
            /* Amber accent - bottom left */
            radial-gradient(ellipse at 25% 80%, rgba(245, 158, 11, 0.06) 0%, transparent 40%),
            /* Soft center glow */
            radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 60%);
        }

        /* ========================================
         * FLOATING PARTICLES
         * ======================================== */
        .cosmic-particles {
          animation: particleFloat 25s linear infinite;
        }

        .cosmic-particles::before {
          content: '';
          position: absolute;
          width: 3px;
          height: 3px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.6) 0%, transparent 70%);
          border-radius: 50%;
          animation: particleGlow 8s ease-in-out infinite;
          top: 20%;
          left: 30%;
        }

        .cosmic-particles::after {
          content: '';
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%);
          border-radius: 50%;
          animation: particleGlow 10s ease-in-out infinite reverse;
          top: 60%;
          right: 25%;
        }

        /* ========================================
         * KEYFRAME ANIMATIONS
         * ======================================== */
        @keyframes starTwinkle {
          0%, 100% { 
            opacity: 0.7;
            filter: brightness(1);
          }
          50% { 
            opacity: 1;
            filter: brightness(1.2);
          }
        }

        @keyframes nebulaDrift {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          25% { 
            transform: translate(8px, -4px) scale(1.02);
            opacity: 0.95;
          }
          50% { 
            transform: translate(-4px, 6px) scale(0.98);
            opacity: 1;
          }
          75% { 
            transform: translate(6px, 4px) scale(1.01);
            opacity: 0.97;
          }
        }

        @keyframes particleFloat {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }

        @keyframes particleGlow {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.5;
          }
          50% { 
            transform: scale(1.5);
            opacity: 0.8;
          }
        }

        /* ========================================
         * PREFERS REDUCED MOTION
         * Disables all animations for accessibility
         * ======================================== */
        @media (prefers-reduced-motion: reduce) {
          .cosmic-stars,
          .cosmic-nebula,
          .cosmic-particles,
          .cosmic-stars::before,
          .cosmic-stars::after,
          .cosmic-nebula::before,
          .cosmic-nebula::after,
          .cosmic-particles::before,
          .cosmic-particles::after {
            animation: none !important;
          }
          
          .cosmic-stars {
            opacity: 0.8;
          }
          
          .cosmic-nebula {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
