import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isTouchFirst = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const iosMatch = window.navigator.userAgent.match(/OS (\d+)_/);
    const isLegacyIos = Boolean(iosMatch && Number(iosMatch[1]) < 16);

    const lenis = new Lenis({
      duration: isTouchFirst ? 0.85 : 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !isTouchFirst,
      syncTouch: isTouchFirst && !isLegacyIos,
      syncTouchLerp: 0.08,
      touchInertiaExponent: 1.35,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
