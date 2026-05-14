import { forwardRef, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const comparisonImages = {
  before: "/assets/before.png",
  after: "/assets/after.png",
};

const SEAT_FRAMES = Array.from({ length: 37 }, (_, i) => ({
  id: `${i + 1}`,
  src: `/assets/${i + 1}.png`,
  alt: `Custom cushion workshop showcase image ${i + 1}`,
}));

const FIRST_FEATURES = ["Measured fit", "Supportive foam", "Clean finish"];

const SECOND_FEATURES = ["Fabric and leather", "Reinforced seams", "Made for daily use"];

export function SeatShowcase() {
  const root = useRef<HTMLElement>(null);
  const [portalTarget] = useState(() => (typeof document === "undefined" ? null : document.body));
  const heroLayer = useRef<HTMLDivElement>(null);
  const heroCopy = useRef<HTMLDivElement>(null);
  const heroBackdrop = useRef<HTMLDivElement>(null);
  const aboutLayer = useRef<HTMLDivElement>(null);
  const aboutText = useRef<HTMLDivElement>(null);
  const firstPanel = useRef<HTMLDivElement>(null);
  const secondPanel = useRef<HTMLDivElement>(null);
  const finalLayer = useRef<HTMLDivElement>(null);
  const imageWrap = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const frameObj = useRef({ index: 0 });

  // Preload images
  useGSAP(() => {
    let loadedCount = 0;
    const totalFrames = SEAT_FRAMES.length;

    SEAT_FRAMES.forEach((frame, i) => {
      const img = new Image();
      img.src = frame.src;
      img.onload = () => {
        imagesRef.current[i] = img;
        loadedCount++;
        if (loadedCount === totalFrames) {
          setImagesLoaded(true);
          renderFrame(0);
        }
      };
    });
  }, []);

  const renderFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !imagesLoaded) return;

      const img = imagesRef.current[Math.round(index)];
      if (!img) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.min(hRatio, vRatio);

      // Rounding coordinates to prevent sub-pixel blurring
      const cx = Math.round((canvas.width - img.width * ratio) / 2);
      const cy = Math.round((canvas.height - img.height * ratio) / 2);
      const dw = Math.round(img.width * ratio);
      const dh = Math.round(img.height * ratio);

      ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, dw, dh);
    },
    [imagesLoaded],
  );

  // Use GSAP Ticker for smooth 60fps rendering
  useGSAP(() => {
    if (!imagesLoaded) return;
    const tickerUpdate = () => renderFrame(frameObj.current.index);
    gsap.ticker.add(tickerUpdate);
    return () => gsap.ticker.remove(tickerUpdate);
  }, [imagesLoaded, renderFrame]);

  useGSAP(
    () => {
      if (!root.current || !imagesLoaded) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isMobile = false, reduceMotion = false } = (context.conditions ?? {}) as {
            isMobile?: boolean;
            reduceMotion?: boolean;
          };

          if (reduceMotion) {
            renderFrame(0);
            return;
          }

          // Initial Setup
          gsap.set(aboutLayer.current, { opacity: 0, y: isMobile ? 40 : 80 });
          gsap.set([firstPanel.current, secondPanel.current], {
            autoAlpha: 0,
            y: isMobile ? 30 : 80,
          });
          gsap.set(finalLayer.current, { autoAlpha: 0, y: isMobile ? 40 : 70 });

          gsap.set(imageWrap.current, {
            xPercent: -50,
            yPercent: -50,
            x: isMobile ? "35vw" : 0,
            y: isMobile ? "5vh" : 230,
            scale: isMobile ? 2.1 : 1.52,
          });

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 2.2,
              invalidateOnRefresh: true,
            },
          });

          // Phase 1: Reveal
          tl.to(
            imageWrap.current,
            {
              scale: isMobile ? 0.88 : 1.02,
              x: 0,
              y: isMobile ? "-14vh" : 44,
              duration: 0.15,
            },
            0,
          )
            .to(heroCopy.current, { y: -60, opacity: 0, duration: 0.1 }, 0.02)
            .to(heroBackdrop.current, { opacity: 0, scale: 1.1, duration: 0.15 }, 0)
            .to(aboutLayer.current, { opacity: 1, y: 0, duration: 0.1 }, 0.08)
            .to(aboutText.current, { y: isMobile ? -20 : -44, duration: 0.15 }, 0.05);

          // Phase 2: Settle
          tl.to(
            imageWrap.current,
            { y: isMobile ? "-16vh" : 18, scale: isMobile ? 0.82 : 0.96, duration: 0.1 },
            0.15,
          ).to(aboutText.current, { y: isMobile ? -40 : -86, duration: 0.1 }, 0.15);

          // Phase 3: First Feature
          tl.to(heroLayer.current, { opacity: 0, duration: 0.05 }, 0.25)
            .to(aboutLayer.current, { opacity: 0, y: -70, duration: 0.1 }, 0.25)
            .to(
              imageWrap.current,
              {
                x: isMobile ? 0 : "-25vw",
                y: isMobile ? "-26vh" : 8,
                scale: isMobile ? 0.54 : 0.78,
                duration: 0.15,
              },
              0.25,
            )
            .to(firstPanel.current, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.35)
            .from(
              ".seat-feature-panel--first .seat-feature-line",
              { y: 15, opacity: 0, stagger: 0.02, duration: 0.1 },
              0.38,
            );

          // Smooth Frame Sequence Phase 1 (Natural Easing between Hero and Feature 1)
          tl.to(
            frameObj.current,
            {
              index: 15,
              duration: 0.35,
              ease: "power1.inOut",
            },
            0.15,
          );

          // Phase 4: Second Feature
          tl.to(firstPanel.current, { autoAlpha: 0, y: -30, duration: 0.08 }, 0.52)
            .to(
              imageWrap.current,
              {
                x: isMobile ? 0 : "27vw",
                y: isMobile ? "-26vh" : 36,
                scale: isMobile ? 0.54 : 0.78,
                duration: 0.22,
                ease: "power2.inOut",
              },
              0.5,
            )
            .to(secondPanel.current, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.62)
            .from(
              ".seat-feature-panel--second .seat-feature-line",
              { y: 15, opacity: 0, stagger: 0.02, duration: 0.08 },
              0.64,
            );

          // Smooth Frame Sequence Phase 2 (Natural Easing between Feature 1 and Feature 2)
          tl.to(
            frameObj.current,
            {
              index: 36,
              duration: 0.45,
              ease: "power1.inOut",
            },
            0.5,
          );

          // Phase 5: Final
          tl.to(secondPanel.current, { autoAlpha: 0, y: -34, duration: 0.08 }, 0.74)
            .to(
              imageWrap.current,
              {
                autoAlpha: 0,
                x: isMobile ? 0 : "30vw",
                y: isMobile ? "-26vh" : 120,
                scale: 0.48,
                duration: 0.08,
              },
              0.75,
            )
            .to(
              finalLayer.current,
              { autoAlpha: 1, y: 0, duration: 0.08, ease: "power1.out" },
              0.79,
            )
            .from(".seat-final-line", { y: 28, opacity: 0, stagger: 0.025, duration: 0.08 }, 0.82)
            .to(".seat-final-line", { y: -28, opacity: 0, stagger: 0.015, duration: 0.05 }, 0.985);
        },
      );

      return () => {
        mm.revert();
      };
    },
    { scope: root, dependencies: [imagesLoaded] },
  );

  const seatFrame = (
    <div
      ref={imageWrap}
      className="seat-product-frame pointer-events-none fixed left-1/2 top-1/2 z-[60] aspect-[4/5] w-[82vw] will-change-transform md:w-[clamp(420px,40vw,720px)]"
    >
      <canvas
        ref={canvasRef}
        width={1100}
        height={1300}
        style={{ imageRendering: "auto" }}
        className="h-full w-full object-contain drop-shadow-[0_36px_44px_rgba(0,0,0,0.35)]"
      />
    </div>
  );

  return (
    <section id="top" ref={root} className="seat-showcase relative bg-canvas-warm">
      <div className="seat-showcase__stage sticky top-0 min-h-screen overflow-hidden bg-canvas-warm">
        <HeroSeatReveal
          heroLayerRef={heroLayer}
          heroCopyRef={heroCopy}
          heroBackdropRef={heroBackdrop}
        />
        <AboutSeatSection aboutLayerRef={aboutLayer} aboutTextRef={aboutText} />

        <SeatFeaturePanel
          ref={firstPanel}
          variant="first"
          eyebrow="Made to measure"
          title="Comfort That Fits"
          description="We build cushions around real measurements, daily use, and the furniture or vehicle they belong to, so the final piece feels natural from the first sit."
          features={FIRST_FEATURES}
        />
        <SeatFeaturePanel
          ref={secondPanel}
          variant="second"
          eyebrow="Workshop finish"
          title="Cut, Stitched, Finished"
          description="Fabric, leather, seams, and panels are chosen with purpose, then finished by hand for cushions that look sharp and hold up to everyday use."
          features={SECOND_FEATURES}
        />
        <SeatFinalCTA ref={finalLayer} />
      </div>

      {portalTarget ? createPortal(seatFrame, portalTarget) : null}

      <div aria-hidden className="h-[480vh]" />

      <div className="seat-showcase__mobile hidden">
        <StaticMobileSeatSection
          image={SEAT_FRAMES[0].src}
          alt="Custom cushion workshop showcase image"
          title="Crafted for Comfort"
          body="Custom cushions shaped for sofas, outdoor seating, vehicles, and special projects, with the right balance of support, fabric, and finish."
        />
        <StaticMobileSeatSection
          image={SEAT_FRAMES[15].src}
          alt="Vehicle cushion upholstery example"
          title="Comfort That Fits"
          body="Every order starts with the measurements and the way the cushion will be used, then we shape the foam and cover it cleanly."
        />
        <StaticMobileSeatSection
          image={SEAT_FRAMES[36].src}
          alt="Custom cushion workshop showcase image"
          title="Cut, Stitched, Finished"
          body="Panels, seams, edges, and fabric choices are handled with workshop care so the result feels made, not bought off a shelf."
        />
        <StaticMobileSeatSection
          image={SEAT_FRAMES[29].src}
          alt="Vehicle cushion upholstery example"
          title="Built for Daily Use"
          body="From family sofas to vehicle seats and patio furniture, each cushion is made to handle real use while keeping its shape."
        />
        <StaticMobileSeatCTA />
      </div>
    </section>
  );
}

const SeatFinalCTA = forwardRef<HTMLDivElement>(function SeatFinalCTA(_, ref) {
  return (
    <div
      ref={ref}
      className={`absolute inset-0 z-50 overflow-y-auto overflow-x-hidden md:overflow-hidden bg-ochre text-white`}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 to-transparent" />
      <div className="mx-auto flex min-h-[100dvh] max-w-[1600px] flex-col justify-center px-6 pb-8 pt-20 md:h-auto md:min-h-screen md:grid md:grid-cols-12 md:items-center md:gap-8 md:px-12 md:pb-16 md:pt-32">
        <div className="col-span-12 flex flex-col md:col-span-7">
          <p className="seat-final-line text-[9px] font-semibold uppercase tracking-[0.34em] text-white/62 md:text-[10px]">
            Custom cushion work
          </p>
          <h2 className="seat-final-line mt-3 max-w-5xl font-display text-[clamp(4.5rem,13vw,15rem)] uppercase leading-[0.78] tracking-tight md:mt-6 md:text-[clamp(6rem,13vw,15rem)]">
            Start a custom order
          </h2>
          <p className="seat-final-line mt-4 max-w-lg text-sm leading-6 text-white/74 md:mt-8 md:text-lg md:leading-8">
            Bring measurements, photos, old cushions, or a simple sketch. We will help choose the
            foam, cover, and finish, then make it to fit your space.
          </p>
          <a
            href="#contact"
            className="seat-final-line mt-6 inline-flex self-start rounded-full border border-white/30 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.25em] transition-colors duration-300 hover:bg-white hover:text-ochre md:mt-10 md:px-8 md:py-4 md:text-[11px]"
          >
            Start a custom order
          </a>
        </div>
        <div className="seat-final-line col-span-12 mt-8 flex flex-1 items-center justify-center pb-4 md:col-span-5 md:mt-0 md:justify-end md:pb-0">
          <SeatComparisonSlider
            beforeImage={comparisonImages.before}
            afterImage={comparisonImages.after}
            className="w-full max-w-[400px] md:h-auto md:max-h-[72vh] md:w-[min(34vw,560px)] md:max-w-none"
          />
        </div>
      </div>
    </div>
  );
});

function SeatComparisonSlider({
  beforeImage,
  afterImage,
  className = "",
}: {
  beforeImage: string;
  afterImage: string;
  className?: string;
}) {
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const pullRef = useRef<HTMLDivElement>(null);
  const lastXRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clampSplit = (value: number) => Math.min(100, Math.max(0, value));

  const updateSplitFromClientX = useCallback((clientX: number) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const nextSplit = ((clientX - rect.left) / rect.width) * 100;
    setSplit(clampSplit(nextSplit));
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    lastXRef.current = event.clientX;
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateSplitFromClientX(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateSplitFromClientX(event.clientX);

    if (lastXRef.current !== null && pullRef.current) {
      const deltaX = event.clientX - lastXRef.current;
      const targetRotation = Math.max(-55, Math.min(55, -deltaX * 5));

      gsap.to(pullRef.current, {
        rotation: targetRotation,
        duration: 0.1,
        ease: "power1.out",
        overwrite: true,
      });

      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        if (pullRef.current && dragging) {
          gsap.to(pullRef.current, {
            rotation: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.4)",
            overwrite: true,
          });
        }
      }, 50);
    }
    lastXRef.current = event.clientX;
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    lastXRef.current = null;
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (pullRef.current) {
      gsap.to(pullRef.current, {
        rotation: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.4)",
        overwrite: true,
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keyStep = event.shiftKey ? 10 : 5;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSplit((value) => clampSplit(value - keyStep));
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSplit((value) => clampSplit(value + keyStep));
    }

    if (event.key === "Home") {
      event.preventDefault();
      setSplit(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      setSplit(100);
    }
  };

  const splitStyle = {
    "--split": `${split}%`,
  } as React.CSSProperties;
  const sliderState = split <= 2 ? "After" : split >= 98 ? "Before" : "Compare";

  return (
    <div
      ref={sliderRef}
      role="slider"
      tabIndex={0}
      aria-label="Before and after custom cushion upholstery comparison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(split)}
      aria-valuetext={`${sliderState} view`}
      className={`group relative aspect-[4/5] cursor-ew-resize touch-none select-none overflow-hidden outline-none drop-shadow-[0_44px_52px_rgba(0,0,0,0.2)] transition-[filter] duration-300 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-4 focus-visible:ring-offset-ochre ${className}`}
      style={splitStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      <img
        src={afterImage}
        alt=""
        className="absolute inset-0 h-full w-full object-contain p-2 md:p-4 opacity-95 scale-[0.99]"
        draggable={false}
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: "inset(0 calc(100% - var(--split)) 0 0)" }}
      >
        <img
          src={beforeImage}
          alt="Before custom cushion upholstery work"
          className="h-full w-full object-contain p-2 md:p-4"
          draggable={false}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.26em] text-white/72 md:inset-x-5 md:top-5">
        <span
          className={`bg-black/26 px-3 py-2 backdrop-blur-sm transition-opacity duration-300 ${split <= 2 ? "opacity-0" : "opacity-100"}`}
        >
          Before
        </span>
        <span
          className={`bg-black/26 px-3 py-2 backdrop-blur-sm transition-opacity duration-300 ${split >= 98 ? "opacity-0" : "opacity-100"}`}
        >
          After
        </span>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[13%] top-[7%] w-6 -translate-x-1/2"
        style={{ left: "var(--split)" }}
      >
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.5),rgba(255,244,214,0.95),rgba(124,94,52,0.78),rgba(255,255,255,0.62))] shadow-[0_0_12px_rgba(255,232,184,0.32)]" />
        <span
          className="absolute inset-y-0 left-[calc(50%-0.25rem)] w-[3.5px] opacity-95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.32)]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,249,226,0.95) 0 4px, rgba(151,122,73,0.88) 4px 5px, transparent 5px 11px)",
          }}
        />
        <span
          className="absolute inset-y-0 left-[calc(50%+0.06rem)] w-[3.5px] opacity-95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.32)]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 5px, rgba(255,249,226,0.95) 5px 9px, rgba(151,122,73,0.88) 9px 10px, transparent 10px 11px)",
          }}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 flex h-32 w-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-start text-white transition-transform duration-300 scale-75 group-hover:scale-[0.8]"
        style={{ left: "var(--split)" }}
      >
        <span className="h-5 w-px bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),rgba(255,238,186,0.95),rgba(122,96,53,0.7))]" />

        {/* Main Zipper Body */}
        <span
          className="relative z-10 block h-14 w-9 rounded-t-sm shadow-[0_12px_24px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-4px_8px_rgba(107,76,5,0.6)] border border-[#8a5d19]/60"
          style={{
            clipPath: "polygon(20% 0, 80% 0, 100% 65%, 50% 100%, 0 65%)",
            background:
              "linear-gradient(135deg, #fff2cd 0%, #d4af37 25%, #8a5d19 45%, #4a3203 50%, #b8860b 55%, #fdf0c2 100%)",
          }}
        >
          <span className="absolute left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full border border-black/20 bg-gradient-to-br from-[#d4af37] to-[#8a5d19] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]" />
          <span className="absolute left-1/2 top-4 h-4 w-1 -translate-x-1/2 rounded-full bg-black/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" />
          <span className="absolute left-[0.35rem] top-4 h-2 w-1.5 rotate-45 border-b-2 border-l-2 border-white/60 drop-shadow-sm" />
          <span className="absolute right-[0.35rem] top-4 h-2 w-1.5 -rotate-45 border-b-2 border-r-2 border-white/60 drop-shadow-sm" />
        </span>

        {/* The Pull Tag */}
        <div
          ref={pullRef}
          className="origin-top flex flex-col items-center -mt-1.5 z-0 will-change-transform"
        >
          {/* The ring */}
          <span className="block h-4 w-5 rounded-full border-[2.5px] border-[#aa7c11] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.4)] bg-transparent" />
          {/* The tag body */}
          <span className="-mt-1 flex h-24 w-4 justify-center rounded-b-md rounded-t-sm bg-gradient-to-b from-[#fcebb6] via-[#d4af37] to-[#8a5d19] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_6px_10px_rgba(0,0,0,0.5)] border border-[#6b4c05]/60 relative">
            <span className="mt-1 block h-20 w-1.5 rounded-full bg-black/25 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.4)]" />
            <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-black/20" />
          </span>
        </div>
      </div>
    </div>
  );
}

function HeroSeatReveal({
  heroLayerRef,
  heroCopyRef,
  heroBackdropRef,
}: {
  heroLayerRef: React.RefObject<HTMLDivElement | null>;
  heroCopyRef: React.RefObject<HTMLDivElement | null>;
  heroBackdropRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={heroLayerRef} className="absolute inset-0 z-10 bg-leather text-white">
      <div ref={heroBackdropRef} className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,oklch(0.99_0.006_82/0.16),transparent_28%),linear-gradient(120deg,oklch(0.16_0.012_62)_0%,oklch(0.075_0.012_39)_45%,oklch(0.22_0.017_74)_100%)]" />
        <div className="absolute inset-0 opacity-[0.16] grayscale contrast-150 mix-blend-screen seat-hero-lines" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-brand-red/20 to-transparent" />
      </div>

      <div className="relative z-20 mx-auto grid min-h-screen max-w-[1600px] grid-cols-12 items-end gap-8 px-6 pb-16 pt-32 md:px-12 md:pb-20">
        <div ref={heroCopyRef} className="col-span-12 pb-8 md:col-span-7">
          <h1 className="max-w-5xl font-display text-[clamp(5.8rem,12vw,14rem)] font-medium uppercase leading-[0.78] tracking-tight">
            Custom cushions, shaped by hand.
          </h1>
          <p className="mt-8 max-w-lg text-base leading-7 text-white/68 md:text-lg">
            From sofa seats and patio pads to vehicle cushions and one-off replacements, we measure,
            cut, stitch, and finish every piece for the way it will be used.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {["Made to measure", "Foam replacement", "Workshop stitching"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/18 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="col-span-12 flex justify-between border-t border-white/15 pt-6 text-[10px] font-medium uppercase tracking-[0.3em] text-white/50 md:col-span-12">
          <span>Damitha Cushion Works</span>
          <span>Scroll through the craft</span>
        </div>
      </div>
    </div>
  );
}

function AboutSeatSection({
  aboutLayerRef,
  aboutTextRef,
}: {
  aboutLayerRef: React.RefObject<HTMLDivElement | null>;
  aboutTextRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={aboutLayerRef} className="absolute inset-0 z-20 overflow-hidden bg-canvas-warm">
      <div
        ref={aboutTextRef}
        className="absolute left-1/2 top-[22%] z-10 w-[110vw] -translate-x-1/2 text-center font-humane text-[clamp(10rem,22vw,26rem)] uppercase leading-[0.72] text-foreground/[0.095]"
      >
        Crafted
        <br />
        For Comfort
      </div>
      <div className="relative z-20 mx-auto grid min-h-screen max-w-[1600px] grid-cols-12 items-end gap-8 px-6 pb-16 md:px-12 md:pb-24">
        <div className="col-span-12 md:col-span-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-ochre">
            Built for every drive
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 md:col-start-9">
          <p className="text-lg leading-[1.55] text-foreground/80 md:text-xl">
            Custom cushions shaped for sofas, outdoor seating, vehicles, and special projects, with
            the right balance of support, fabric, and finish.
          </p>
        </div>
      </div>
    </div>
  );
}

const SeatFeaturePanel = forwardRef<
  HTMLDivElement,
  {
    eyebrow: string;
    title: string;
    description: string;
    features: string[];
    variant: "first" | "second";
  }
>(function SeatFeaturePanel({ eyebrow, title, description, features, variant }, ref) {
  return (
    <div
      ref={ref}
      className={`seat-feature-panel seat-feature-panel--${variant} absolute z-40 w-[min(92vw,680px)] -translate-y-1/2 md:top-1/2 md:w-[min(43vw,680px)] top-[54%] left-1/2 -translate-x-1/2 md:translate-x-0 ${
        variant === "first" ? "md:left-auto md:right-[6vw]" : "md:left-[6vw]"
      }`}
    >
      <div className="mb-4 md:mb-8 h-px w-16 md:w-20 bg-ochre" />
      <p className="seat-feature-line text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.32em] text-ochre">
        {eyebrow}
      </p>
      <h2 className="seat-feature-line mt-3 md:mt-5 font-display text-[clamp(3.5rem,6.4vw,7.4rem)] uppercase leading-[0.82] tracking-tight text-foreground">
        {title}
      </h2>
      <p className="seat-feature-line mt-4 md:mt-8 max-w-xl text-base md:text-lg leading-7 md:leading-8 text-foreground/72">
        {description}
      </p>
      <ul className="mt-6 md:mt-10 space-y-2 md:space-y-4">
        {features.map((feature) => (
          <li
            key={feature}
            className="seat-feature-line flex items-center gap-3 md:gap-4 border-t border-foreground/10 pt-3 md:pt-4 text-xs md:sm font-medium uppercase tracking-[0.16em] text-foreground"
          >
            <span className="h-1.5 w-1.5 md:h-2 md:w-2 bg-ochre" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
});

function StaticMobileSeatSection({
  image,
  alt,
  title,
  body,
}: {
  image: string;
  alt: string;
  title: string;
  body: string;
}) {
  return (
    <section className="border-t border-black/10 px-6 py-20">
      <img src={image} alt={alt} className="mx-auto h-auto max-h-[58vh] w-full object-contain" />
      <h2 className="mt-10 font-display text-6xl uppercase leading-[0.86] text-foreground">
        {title}
      </h2>
      <p className="mt-6 text-base leading-7 text-foreground/72">{body}</p>
    </section>
  );
}

function StaticMobileSeatCTA() {
  return (
    <section className="bg-ochre px-6 py-20 text-white">
      <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/62">
        Custom cushion work
      </p>
      <h2 className="mt-5 font-display text-7xl uppercase leading-[0.82]">Start a custom order</h2>
      <p className="mt-6 text-base leading-7 text-white/74">
        Bring measurements, photos, old cushions, or a simple sketch. We will help choose the foam,
        cover, and finish, then make it to fit your space.
      </p>
      <SeatComparisonSlider
        beforeImage={comparisonImages.before}
        afterImage={comparisonImages.after}
        className="mt-10 w-full"
      />
      <a
        href="#contact"
        className="mt-9 inline-flex min-h-12 rounded-full border border-white/30 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-white hover:text-ochre"
      >
        Start a custom order
      </a>
    </section>
  );
}
