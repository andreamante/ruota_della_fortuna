import { Injectable } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  type: 'ribbon' | 'coin' | 'star';
  opacity: number;
  decay: number;
  tilt: number;
  tiltSpeed: number;
}

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationId: number | null = null;

  public init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  public resize(): void {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public launchJackpotCelebration(): void {
    if (!this.canvas || !this.ctx) return;
    this.resize();

    const w = this.canvas.width;
    const h = this.canvas.height;
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF1493', '#00FFFF', '#7FFF00', '#FFFFFF', '#FF3366'];

    // Spawn 2 waves: left cannon and right cannon, plus center fountain
    const totalParticles = 240;
    for (let i = 0; i < totalParticles; i++) {
      const source = i % 3;
      let startX: number;
      let startY: number;
      let angle: number;
      let speed: number;

      if (source === 0) {
        // Bottom left corner cannon
        startX = w * 0.15;
        startY = h * 0.95;
        angle = -Math.PI / 3 + (Math.random() - 0.5) * 0.7;
        speed = 14 + Math.random() * 16;
      } else if (source === 1) {
        // Bottom right corner cannon
        startX = w * 0.85;
        startY = h * 0.95;
        angle = (-2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.7;
        speed = 14 + Math.random() * 16;
      } else {
        // Center burst
        startX = w * 0.5;
        startY = h * 0.45;
        angle = Math.random() * Math.PI * 2;
        speed = 6 + Math.random() * 14;
      }

      const types: ('ribbon' | 'coin' | 'star')[] = ['coin', 'ribbon', 'star'];
      const type = types[Math.floor(Math.random() * types.length)];

      this.particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: type === 'coin' ? 9 + Math.random() * 6 : 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        type,
        opacity: 1,
        decay: 0.004 + Math.random() * 0.005,
        tilt: Math.random() * 10,
        tiltSpeed: 0.05 + Math.random() * 0.1,
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  private animate = (): void => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // gravity
      p.vx *= 0.985; // drag
      p.rotation += p.vRot;
      p.tilt += p.tiltSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      if (p.type === 'coin') {
        // Gold Coin with 3D horizontal tilt
        const xDistort = Math.cos(p.tilt);
        this.ctx.scale(xDistort, 1);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fill();
        this.ctx.lineWidth = 1.8;
        this.ctx.strokeStyle = '#B8860B';
        this.ctx.stroke();

        // Inner rim
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 0.65, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      } else if (p.type === 'star') {
        // Shimmering Star
        this.drawStar(this.ctx, 0, 0, 5, p.size, p.size * 0.45, p.color);
      } else {
        // Confetti Ribbon
        const xDistort = Math.sin(p.tilt);
        this.ctx.scale(xDistort, 1);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.7);
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.animate);
    } else {
      this.animationId = null;
    }
  };

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    color: string
  ): void {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  public clear(): void {
    this.particles = [];
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
