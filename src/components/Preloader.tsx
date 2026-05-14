import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type PreloaderProps = {
  onComplete?: () => void;
  onReadyToReveal?: () => void;
  isReady?: boolean;
  progress?: number;
};

export function Preloader({
  onComplete,
  onReadyToReveal,
  isReady = true,
  progress = 100,
}: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isReadyRef = useRef(isReady);

  isReadyRef.current = isReady;

  useEffect(() => {
    if (isReady && tlRef.current?.paused()) {
      tlRef.current.play();
    }
  }, [isReady]);

  useEffect(() => {
    if (!counterRef.current) return;

    gsap.to(counterRef.current, {
      innerHTML: Math.round(progress),
      duration: 0.3,
      snap: { innerHTML: 1 },
      onUpdate: function () {
        if (counterRef.current) {
          counterRef.current.textContent = String(
            Math.round(Number(this.targets()[0].innerHTML)),
          ).padStart(3, "0");
        }
      },
    });

    gsap.to(".preloader-progress-line", {
      scaleX: progress / 100,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [progress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollLockTargets = [document.documentElement, document.body];
    const isMobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const timings = {
      logoIn: isMobile ? 0.85 : 2,
      uiIn: isMobile ? 0.55 : 1,
      uiStagger: isMobile ? 0.045 : 0.1,
      overlap: isMobile ? "-=0.55" : "-=1.5",
      logoOut: isMobile ? 0.22 : 0.4,
      uiOut: isMobile ? 0.28 : 0.6,
      maskZoom: isMobile ? 0.85 : 2.2,
      revealOffset: isMobile ? 0.82 : 2.1,
      fadeOffset: isMobile ? 0.9 : 2.2,
      fadeOut: isMobile ? 0.22 : 0.4,
    };

    const unlockScroll = () => {
      gsap.set(scrollLockTargets, {
        overflow: "",
      });
    };

    const ctx = gsap.context(() => {
      gsap.set(scrollLockTargets, {
        overflow: "hidden",
      });

      gsap.set(".preloader-ui-item", {
        opacity: 0,
        y: 15,
      });

      gsap.set(".visible-logo-wrap", {
        opacity: 0,
        scale: 0.95,
      });

      gsap.set(".preloader-progress-line", {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(".preloader-black-overlay", {
        opacity: 1,
      });

      // The mask group for the zoom effect
      gsap.set(".mask-logo-group", {
        scale: 1,
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline({
        defaults: {
          ease: "power4.inOut",
        },
        onComplete: () => {
          unlockScroll();
          if (container) container.style.display = "none";
          onComplete?.();
          requestAnimationFrame(() => ScrollTrigger.refresh());
        },
      });

      tlRef.current = tl;

      // 1. Initial UI entrance
      tl.to(".visible-logo-wrap", {
        opacity: 1,
        scale: 1,
        duration: timings.logoIn,
        ease: "expo.out",
      });

      tl.to(
        ".preloader-ui-item",
        {
          opacity: 1,
          y: 0,
          duration: timings.uiIn,
          stagger: timings.uiStagger,
          ease: "power3.out",
        },
        timings.overlap,
      );

      tl.addLabel("reveal");

      tl.add(() => {
        if (!isReadyRef.current) {
          tl.pause();
        }
      }, "reveal");

      tl.call(
        () => {
          onReadyToReveal?.();
        },
        undefined,
        "reveal",
      );

      // Fade out visible logo just before zoom
      tl.to(
        ".visible-logo-wrap",
        {
          opacity: 0,
          duration: timings.logoOut,
          ease: "power2.inOut",
        },
        "reveal",
      );

      tl.to(
        ".preloader-ui",
        {
          opacity: 0,
          duration: timings.uiOut,
          ease: "power2.out",
        },
        "reveal",
      );

      tl.set(container, { backgroundColor: "transparent" }, "reveal");

      // Set explicit transparent background on the svg too
      tl.set(".preloader-mask-svg", { backgroundColor: "transparent" }, "reveal");

      // Zoom through the mask logo
      tl.to(
        ".mask-logo-group",
        {
          scale: 600,
          duration: timings.maskZoom,
          ease: "expo.inOut",
        },
        "reveal",
      );

      // Transition mask base to black to complete reveal
      tl.to(
        ".mask-base-rect",
        {
          fill: "black",
          duration: 0.1,
        },
        `reveal+=${timings.revealOffset}`,
      );

      tl.to(
        container,
        {
          opacity: 0,
          pointerEvents: "none",
          visibility: "hidden",
          ease: "power2.inOut",
          duration: timings.fadeOut,
        },
        `reveal+=${timings.fadeOffset}`,
      );
    }, container);

    return () => {
      unlockScroll();
      tlRef.current?.kill();
      ctx.revert();
    };
  }, [onComplete, onReadyToReveal]);

  return (
    <div ref={containerRef} className="preloader">
      <svg
        className="preloader-mask-svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        imageRendering="optimizeQuality"
      >
        <defs>
          {/* Filter to turn any logo content into solid black for the mask */}
          <filter id="maskBlackFilter">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
            />
          </filter>

          <mask id="preloaderRevealMask" maskUnits="userSpaceOnUse">
            <rect className="mask-base-rect" x="0" y="0" width="1000" height="1000" fill="white" />

            <g className="mask-logo-group" filter="url(#maskBlackFilter)">
              <image
                href="/assets/logo.svg"
                x="350"
                y="435"
                width="300"
                height="144"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          </mask>
        </defs>

        <rect
          className="preloader-black-overlay"
          x="0"
          y="0"
          width="1000"
          height="1000"
          fill="#060404"
          mask="url(#preloaderRevealMask)"
        />

        <foreignObject x="0" y="0" width="1000" height="1000" className="visible-logo-wrap">
          <div className="logo-container-inner">
            <img
              src="/assets/logo.svg"
              alt="Damitha Cushions"
              className="preloader-main-logo"
              style={{ transform: "translateY(7px)" }}
            />
          </div>
        </foreignObject>
      </svg>

      <div className="preloader-ui">
        <div className="preloader-frame preloader-ui-item" />

        <div className="preloader-corner preloader-corner-left preloader-ui-item" />
        <div className="preloader-corner preloader-corner-top preloader-ui-item" />
        <div className="preloader-corner preloader-corner-right preloader-ui-item" />
        <div className="preloader-corner preloader-corner-bottom preloader-ui-item" />

        <div className="preloader-label preloader-label-left preloader-ui-item">INITIALIZING</div>

        <div className="preloader-label preloader-label-right preloader-ui-item">WORKSHOP</div>

        <div className="preloader-subtitle preloader-ui-item">
          BESPOKE CUSHIONS <span>/</span> TAILORED WITH PRECISION
        </div>

        <div className="preloader-bottom-left preloader-ui-item">
          <span>HANDCRAFTED CUSHIONS</span>
          <span>MADE TO ORDER</span>
        </div>

        <div className="preloader-bottom-center preloader-ui-item">
          SOFA · OUTDOOR · CAR SEAT · CUSTOM ROOMS
        </div>

        <div className="preloader-counter-wrap preloader-ui-item">
          <div className="preloader-counter">
            <span ref={counterRef}>000</span>
          </div>

          <div className="preloader-progress">
            <div className="preloader-progress-line" />
          </div>
        </div>
      </div>
    </div>
  );
}
