'use client';

import { useEffect, useRef } from 'react';

const CHAKRA_COLORS = [
  '#FF0000', // Muladhara - Vermelho
  '#FF8C00', // Svadhisthana - Laranja
  '#FFFF00', // Manipura - Amarelo
  '#00FF00', // Anahata - Verde
  '#00CED1', // Vishuddha - Azul Claro/Turquesa
  '#0000FF', // Ajna - Azul
  '#8B00FF', // Sahasrara - Violeta
];

interface ConcentricCircle {
  radius: number;
  color: string;
  opacity: number;
  rotationSpeed: number;
  segments: number;
}

const CIRCLES: ConcentricCircle[] = [
  { radius: 260, color: CHAKRA_COLORS[6], opacity: 0.9, rotationSpeed: 8, segments: 12 },
  { radius: 220, color: CHAKRA_COLORS[5], opacity: 0.85, rotationSpeed: -12, segments: 6 },
  { radius: 180, color: CHAKRA_COLORS[4], opacity: 0.8, rotationSpeed: 18, segments: 8 },
  { radius: 145, color: CHAKRA_COLORS[3], opacity: 0.75, rotationSpeed: -24, segments: 4 },
  { radius: 110, color: CHAKRA_COLORS[2], opacity: 0.7, rotationSpeed: 32, segments: 10 },
  { radius: 75, color: CHAKRA_COLORS[1], opacity: 0.65, rotationSpeed: -40, segments: 5 },
  { radius: 45, color: CHAKRA_COLORS[0], opacity: 0.6, rotationSpeed: 50, segments: 3 },
];

const MIN_SIZE = 2;
const MAX_SIZE = 6;

interface Orb {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  speed: number;
  angle: number;
  radius: number;
  pulsePhase: number;
}

function generateOrbs(
  circles: ConcentricCircle[],
  centerX: number,
  centerY: number
): Orb[] {
  const orbs: Orb[] = [];

  circles.forEach((circle, circleIndex) => {
    for (let i = 0; i < (8 - circleIndex); i++) {
      const angle = (Math.PI * 2 * i) / (8 - circleIndex);
      const colorIndex = (circleIndex + i) % CHAKRA_COLORS.length;
      orbs.push({
        x: centerX + Math.cos(angle) * circle.radius,
        y: centerY + Math.sin(angle) * circle.radius,
        size: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
        color: CHAKRA_COLORS[colorIndex],
        opacity: 0.4 + Math.random() * 0.4,
        speed: 0.3 + Math.random() * 0.7,
        angle,
        radius: circle.radius,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  });

  return orbs;
}

export default function MandalaEnergia() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const orbsRef = useRef<Orb[]>([]);
  const rotateRef = useRef<number[]>(CIRCLES.map(() => 0));
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    orbsRef.current = generateOrbs(CIRCLES, centerX, centerY);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      timeRef.current += 0.016;

      // draw glow center
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        50
      );
      glowGradient.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
      glowGradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.3)');
      glowGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // draw concentric circles
      CIRCLES.forEach((circle, index) => {
        rotateRef.current[index] += (circle.rotationSpeed * Math.PI * 2) / 3600;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotateRef.current[index]);

        ctx.beginPath();
        ctx.arc(0, 0, circle.radius, 0, Math.PI * 2);
        ctx.strokeStyle = circle.color;
        ctx.globalAlpha = circle.opacity;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw segments
        for (let i = 0; i < circle.segments; i++) {
          const angle = (Math.PI * 2 * i) / circle.segments;
          const innerRadius = circle.radius - 8;
          const outerRadius = circle.radius + 8;

          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
          ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
          ctx.strokeStyle = circle.color;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.restore();
      });

      // draw orbs
      orbsRef.current.forEach((orb) => {
        orb.angle += (orb.speed * Math.PI * 2) / 3600;

        const currentRadius = orb.radius + Math.sin(timeRef.current * 2 + orb.pulsePhase) * 8;
        orb.x = centerX + Math.cos(orb.angle) * currentRadius;
        orb.y = centerY + Math.sin(orb.angle) * currentRadius;

        const pulseOpacity =
          orb.opacity + Math.sin(timeRef.current * 3 + orb.pulsePhase) * 0.2;

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);

        const orbGradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.size
        );
        orbGradient.addColorStop(0, orb.color);
        orbGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = orbGradient;
        ctx.globalAlpha = Math.max(0, Math.min(1, pulseOpacity));
        ctx.fill();
      });

      // draw connector lines
      orbsRef.current.forEach((orb) => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(orb.x, orb.y);
        ctx.strokeStyle = '#FFD700';
        ctx.globalAlpha = 0.08;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      ctx.globalAlpha = 1;

      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={560}
        height={560}
        className="w-full h-full max-w-[560px] max-h-[560px]"
      />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(255,215,0,0.8)]" />
      </div>
    </div>
  );
}
