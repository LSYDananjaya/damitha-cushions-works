import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type PreloaderProps = {
  onComplete?: () => void;
  onReadyToReveal?: () => void;
};

export function Preloader({ onComplete, onReadyToReveal }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    /**
     * Fixes React StrictMode double-run in development.
     */
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    const counterObj = { value: 0 };
    const scrollLockTargets = [document.documentElement, document.body];

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
          gsap.set(scrollLockTargets, {
            overflow: "",
          });
          if (container) container.style.display = "none";
          onComplete?.();
        },
      });

      // 1. Initial UI entrance
      tl.to(".visible-logo-wrap", {
        opacity: 1,
        scale: 1,
        duration: 2,
        ease: "expo.out",
      });

      tl.to(
        ".preloader-ui-item",
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
        },
        "-=1.5",
      );

      // 2. Counter and Progress
      tl.to(
        counterObj,
        {
          value: 100,
          duration: 3,
          ease: "power2.inOut",
          onUpdate: () => {
            if (!counterRef.current) return;
            const val = Math.round(counterObj.value);
            counterRef.current.textContent = String(val).padStart(3, "0");
          },
        },
        "-=1.5",
      );

      tl.to(
        ".preloader-progress-line",
        {
          scaleX: 1,
          duration: 3,
          ease: "power2.inOut",
        },
        "<",
      );

      tl.addLabel("reveal");

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
          duration: 0.4,
          ease: "power2.inOut",
        },
        "reveal",
      );

      tl.to(
        ".preloader-ui",
        {
          opacity: 0,
          duration: 0.6,
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
          duration: 2.2,
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
        "reveal+=2.1",
      );

      tl.to(
        container,
        {
          opacity: 0,
          duration: 0.4,
          pointerEvents: "none",
          visibility: "hidden",
          ease: "power2.inOut",
        },
        "reveal+=2.2",
      );
    }, container);

    return () => {
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
