import clsx from 'clsx';
import { useState } from 'react';

/* ---------- Small decorative bits used across the app ---------- */

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx('pointer-events-none select-none', className)}
      aria-hidden="true"
    >
      <path
        d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z"
        fill="#f7c948"
      />
    </svg>
  );
}

export function Bolt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx('pointer-events-none select-none', className)}
      aria-hidden="true"
    >
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="#f7c948" />
    </svg>
  );
}

export function PaperPlane({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 120"
      className={clsx('pointer-events-none select-none', className)}
      aria-hidden="true"
    >
      <path
        d="M 8 96 Q 60 30 130 56 T 210 26"
        stroke="rgba(159, 177, 216, 0.65)"
        strokeWidth="2.5"
        strokeDasharray="3 6"
        strokeLinecap="round"
        fill="none"
      />
      <g transform="translate(170 14) rotate(18)">
        <path d="M 0 18 L 40 0 L 32 22 L 16 16 Z" fill="#74b1f5" />
        <path d="M 16 16 L 24 30 L 32 22 Z" fill="#1c4a8a" />
      </g>
    </svg>
  );
}

/* SunBurst — kept for backwards compatibility, now a sky glow disk. */
export function SunBurst({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'pointer-events-none select-none rounded-full bg-sky-glow blur-2xl',
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function CloudPuff({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 80"
      className={clsx('pointer-events-none select-none', className)}
      aria-hidden="true"
    >
      <ellipse cx="40" cy="50" rx="32" ry="22" fill="rgba(159, 177, 216, 0.15)" />
      <ellipse cx="80" cy="42" rx="40" ry="28" fill="rgba(159, 177, 216, 0.18)" />
      <ellipse cx="120" cy="52" rx="32" ry="22" fill="rgba(159, 177, 216, 0.15)" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   FlyerScene — the cinematic hero composition.

   When the real flyer photo (public/born-gifted-flyer.jpg) is available, it
   becomes the dominant visual element: the actual kids-holding-the-globe
   imagery from the printed poster. The SVG illustrations (globe halo,
   silhouettes, hummingbird) only appear as a fallback when the photo fails
   to load.

   Either way, a grain overlay, sky-glow disc and scrims layer on top to
   preserve the printed-poster feel and keep the foreground type legible.
   --------------------------------------------------------------------------- */
export function FlyerScene({ className }: { className?: string }) {
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div
      className={clsx('relative overflow-hidden', className)}
      aria-hidden="true"
      style={{
        background:
          'radial-gradient(120% 90% at 50% 40%, #4d86c8 0%, #2a5aa0 25%, #163566 55%, #0a1838 80%, #050a18 100%)',
      }}
    >
      {/* The real flyer photo. Positioned to show the kids + globe area,
          slightly zoomed in so the printed type at the top of the poster
          sits behind the hero header. */}
      <img
        src="/born-gifted-flyer.jpg"
        alt=""
        aria-hidden="true"
        className={clsx(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
          photoLoaded ? 'opacity-100' : 'opacity-0',
        )}
        style={{ objectPosition: '50% 65%' }}
        onLoad={() => setPhotoLoaded(true)}
        onError={() => setPhotoFailed(true)}
      />

      {/* SVG fallback layers — only render if the real photo failed. */}
      {photoFailed && <FallbackScene />}

      {/* Cyan sky-glow disc behind the centre — sits over the photo to
          reinforce that lit-from-within atmosphere. */}
      <div
        className="pointer-events-none absolute left-1/2 top-[40%] h-[110vh] w-[110vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(190,235,255,0.55), rgba(110,200,235,0.20) 40%, transparent 75%)',
        }}
      />

      {/* Edge vignette — keeps focus toward the centre. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_55%,transparent_60%,rgba(4,8,19,0.6)_100%)]" />

      {/* Top scrim — gives the header / title legibility against the sky. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950/85 via-ink-950/40 to-transparent" />

      {/* Centre scrim — slight horizontal band so the "BORN GIFTED" title
          reads cleanly over the bright cyan area of the photo. */}
      <div className="pointer-events-none absolute inset-x-0 top-1/3 h-1/3 bg-[radial-gradient(60%_100%_at_50%_50%,rgba(4,8,19,0.45),transparent_70%)]" />

      {/* Bottom scrim — pulls the figures into shadow and fades into the
          registration section below. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-ink-950/75 to-ink-950" />
    </div>
  );
}

/* SVG fallback used only when the photo fails to load. Keeps the page
   visually interesting on the off chance the asset is missing. */
function FallbackScene() {
  return (
    <>
      <CloudBands className="absolute inset-0 animate-slowDrift" />
      <div className="pointer-events-none absolute left-1/2 top-[42%] aspect-square w-[min(95vh,1100px)] -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="0 0 1000 1000" className="h-full w-full">
          <defs>
            <radialGradient id="fbGlobe" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#dff1ff" />
              <stop offset="55%" stopColor="#3a7ec8" />
              <stop offset="100%" stopColor="#040a1a" />
            </radialGradient>
          </defs>
          <circle cx="500" cy="500" r="360" fill="url(#fbGlobe)" />
        </svg>
      </div>
      <svg
        viewBox="0 0 1200 600"
        className="absolute inset-x-0 bottom-0 top-[40%] w-full"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <g fill="#04070f">
          <circle cx="240" cy="220" r="44" />
          <path d="M 110 600 L 120 320 Q 140 270 200 280 L 240 260 L 290 270 Q 330 280 350 310 L 300 350 L 310 600 Z" />
          <circle cx="600" cy="190" r="54" />
          <path d="M 470 600 L 480 300 Q 510 230 600 225 Q 690 230 720 300 L 740 600 Z" />
          <circle cx="940" cy="220" r="46" />
          <path d="M 850 600 L 860 320 Q 880 270 940 280 L 990 270 Q 1040 280 1060 320 L 1020 360 L 1020 600 Z" />
        </g>
      </svg>
    </>
  );
}

/* Drifting cloud bands — only used by the fallback. */
function CloudBands({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 600"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="cloudBlur">
          <feGaussianBlur stdDeviation="50" />
        </filter>
      </defs>
      <g filter="url(#cloudBlur)" opacity="0.55">
        <ellipse cx="200" cy="200" rx="280" ry="55" fill="rgba(220,235,250,0.45)" />
        <ellipse cx="900" cy="130" rx="320" ry="50" fill="rgba(220,235,250,0.40)" />
        <ellipse cx="600" cy="280" rx="400" ry="70" fill="rgba(220,235,250,0.30)" />
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   BornGiftedMark — kept exported for re-use elsewhere.
   --------------------------------------------------------------------------- */
export function BornGiftedMark({
  size = 'lg',
  className,
}: {
  size?: 'lg' | 'md' | 'sm';
  className?: string;
}) {
  const sz =
    size === 'lg'
      ? 'text-[clamp(4rem,14vw,12rem)]'
      : size === 'md'
        ? 'text-[clamp(3rem,9vw,7rem)]'
        : 'text-[clamp(2rem,6vw,4rem)]';
  return (
    <h1 className={clsx('headline relative whitespace-nowrap', sz, className)}>
      <span className="text-white/95 drop-shadow-[0_4px_30px_rgba(0,0,0,0.55)]">“BORN</span>{' '}
      <span className="text-white/95 drop-shadow-[0_4px_30px_rgba(0,0,0,0.55)]">GIFTED”</span>
    </h1>
  );
}
