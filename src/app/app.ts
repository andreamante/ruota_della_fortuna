import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CASINO_COLORS,
  DrawHistoryItem,
  WheelItem,
} from './models/wheel.model';
import { SoundService } from './services/sound.service';
import { ConfettiService } from './services/confetti.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  @ViewChild('wheelCanvas', { static: false })
  wheelCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('confettiCanvas', { static: false })
  confettiCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Wheel State Signals
  public wheelTitle = signal<string>('Ruota della Fortuna - Casinò');
  public items = signal<WheelItem[]>([
    { id: '1', text: '🏆 1000 Punti', color: '#E63946', active: true },
    { id: '2', text: '💎 Diamante', color: '#00BBF9', active: true },
    { id: '3', text: '🎁 Regalo Misterioso', color: '#9B5DE5', active: true },
    { id: '4', text: '🍕 Cena Offerta', color: '#F4A261', active: true },
    { id: '5', text: '☕ Pausa Caffè', color: '#2A9D8F', active: true },
    { id: '6', text: '⭐ Super Jolly', color: '#FFB703', active: true },
    { id: '7', text: '🎈 Palloncino', color: '#F15BB5', active: true },
    { id: '8', text: '🍀 Trifoglio Fortunato', color: '#00F5D4', active: true },
  ]);

  public autoExclude = signal<boolean>(false);
  public isSpinning = signal<boolean>(false);
  public selectedWinner = signal<WheelItem | null>(null);
  public showWinnerModal = signal<boolean>(false);
  public drawHistory = signal<DrawHistoryItem[]>([]);
  public activeTab = signal<'items' | 'settings' | 'history'>('items');
  public showBulkModal = signal<boolean>(false);
  public bulkText = signal<string>('');
  public newItemText = signal<string>('');
  public shareToast = signal<string | null>(null);

  // Dynamic Slot Lever Drag & Power State
  public leverPullProgress = signal<number>(0); // 0.0 to 1.0
  public isDraggingLever = signal<boolean>(false);
  public isLeverSnapping = signal<boolean>(false);
  private dragStartY = 0;
  private lastTensionStep = -1;

  // Computed signals
  public activeItems = computed(() => this.items().filter((item) => item.active));
  public totalItemsCount = computed(() => this.items().length);
  public activeItemsCount = computed(() => this.activeItems().length);
  public excludedItemsCount = computed(
    () => this.items().filter((item) => !item.active).length
  );

  // Dynamic Lever calculations
  public leverAngle = computed(() => this.leverPullProgress() * 68); // 0 to 68 deg
  public powerPercentage = computed(() => Math.round(this.leverPullProgress() * 100));
  public powerLabel = computed(() => {
    const p = this.powerPercentage();
    if (p === 0) return 'Tira la leva per caricare!';
    if (p < 30) return '🍃 Lancio Delicato';
    if (p < 60) return '🎯 Lancio Medio';
    if (p < 85) return '⚡ Lancio Forte';
    return '🔥 JACKPOT TURBO MAX!';
  });

  // Animation & Physics Variables
  private currentAngle = 0; // Current rotation in radians
  private pointerDeflection = 0; // Visual bounce for pointer needle
  private animationFrameId: number | null = null;
  private bulbPhase = 0; // For marquee flashing lights
  private bulbTimer: number | null = null;
  private lastTickSegment = -1;

  constructor(
    public soundService: SoundService,
    private confettiService: ConfettiService
  ) {}

  ngOnInit(): void {
    this.loadStateFromUrl();
    this.startBulbAnimation();
  }

  ngAfterViewInit(): void {
    if (this.confettiCanvasRef) {
      this.confettiService.init(this.confettiCanvasRef.nativeElement);
    }
    this.drawWheel();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.drawWheel();
  }

  private startBulbAnimation(): void {
    this.bulbTimer = window.setInterval(() => {
      this.bulbPhase = (this.bulbPhase + 1) % 4;
      if (!this.isSpinning()) {
        this.drawWheel();
      }
    }, 280);
  }

  // --- Wheel Drawing and Rendering ---
  public drawWheel(): void {
    if (!this.wheelCanvasRef) return;
    const canvas = this.wheelCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displaySize = Math.min(
      canvas.parentElement?.clientWidth || 500,
      520
    );

    if (canvas.width !== displaySize * dpr || canvas.height !== displaySize * dpr) {
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const size = displaySize;
    const center = size / 2;
    const radius = center - 24; // padding for marquee rim

    ctx.clearRect(0, 0, size, size);

    const items = this.activeItems();
    const count = items.length;

    // Outer Casino Frame / Bezel
    this.drawOuterBezel(ctx, center, radius + 22, radius);

    if (count === 0) {
      this.drawEmptyWheel(ctx, center, radius);
      ctx.restore();
      this.drawPointer(ctx, center, 24);
      return;
    }

    const arc = (2 * Math.PI) / count;

    // Draw Slices
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(this.currentAngle);

    for (let i = 0; i < count; i++) {
      const startAngle = i * arc;
      const endAngle = startAngle + arc;
      const item = items[i];

      // Slice sector
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      // Slice gradient for 3D metallic depth
      const midAngle = startAngle + arc / 2;
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.12, item.color);
      grad.addColorStop(0.85, item.color);
      grad.addColorStop(1, this.shadeColor(item.color, -35));

      ctx.fillStyle = grad;
      ctx.fill();

      // Golden slice border divider
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Decorative Peg on circumference
      const pegX = Math.cos(endAngle) * (radius - 6);
      const pegY = Math.sin(endAngle) * (radius - 6);
      this.drawPeg(ctx, pegX, pegY);

      // Text rendering
      ctx.save();
      ctx.rotate(midAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Smart dynamic font sizing
      const fontSize = Math.max(11, Math.min(18, Math.floor(340 / Math.max(8, count))));
      ctx.font = `bold ${fontSize}px 'Outfit', sans-serif`;

      let text = item.text;
      const maxTextWidth = radius - 70;
      if (ctx.measureText(text).width > maxTextWidth) {
        while (ctx.measureText(text + '…').width > maxTextWidth && text.length > 2) {
          text = text.slice(0, -1);
        }
        text += '…';
      }

      ctx.fillText(text, radius - 20, 0);
      ctx.restore();
    }

    // Inner shadow ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();

    // Center Golden Medallion Hub
    this.drawCenterHub(ctx, center, 44);

    ctx.restore();

    // Draw Indicator / Pointer at Top
    this.drawPointer(ctx, center, 24);
  }

  private drawOuterBezel(
    ctx: CanvasRenderingContext2D,
    center: number,
    outerR: number,
    innerR: number
  ): void {
    ctx.beginPath();
    ctx.arc(center, center, outerR, 0, Math.PI * 2);
    ctx.fillStyle = '#100a1c';
    ctx.fill();

    const goldGrad = ctx.createLinearGradient(0, center - outerR, 0, center + outerR);
    goldGrad.addColorStop(0, '#FFF2A1');
    goldGrad.addColorStop(0.3, '#FFD700');
    goldGrad.addColorStop(0.65, '#996515');
    goldGrad.addColorStop(1, '#FFE57F');

    ctx.lineWidth = 5;
    ctx.strokeStyle = goldGrad;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, innerR + 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.stroke();

    const bulbCount = 24;
    const bulbRadius = (outerR + innerR) / 2;

    for (let i = 0; i < bulbCount; i++) {
      const angle = (i * 2 * Math.PI) / bulbCount;
      const bx = center + Math.cos(angle) * bulbRadius;
      const by = center + Math.sin(angle) * bulbRadius;

      const isLit = (i + this.bulbPhase) % 2 === 0;

      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);

      if (isLit) {
        ctx.fillStyle = '#FFFDE7';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      } else {
        ctx.fillStyle = '#4A3B18';
        ctx.fill();
        ctx.strokeStyle = '#6E5824';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  private drawPeg(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  private drawCenterHub(ctx: CanvasRenderingContext2D, center: number, hubRadius: number): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, hubRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    const hubGrad = ctx.createLinearGradient(
      center - hubRadius,
      center - hubRadius,
      center + hubRadius,
      center + hubRadius
    );
    hubGrad.addColorStop(0, '#FFF2A1');
    hubGrad.addColorStop(0.3, '#FFD700');
    hubGrad.addColorStop(0.7, '#8B6508');
    hubGrad.addColorStop(1, '#FFDF70');

    ctx.beginPath();
    ctx.arc(center, center, hubRadius, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.stroke();

    const rubyRadius = hubRadius * 0.65;
    const rubyGrad = ctx.createRadialGradient(
      center - 3,
      center - 3,
      2,
      center,
      center,
      rubyRadius
    );
    rubyGrad.addColorStop(0, '#FF6B8B');
    rubyGrad.addColorStop(0.5, '#D90429');
    rubyGrad.addColorStop(1, '#67000F');

    ctx.beginPath();
    ctx.arc(center, center, rubyRadius, 0, Math.PI * 2);
    ctx.fillStyle = rubyGrad;
    ctx.fill();
    ctx.strokeStyle = '#FFF2A1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillStyle = '#FFE57F';
    ctx.fillText('🎰', center, center);

    ctx.restore();
  }

  private drawPointer(ctx: CanvasRenderingContext2D, center: number, topOffset: number): void {
    ctx.save();
    ctx.translate(center, topOffset + 14);
    ctx.rotate(this.pointerDeflection);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    ctx.moveTo(0, 26);
    ctx.lineTo(-14, -14);
    ctx.lineTo(14, -14);
    ctx.closePath();

    const arrowGrad = ctx.createLinearGradient(-14, 0, 14, 0);
    arrowGrad.addColorStop(0, '#FF4D6D');
    arrowGrad.addColorStop(0.45, '#FFD700');
    arrowGrad.addColorStop(0.55, '#FFD700');
    arrowGrad.addColorStop(1, '#FF4D6D');

    ctx.fillStyle = arrowGrad;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -12, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  private drawEmptyWheel(
    ctx: CanvasRenderingContext2D,
    center: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1b2e';
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 16px "Outfit", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Nessuna voce attiva', center, center - 15);
    ctx.font = '13px "Outfit", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Aggiungi o riattiva voci per girare!', center, center + 15);
  }

  private shadeColor(color: string, percent: number): string {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.min(255, Math.max(0, Math.floor(R + (percent * 255) / 100)));
    G = Math.min(255, Math.max(0, Math.floor(G + (percent * 255) / 100)));
    B = Math.min(255, Math.max(0, Math.floor(B + (percent * 255) / 100)));

    const RR = R.toString(16).padStart(2, '0');
    const GG = G.toString(16).padStart(2, '0');
    const BB = B.toString(16).padStart(2, '0');

    return `#${RR}${GG}${BB}`;
  }

  // --- Interactive Slot Lever Drag Mechanics ---
  public onLeverPointerDown(e: PointerEvent): void {
    if (this.isSpinning()) return;

    this.isDraggingLever.set(true);
    this.isLeverSnapping.set(false);
    this.dragStartY = e.clientY;
    this.lastTensionStep = -1;

    // Capture pointer events on window
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDraggingLever()) return;

    const deltaY = e.clientY - this.dragStartY;
    // 160px drag stroke is 100% force
    const maxStroke = 160;
    const progress = Math.min(1.0, Math.max(0, deltaY / maxStroke));
    this.leverPullProgress.set(progress);

    // Audio tension ticks as lever is pulled deeper
    const step = Math.floor(progress * 10);
    if (step !== this.lastTensionStep && step > 0) {
      this.soundService.playLeverTension(progress);
      this.lastTensionStep = step;
    }
  };

  private onPointerUp = (): void => {
    if (!this.isDraggingLever()) return;

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);

    this.isDraggingLever.set(false);
    const finalForce = this.leverPullProgress();

    // Snap lever back
    this.isLeverSnapping.set(true);
    this.soundService.playLeverSnap();
    this.leverPullProgress.set(0);

    setTimeout(() => {
      this.isLeverSnapping.set(false);
    }, 350);

    if (finalForce >= 0.1) {
      // Launch spin with the exact force pulled!
      this.triggerSpin(finalForce);
    } else {
      // Just a light tap or click: auto-pull with medium-high power
      this.animateAutoPullAndSpin(0.65);
    }
  };

  // Called when clicking the Big Spin Button
  public onBigSpinClick(): void {
    if (this.isSpinning()) return;
    this.animateAutoPullAndSpin(0.75);
  }

  private animateAutoPullAndSpin(targetPower: number): void {
    this.soundService.playLeverPull();
    this.isLeverSnapping.set(false);

    // Smooth lever pull-down animation
    let startTime: number | null = null;
    const pullDuration = 220;

    const stepPull = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / pullDuration);
      this.leverPullProgress.set(t * targetPower);

      if (t < 1) {
        requestAnimationFrame(stepPull);
      } else {
        // Snap back and spin!
        this.isLeverSnapping.set(true);
        this.soundService.playLeverSnap();
        this.leverPullProgress.set(0);

        setTimeout(() => {
          this.isLeverSnapping.set(false);
        }, 350);

        this.triggerSpin(targetPower);
      }
    };

    requestAnimationFrame(stepPull);
  }

  // --- Wheel Spin Logic ---
  public triggerSpin(forceRatio: number = 0.65): void {
    if (this.isSpinning()) return;

    const availableItems = this.activeItems();
    if (availableItems.length === 0) {
      this.soundService.playClick();
      alert('Non ci sono voci attive sulla ruota! Riattiva o aggiungi qualche voce.');
      return;
    }

    this.isSpinning.set(true);
    this.showWinnerModal.set(false);
    this.selectedWinner.set(null);

    // Dynamic duration and rounds calculated from pull force:
    // forceRatio is between 0.1 (gentle) and 1.0 (super jackpot turbo)
    const clampedForce = Math.max(0.12, Math.min(1.0, forceRatio));
    const duration = (3.2 + clampedForce * 9.5) * 1000; // 4.3s to 12.7s
    const baseRounds = Math.round(4 + clampedForce * 18); // 6 to 22 rounds

    // Pick a winning index uniformly at random
    const winningIndex = Math.floor(Math.random() * availableItems.length);
    const count = availableItems.length;
    const arc = (2 * Math.PI) / count;

    const pointerAngle = -Math.PI / 2;
    const margin = arc * 0.15;
    const randomOffsetInSlice = margin + Math.random() * (arc - 2 * margin);
    const targetSliceAngle = winningIndex * arc + randomOffsetInSlice;

    const normalizedStart = ((this.currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let targetAngle = pointerAngle - targetSliceAngle;
    targetAngle = ((targetAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    let angleDiff = targetAngle - normalizedStart;
    if (angleDiff < 0) {
      angleDiff += 2 * Math.PI;
    }

    const totalRotation = baseRounds * 2 * Math.PI + angleDiff;
    const startAngle = this.currentAngle;
    const startTime = performance.now();

    const easeOutQuartic = (x: number): number => 1 - Math.pow(1 - x, 4);

    this.lastTickSegment = -1;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutQuartic(progress);

      this.currentAngle = startAngle + totalRotation * easedProgress;

      this.bulbPhase = Math.floor(elapsed / 70) % 4;

      const remainingProgress = 1 - progress;
      const speedMultiplier = Math.pow(remainingProgress, 2.5);

      const currentWheelNorm = ((this.currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const relativeAngle = ((pointerAngle - currentWheelNorm) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSegment = Math.floor(relativeAngle / arc);

      if (currentSegment !== this.lastTickSegment) {
        this.soundService.playTick(0.8 + speedMultiplier * 0.8);
        this.pointerDeflection = (Math.random() > 0.5 ? 0.35 : -0.35) * Math.min(1, speedMultiplier + 0.3);
        this.lastTickSegment = currentSegment;
      } else {
        this.pointerDeflection *= 0.82;
      }

      this.drawWheel();

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animateSpin);
      } else {
        this.pointerDeflection = 0;
        this.isSpinning.set(false);
        this.drawWheel();
        this.onSpinComplete(availableItems[winningIndex]);
      }
    };

    this.animationFrameId = requestAnimationFrame(animateSpin);
  }

  private onSpinComplete(winner: WheelItem): void {
    this.selectedWinner.set(winner);
    this.showWinnerModal.set(true);

    this.soundService.playWinFanfare();
    this.confettiService.launchJackpotCelebration();

    const historyItem: DrawHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: winner.text,
      color: winner.color,
      timestamp: new Date(),
      excluded: this.autoExclude(),
    };
    this.drawHistory.update((h) => [historyItem, ...h]);

    if (this.autoExclude()) {
      this.excludeItem(winner.id);
    }
  }

  // --- Item Management ---
  public addItem(): void {
    const text = this.newItemText().trim();
    if (!text) return;

    const color = CASINO_COLORS[this.items().length % CASINO_COLORS.length];
    const newItem: WheelItem = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      color,
      active: true,
    };

    this.items.update((list) => [...list, newItem]);
    this.newItemText.set('');
    this.soundService.playClick();
    this.drawWheel();
    this.syncUrlState();
  }

  public removeItem(id: string): void {
    this.items.update((list) => list.filter((item) => item.id !== id));
    this.soundService.playClick();
    this.drawWheel();
    this.syncUrlState();
  }

  public toggleItemActive(id: string): void {
    this.items.update((list) =>
      list.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
    this.soundService.playClick();
    this.drawWheel();
    this.syncUrlState();
  }

  public excludeItem(id: string): void {
    this.items.update((list) =>
      list.map((item) => (item.id === id ? { ...item, active: false } : item))
    );
    this.drawWheel();
    this.syncUrlState();
  }

  public restoreItem(id: string): void {
    this.items.update((list) =>
      list.map((item) => (item.id === id ? { ...item, active: true } : item))
    );
    this.soundService.playClick();
    this.drawWheel();
    this.syncUrlState();
  }

  public restoreAllExcluded(): void {
    this.items.update((list) => list.map((item) => ({ ...item, active: true })));
    this.soundService.playClick();
    this.drawWheel();
    this.syncUrlState();
  }

  public shuffleItems(): void {
    const current = [...this.items()];
    for (let i = current.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [current[i], current[j]] = [current[j], current[i]];
    }
    this.items.set(current);
    this.soundService.playClick();
    this.drawWheel();
    this.syncUrlState();
  }

  public clearAllItems(): void {
    if (confirm('Vuoi davvero cancellare tutte le voci dalla ruota?')) {
      this.items.set([]);
      this.drawWheel();
      this.syncUrlState();
    }
  }

  // --- Winner Modal Actions ---
  public handleKeepWinner(): void {
    this.showWinnerModal.set(false);
    this.soundService.playClick();
  }

  public handleExcludeWinner(): void {
    const winner = this.selectedWinner();
    if (winner) {
      this.excludeItem(winner.id);
      this.soundService.playEliminate();
      this.drawHistory.update((h) =>
        h.map((item, idx) => (idx === 0 ? { ...item, excluded: true } : item))
      );
    }
    this.showWinnerModal.set(false);
  }

  public handleSpinAgain(): void {
    this.showWinnerModal.set(false);
    setTimeout(() => {
      this.animateAutoPullAndSpin(0.7);
    }, 200);
  }

  // --- Bulk Import ---
  public openBulkModal(): void {
    this.bulkText.set(this.items().map((i) => i.text).join('\n'));
    this.showBulkModal.set(true);
  }

  public saveBulkItems(): void {
    const lines = this.bulkText()
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length > 0) {
      const newItems: WheelItem[] = lines.map((line, idx) => ({
        id: Math.random().toString(36).substring(2, 9),
        text: line,
        color: CASINO_COLORS[idx % CASINO_COLORS.length],
        active: true,
      }));
      this.items.set(newItems);
      this.drawWheel();
      this.syncUrlState();
    }
    this.showBulkModal.set(false);
  }

  // --- Presets ---
  public loadPreset(type: string): void {
    let presetItems: string[] = [];
    let title = this.wheelTitle();

    switch (type) {
      case 'casino':
        title = '🎰 Ruota Casinò VIP';
        presetItems = [
          '🏆 JACKPOT €10.000',
          '💎 500 Giri Gratis',
          '🔥 Bonus x10',
          '🍀 Quadrifoglio Fortunato',
          '⭐ Jolly Dorato',
          '🎁 Cassa Misteriosa',
          '👑 Pass Royale',
          '💰 Moltiplicatore x5',
        ];
        break;
      case 'cibo':
        title = '🍕 Cosa Mangiamo Stasera?';
        presetItems = [
          '🍕 Pizza Napoletana',
          '🍔 Smash Burger',
          '🍣 Sushi & Sashimi',
          '🌮 Tacos Messicani',
          '🍝 Pasta Carbonara',
          '🥗 Insalatona Gourmet',
          '🥟 Ravioli Cinesi',
          '🥩 Tagliata & Patate',
        ];
        break;
      case 'numeri':
        title = '🔢 Sorteggio Numeri 1-12';
        presetItems = Array.from({ length: 12 }, (_, i) => `Numero ${i + 1}`);
        break;
      case 'party':
        title = '🎉 Penitenze & Giochi Party';
        presetItems = [
          '🎤 Canta il ritornello di una canzone pop',
          '🕺 Fai 15 secondi di ballo robotico',
          '🗣️ Parla con accento straniero per 2 turni',
          '📸 Fatti un selfie buffo e mostralo a tutti',
          '🤸 Fai 5 flessioni o 10 saltelli',
          '🤫 Non parlare per i prossimi 3 minuti',
          '🎭 Imita un personaggio famoso',
          '⭐ Salvo! Sei graziato da tutti',
        ];
        break;
      case 'decisioni':
        title = '🔮 Oracolo delle Decisioni';
        presetItems = [
          '✅ Assolutamente SÌ',
          '❌ Decisamente NO',
          '⏳ Riprovaci Più Tardi',
          '🤔 Forse... Dipende da te',
          '🌟 È il tuo Giorno Fortunato!',
          '⚡ Fallo Senza Esitare!',
        ];
        break;
    }

    const newItems: WheelItem[] = presetItems.map((text, idx) => ({
      id: Math.random().toString(36).substring(2, 9),
      text,
      color: CASINO_COLORS[idx % CASINO_COLORS.length],
      active: true,
    }));

    this.wheelTitle.set(title);
    this.items.set(newItems);
    this.soundService.playClick();
    this.drawWheel();
    this.syncUrlState();
  }

  // --- URL Serialization & Sharing ---
  public generateShareUrl(): string {
    const payload = {
      t: this.wheelTitle(),
      i: this.items().map((it) => ({
        t: it.text,
        c: it.color,
        a: it.active ? 1 : 0,
      })),
      ae: this.autoExclude() ? 1 : 0,
    };

    const json = JSON.stringify(payload);
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
    const base = window.location.href.split('#')[0];
    return `${base}#ruota=${encoded}`;
  }

  public copyShareUrl(): void {
    const url = this.generateShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.shareToast.set('Link salvato e copiato negli appunti! 🔗');
        setTimeout(() => this.shareToast.set(null), 3500);
      });
    } else {
      prompt('Copia questo link per riutilizzare la ruota:', url);
    }
    this.soundService.playClick();
  }

  private syncUrlState(): void {
    if (typeof window === 'undefined') return;
    try {
      const url = this.generateShareUrl();
      const hash = url.substring(url.indexOf('#'));
      history.replaceState(null, '', hash);
    } catch {
      // ignore
    }
  }

  private loadStateFromUrl(): void {
    if (typeof window === 'undefined') return;
    try {
      const hash = window.location.hash;
      const match = hash.match(/ruota=([^&]+)/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(escape(atob(decodeURIComponent(match[1]))));
        const payload = JSON.parse(decoded);

        if (payload.t) this.wheelTitle.set(payload.t);
        if (payload.ae !== undefined) this.autoExclude.set(payload.ae === 1);

        if (Array.isArray(payload.i) && payload.i.length > 0) {
          const restoredItems: WheelItem[] = payload.i.map(
            (
              item: { t: string; c?: string; a?: number },
              idx: number
            ) => ({
              id: Math.random().toString(36).substring(2, 9),
              text: item.t,
              color: item.c || CASINO_COLORS[idx % CASINO_COLORS.length],
              active: item.a === undefined ? true : item.a === 1,
            })
          );
          this.items.set(restoredItems);
        }
      }
    } catch (e) {
      console.warn('Impossibile caricare configurazione dall’URL', e);
    }
  }

  public toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    this.soundService.playClick();
  }
}
