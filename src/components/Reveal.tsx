import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const comp = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!comp.current) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(comp.current, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        comp.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          delay,
          scrollTrigger: {
            trigger: comp.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: comp, dependencies: [delay] },
  );

  return (
    <div ref={comp} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

export function MaskLines({ lines, className }: { lines: string[]; className?: string }) {
  const container = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;
      const els = container.current.querySelectorAll(".mask-line-inner");

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(els, { y: "0%", rotateZ: 0 });
        return;
      }

      gsap.fromTo(
        els,
        { y: "110%", rotateZ: 2 },
        {
          y: "0%",
          rotateZ: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: container.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: container },
  );

  return (
    <span ref={container} className={`block ${className || ""}`}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="block overflow-hidden pt-[0.15em] pb-[0.15em] -mt-[0.15em] -mb-[0.15em]"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
        >
          <span
            className="mask-line-inner block origin-left"
            style={{ transform: "translateY(110%) rotate(2deg)" }}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
