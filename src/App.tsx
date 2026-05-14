import emailjs from "@emailjs/browser";
import { useRef, useState, useLayoutEffect, useEffect, useId } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { Cursor } from "@/components/Cursor";
import { SeatShowcase } from "@/components/SeatShowcase";
import { Reveal, MaskLines } from "@/components/Reveal";
import { Preloader } from "@/components/Preloader";
import { Instagram, Facebook, MessageCircle, Mail, Phone } from "lucide-react";
import { absoluteUrl, buildLocalBusinessJsonLd, seo } from "@/lib/seo";

import heroImg from "@/assets/hero-cushion.jpg";

import { TegakiRenderer } from "tegaki";
import parisienne from "tegaki/fonts/parisienne";
import caveat from "tegaki/fonts/caveat";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    n: "01",
    title: "Sofa & Couch Cushions",
    material: "High-resilience foam",
    tone: "var(--color-ochre)",
    tint: "oklch(0.93 0.055 76)",
    desc: "Replacement seat and back cushions tailored to your frame. High-resilience foam, hand-finished seams.",
  },
  {
    n: "02",
    title: "Outdoor & Patio",
    material: "Weather-ready fabrics",
    tone: "var(--color-thread-blue)",
    tint: "oklch(0.91 0.04 219)",
    desc: "Weather-resistant fills and fade-tolerant fabrics for benches, loungers and garden sets.",
  },
  {
    n: "03",
    title: "Car Seat Cushions",
    material: "Leather, mesh, cotton",
    tone: "var(--color-brand-red)",
    tint: "oklch(0.91 0.045 31)",
    desc: "Custom-fit seat and back support — leather, mesh or breathable cotton, stitched to last.",
  },
  {
    n: "04",
    title: "Custom Orders",
    material: "Sketch to stitch",
    tone: "var(--color-stitch)",
    tint: "oklch(0.93 0.04 91)",
    desc: "Odd shapes, vintage furniture, one-off projects. Bring a sketch and we'll build it.",
  },
];

const CAROUSEL_IMAGES = Array.from({ length: 11 }, (_, i) => `/carrousal/${i + 1}.jpeg`);

const CAROUSEL_ROWS = [
  { direction: "right", duration: 34, offset: 0 },
  { direction: "left", duration: 39, offset: 3 },
  { direction: "right", duration: 43, offset: 6 },
  { direction: "left", duration: 36, offset: 8 },
];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const [smoothScrollReady, setSmoothScrollReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const body = document.body;

    if (isMenuOpen) {
      scrollPositionRef.current = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${scrollPositionRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
    } else {
      const scrollY = scrollPositionRef.current;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";

      if (scrollY > 0) {
        window.scrollTo(0, scrollY);
      }
    }

    return () => {
      const scrollY = scrollPositionRef.current;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";

      if (isMenuOpen && scrollY > 0) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || !isMenuOpen) return;

    const desktopQuery = window.matchMedia("(min-width: 768px)");

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const closeOnDesktop = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    desktopQuery.addEventListener("change", closeOnDesktop);
    closeOnDesktop(desktopQuery);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      desktopQuery.removeEventListener("change", closeOnDesktop);
    };
  }, [isMenuOpen]);

  const onReadyToReveal = useRef(() => {}).current;
  const onComplete = useRef(() => {
    setLoading(false);
    requestAnimationFrame(() => {
      setSmoothScrollReady(true);
    });
  }).current;

  return (
    <>
      <div id="top" className="relative bg-background text-foreground">
        {smoothScrollReady && <SmoothScrollProvider />}

        <Cursor />
        <Nav isMenuOpen={isMenuOpen} onMenuToggle={() => setIsMenuOpen((value) => !value)} />
        <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <SeatShowcase onReady={() => setHeroLoaded(true)} onProgress={setHeroProgress} />
        <Marquee />
        <Services />
        <Craftsmanship />
        <Gallery />
        <Contact />
        <Footer />
      </div>

      {loading && (
        <Preloader
          onReadyToReveal={onReadyToReveal}
          onComplete={onComplete}
          isReady={heroLoaded}
          progress={heroProgress}
        />
      )}
    </>
  );
}

function Nav({ isMenuOpen, onMenuToggle }: { isMenuOpen: boolean; onMenuToggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const navRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.2 },
    );

    const updateNav = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 40);

      if (scrollY < 100) {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", updateNav);
    updateNav();

    // Active Section Tracking
    const sections = ["services", "work", "contact"];
    sections.forEach((id) => {
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: "top 40%",
        end: "bottom 40%",
        onEnter: () => setActiveSection(id),
        onEnterBack: () => setActiveSection(id),
      });
    });

    return () => window.removeEventListener("scroll", updateNav);
  }, []);

  const navLinks = [
    { id: "home", label: "Home", to: "/", hash: "top" },
    { id: "services", label: "Services", to: "/", hash: "services" },
    { id: "work", label: "Work", to: "/", hash: "work" },
    { id: "contact", label: "Contact", to: "/", hash: "contact" },
  ];

  return (
    <header
      ref={navRef}
      className={`pointer-events-none fixed left-0 right-0 top-0 transition-all duration-500 ease-[var(--ease-out-quint)] md:pointer-events-auto ${
        isMenuOpen ? "z-[1200]" : "z-[100]"
      } ${scrolled || isMenuOpen ? "py-4" : "py-8"}`}
    >
      <div className="relative mx-auto flex max-w-[1600px] items-center px-6 md:px-12">
        <div className="flex-1 flex items-center">
          <a
            href="/"
            hash="top"
            className="pointer-events-auto relative z-10 flex items-center overflow-hidden"
          >
            <img
              src={isMenuOpen ? "/assets/logo-name.png" : "/assets/logo.svg"}
              alt={isMenuOpen ? "Damitha Cushion Works" : "DCW Logo"}
              className={`logo-motion pointer-events-none w-auto object-contain transition-all duration-300 ${
                isMenuOpen
                  ? "h-12 max-w-[min(15rem,calc(100vw-6rem))] brightness-100 md:h-16"
                  : `h-14 md:h-20 ${scrolled ? "brightness-100" : "brightness-0 invert"}`
              }`}
            />
          </a>
        </div>

        {/* Center: Nav Pill (Absolutely Centered) */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <nav className="flex items-center p-1 rounded-full border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-1 relative">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.hash}`}
                  className={`relative z-10 px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                    activeSection === link.id ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {link.label}
                  {activeSection === link.id && (
                    <div
                      className="absolute inset-0 -z-10 rounded-full bg-ochre shadow-lg shadow-ochre/40"
                      style={{ transition: "all 0.5s var(--ease-out-quint)" }}
                    />
                  )}
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* Right: CTA & Mobile Menu */}
        <div className="flex-1 flex justify-end items-center gap-4 pointer-events-auto">
          <a
            href="/"
            hash="contact"
            className="pressable hidden rounded-full border border-white/20 bg-white/10 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.25em] text-white transition-all duration-300 hover:border-ochre hover:bg-ochre focus-visible:outline-ochre md:inline-flex"
          >
            Get a quote
          </a>
          <MobileMenuButton isMenuOpen={isMenuOpen} onMenuToggle={onMenuToggle} />
        </div>
      </div>
    </header>
  );
}

function MobileMenuButton({
  isMenuOpen,
  onMenuToggle,
}: {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onMenuToggle}
      className="mobile-menu-toggle pressable md:hidden"
      aria-controls="mobile-nav-menu"
      aria-expanded={isMenuOpen}
      aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
    >
      <div className="relative flex h-5 w-5 flex-col items-center justify-center">
        <span
          className={`absolute h-[1.5px] w-5 bg-current transition-all duration-500 ease-[var(--ease-out-quint)] ${
            isMenuOpen ? "rotate-45" : "-translate-y-1.5"
          }`}
        />
        <span
          className={`absolute h-[1.5px] w-5 bg-current transition-all duration-500 ease-[var(--ease-out-quint)] ${
            isMenuOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute h-[1.5px] w-5 bg-current transition-all duration-500 ease-[var(--ease-out-quint)] ${
            isMenuOpen ? "-rotate-45" : "translate-y-1.5"
          }`}
        />
      </div>
    </button>
  );
}

function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const links = [
    { label: "Home", to: "/", hash: "top" },
    { label: "Services", to: "/", hash: "services" },
    { label: "Our Work", to: "/", hash: "work" },
    { label: "Contact", to: "/", hash: "contact" },
  ];

  useGSAP(
    () => {
      if (isOpen) {
        gsap.fromTo(
          linksRef.current.filter(Boolean),
          { y: 40, opacity: 0, rotateX: -20 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power4.out",
            delay: 0.2,
          },
        );

        gsap.fromTo(
          ".mobile-nav-footer",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.6, ease: "power3.out" },
        );
      }
    },
    { scope: containerRef, dependencies: [isOpen] },
  );

  return (
    <div
      id="mobile-nav-menu"
      ref={containerRef}
      aria-hidden={!isOpen}
      className={`mobile-nav-overlay flex flex-col justify-between ${isOpen ? "is-open" : ""}`}
    >
      <div className="flex flex-col pt-32">
        {links.map((link, i) => (
          <a
            key={link.hash}
            ref={(el) => (linksRef.current[i] = el)}
            href={`#${link.hash}`}
            onClick={onClose}
            className="mobile-nav-link group"
          >
            <span className="relative overflow-hidden">
              <span className="block transition-transform duration-500 group-hover:-translate-y-full">
                {link.label}
              </span>
              <span className="absolute left-0 top-0 block translate-y-full text-ochre transition-transform duration-500 group-hover:translate-y-0">
                {link.label}
              </span>
            </span>
            <span className="text-ochre opacity-0 transition-all duration-500 group-hover:translate-x-2 group-hover:opacity-100">
              →
            </span>
          </a>
        ))}
      </div>

      <div className="mobile-nav-footer mt-auto flex flex-col gap-10 pb-12">
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
            Get in touch
          </p>
          <a
            href="mailto:yeharadananjaya@gmail.com"
            className="text-lg font-medium leading-tight transition-colors hover:text-ochre sm:text-xl"
          >
            yeharadananjaya@gmail.com
          </a>
        </div>

        <div className="flex items-center gap-8">
          <a
            href="#"
            className="pressable text-[10px] font-bold uppercase tracking-[0.2em] hover:text-ochre"
          >
            Instagram
          </a>
          <a
            href="#"
            className="pressable text-[10px] font-bold uppercase tracking-[0.2em] hover:text-ochre"
          >
            Facebook
          </a>
        </div>
      </div>
    </div>
  );
}

function Marquee() {
  const container = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!track.current || !container.current) return;

      let direction = -1;

      const isMobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
      const duration = isMobile ? 20 : 15;

      const loop = gsap.to(track.current, {
        xPercent: -50,
        ease: "none",
        duration,
        repeat: -1,
      });

      if (isMobile) return;

      ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          gsap.to(loop, {
            timeScale: direction * (1 + Math.abs(self.getVelocity() / 500)),
            overwrite: true,
          });

          direction = self.direction === -1 ? 1 : -1;
        },
      });
    },
    { scope: container },
  );

  const items = [
    "Sofa cushions",
    "Outdoor & patio",
    "Car seats",
    "Custom orders",
    "Re-upholstery",
    "Foam replacement",
  ];

  const loopItems = [...items, ...items, ...items, ...items];

  return (
    <section ref={container} className="bg-ochre py-10 text-white md:py-16">
      <div className="overflow-hidden">
        <div
          ref={track}
          className="flex shrink-0 items-center justify-start gap-12 whitespace-nowrap font-humane text-7xl uppercase md:gap-20 md:text-[9rem] w-max"
        >
          {loopItems.map((item, i) => (
            <span key={i} className="flex items-center gap-12 md:gap-20 shrink-0">
              {item}
              <span className="text-3xl opacity-50">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const seatLeftRef = useRef<HTMLImageElement>(null);
  const seatRightRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !seatLeftRef.current) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(seatLeftRef.current, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });
        if (seatRightRef.current) {
          gsap.set(seatRightRef.current, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          });
        }
        return;
      }

      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        gsap.fromTo(
          seatLeftRef.current,
          { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            ease: "none",
            scrollTrigger: {
              trigger: seatLeftRef.current,
              start: "top 84%",
              end: "bottom 58%",
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          },
        );
        if (seatRightRef.current) {
          gsap.fromTo(
            seatRightRef.current,
            { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              ease: "none",
              scrollTrigger: {
                trigger: seatRightRef.current,
                start: "top 86%",
                end: "bottom 62%",
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      } else {
        // Desktop: animate left seat only
        gsap.fromTo(
          seatLeftRef.current,
          { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current, // Use the whole section on desktop to match previous behavior
              start: "top 75%",
              end: "bottom 50%",
              scrub: 1.5,
            },
          },
        );
      }
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="services"
      ref={sectionRef}
      className="surface-weave relative py-32 md:py-48 overflow-hidden"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-[50%] md:h-full w-[80vw] md:w-[50vw] z-0 opacity-90 mix-blend-multiply">
        <img
          ref={seatLeftRef}
          src="/assets/seat-01-front-left.svg"
          alt=""
          className="h-full w-full object-contain object-right"
        />
      </div>

      <div className="pointer-events-none absolute left-0 bottom-0 h-[50%] w-[80vw] z-0 opacity-90 mix-blend-multiply md:hidden">
        <img
          ref={seatRightRef}
          src="/assets/seat-01-front-right.svg"
          alt=""
          className="h-full w-full object-contain object-left"
        />
      </div>

      <div className="mx-auto max-w-[1600px] px-6 md:px-12 relative z-10">
        <div className="mb-20 grid grid-cols-12 gap-8 md:mb-32">
          <p className="col-span-12 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground md:col-span-2">
            (03) — Services
          </p>

          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-[clamp(4.5rem,10vw,11rem)] font-medium uppercase leading-[0.85] tracking-tight">
              <MaskLines lines={["Expertise born", "from repetition."]} />
            </h2>
          </div>
        </div>

        <div className="space-y-0 border-t border-border">
          {SERVICES.map((service) => (
            <ServiceRow key={service.n} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceRow({ n, title, material, tone, tint, desc }: (typeof SERVICES)[number]) {
  return (
    <div
      className="group border-b border-border transition-colors duration-500 hover:bg-foreground/[0.025]"
      style={
        {
          "--service-tone": tone,
          "--service-tint": tint,
        } as React.CSSProperties
      }
      data-cursor-hover
    >
      <div className="grid w-full grid-cols-12 items-start gap-6 px-4 py-10 text-left md:items-center md:py-14">
        <span className="col-span-12 font-mono text-xs text-muted-foreground opacity-60 md:col-span-1">
          {n}
        </span>

        <h3 className="col-span-12 font-display text-4xl uppercase transition-colors duration-500 group-hover:text-[var(--service-tone)] md:col-span-5 md:text-6xl">
          {title}
        </h3>

        <div className="col-span-12 max-w-sm space-y-4 md:col-span-6">
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{desc}</p>
          <span className="inline-flex rounded-full bg-[var(--service-tint)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/80">
            {material}
          </span>
        </div>
      </div>
    </div>
  );
}

function Gallery() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) return;

      const carousel = container.current.querySelector(".archive-carousel");
      const tracks = gsap.utils.toArray<HTMLElement>(".archive-carousel-track");

      const tweens = tracks.map((track) => {
        const direction = track.dataset.direction;
        const duration = Number(track.dataset.duration) || 38;
        const from = direction === "right" ? -50 : 0;
        const to = direction === "right" ? 0 : -50;

        gsap.set(track, { xPercent: from });

        return gsap.to(track, {
          xPercent: to,
          ease: "none",
          duration,
          repeat: -1,
        });
      });

      const pause = () => {
        tweens.forEach((tween) => {
          gsap.to(tween, {
            timeScale: 0,
            duration: 0.55,
            ease: "power3.out",
            overwrite: true,
          });
        });
      };

      const play = () => {
        tweens.forEach((tween) => {
          gsap.to(tween, {
            timeScale: 1,
            duration: 0.8,
            ease: "power3.out",
            overwrite: true,
          });
        });
      };

      carousel?.addEventListener("pointerenter", pause);
      carousel?.addEventListener("pointerleave", play);
      carousel?.addEventListener("focusin", pause);
      carousel?.addEventListener("focusout", play);

      return () => {
        carousel?.removeEventListener("pointerenter", pause);
        carousel?.removeEventListener("pointerleave", play);
        carousel?.removeEventListener("focusin", pause);
        carousel?.removeEventListener("focusout", play);
      };
    },
    { scope: container },
  );

  return (
    <section ref={container} id="work" className="bg-secondary py-32 md:py-48">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="mb-20 grid grid-cols-12 gap-8 md:mb-32">
          <p className="col-span-12 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground md:col-span-2">
            (04) — Selected work
          </p>

          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-[clamp(4.5rem,10vw,11rem)] font-medium uppercase leading-[0.85] tracking-tight">
              <MaskLines lines={["An archive of", "recent commissions."]} />
            </h2>
          </div>
        </div>

        <Reveal>
          <div
            className="archive-carousel group/carousel relative -mx-6 overflow-hidden rounded-[4px] bg-foreground/10 shadow-2xl shadow-foreground/10 ring-1 ring-foreground/10 md:-mx-12"
            data-cursor-hover
            tabIndex={0}
            aria-label="Recent cushion commissions carousel"
          >
            <div className="relative z-10">
              {CAROUSEL_ROWS.map((row, rowIndex) => {
                const shiftedImages = [
                  ...CAROUSEL_IMAGES.slice(row.offset),
                  ...CAROUSEL_IMAGES.slice(0, row.offset),
                ];
                const loopImages = [...shiftedImages, ...shiftedImages];

                return (
                  <div
                    key={`${row.direction}-${rowIndex}`}
                    className={rowIndex > 1 ? "hidden md:block" : "block"}
                  >
                    <div
                      className="archive-carousel-track flex w-max will-change-transform"
                      data-direction={row.direction}
                      data-duration={row.duration}
                    >
                      {loopImages.map((src, imageIndex) => {
                        const commissionNumber = (imageIndex % CAROUSEL_IMAGES.length) + 1;

                        return (
                          <div
                            key={`${rowIndex}-${src}-${imageIndex}`}
                            className="group/image relative aspect-[1122/1402] w-[50vw] shrink-0 overflow-hidden bg-muted md:w-[23vw] lg:w-[18vw] xl:w-[15.5rem]"
                          >
                            <img
                              src={src}
                              alt={`Damitha cushion commission ${commissionNumber}`}
                              className="gallery-image-motion h-full w-full object-cover opacity-95 saturate-[0.92] contrast-[1.04] transition-[transform,opacity,filter] duration-500 ease-[var(--ease-out-quint)] group-hover/image:opacity-100 group-hover/image:saturate-100"
                              loading="lazy"
                              draggable={false}
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/8 opacity-50 transition-opacity duration-500 group-hover/image:opacity-20" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-20 bg-gradient-to-r from-secondary to-transparent md:w-40" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-20 bg-gradient-to-l from-secondary to-transparent md:w-40" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Craftsmanship() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftIconRef = useRef<HTMLImageElement>(null);
  const rightIconRef = useRef<HTMLImageElement>(null);
  const hasPlayedCraftAnimation = useRef(false);
  const [playTegaki, setPlayTegaki] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 75%",
        onEnter: () => {
          if (hasPlayedCraftAnimation.current) return;

          hasPlayedCraftAnimation.current = true;
          setPlayTegaki(true);

          const decorativeIcons = [leftIconRef.current, rightIconRef.current].filter(
            (icon): icon is HTMLImageElement => Boolean(icon),
          );

          if (reduceMotion || isMobile) {
            setShowName(true);
            setShowTitle(true);
            gsap.set(decorativeIcons, { opacity: 0.25, scale: 1 });
          } else {
            // Sequential reveal
            gsap.delayedCall(3.2, () => setShowName(true));
            gsap.delayedCall(5.2, () => setShowTitle(true));

            // Reveal side icons
            gsap.fromTo(
              decorativeIcons,
              { opacity: 0, scale: 0.9 },
              {
                opacity: 0.25,
                scale: 1,
                duration: 2.5,
                ease: "power3.out",
                stagger: 0.2,
              },
            );
          }
        },
      });

      if (isMobile) return;

      // Subtle parallax for icons, kept in sync to avoid scroll jitter.
      gsap.to([leftIconRef.current, rightIconRef.current], {
        y: -24,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="bg-ochre py-32 md:py-48 text-white relative overflow-hidden"
    >
      {/* Decorative Icons */}
      <img
        ref={leftIconRef}
        src="/assets/seat-01-front-right.png"
        alt=""
        className="pointer-events-none absolute left-0 top-0 h-full w-auto opacity-0 brightness-0 invert will-change-transform md:top-12 md:left-0"
      />
      <img
        ref={rightIconRef}
        src="/assets/seat-01-front-left.png"
        alt=""
        className="pointer-events-none absolute right-0 top-0 h-full w-auto opacity-0 brightness-0 invert will-change-transform md:top-12 md:right-0"
      />

      <div className="mx-auto max-w-[1600px] px-6 md:px-12 flex flex-col items-center text-center relative z-10">
        <div className="max-w-4xl text-2xl md:text-3xl lg:text-4xl leading-tight text-white/90">
          {isMounted && playTegaki && (
            <>
              <TegakiRenderer
                font={parisienne}
                time={{ mode: "uncontrolled", speed: 5.5 }}
                style={{
                  fontFamily: "'Parisienne', cursive",
                  lineHeight: "1.4",
                  textAlign: "center",
                }}
              >
                Every cushion that leaves our workshop carries our name. We believe in doing things
                once, and doing them right.
              </TegakiRenderer>

              <div className="mt-10 flex flex-col items-center">
                {showName && (
                  <TegakiRenderer
                    font={caveat}
                    time={{ mode: "uncontrolled", speed: 4.5 }}
                    style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                      opacity: 0.8,
                    }}
                  >
                    — Damitha Priyankara Landege
                  </TegakiRenderer>
                )}

                {showTitle && (
                  <div className="mt-2 overflow-hidden">
                    <p className="animate-in fade-in slide-in-from-bottom-2 duration-1000 text-[10px] font-medium uppercase tracking-[0.3em] opacity-40">
                      Founder
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const whatsapp = "+94702249246";
  const mobile = "+94766438015";
  const mail = "yeharadananjaya@gmail.com";

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setSubmitState("error");
      console.error(
        "EmailJS is missing VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, or VITE_EMAILJS_PUBLIC_KEY.",
      );
      return;
    }

    setSubmitState("sending");

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: name,
          from_email: email,
          message: msg,
          to_email: mail,
          reply_to: email,
        },
        { publicKey },
      );

      setName("");
      setEmail("");
      setMsg("");
      setSubmitState("sent");
    } catch (error) {
      console.error("EmailJS send failed:", error);
      setSubmitState("error");
    }
  }

  return (
    <section id="contact" className="bg-foreground py-32 text-background md:py-48">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-12 gap-8">
          <p className="col-span-12 text-[10px] font-medium uppercase tracking-[0.3em] opacity-60 md:col-span-2">
            (05) — Contact
          </p>

          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-[clamp(6rem,14vw,16rem)] font-medium uppercase leading-[0.8] tracking-tight">
              <MaskLines lines={["Let's make", "something."]} />
            </h2>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-12 gap-12 md:mt-40">
          <div className="col-span-12 md:col-span-5">
            <Reveal>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] opacity-60">
                Direct
              </p>

              <div className="mt-8 space-y-6">
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex w-fit items-center gap-4 font-display text-5xl uppercase transition-colors hover:text-ochre md:text-7xl"
                >
                  <MessageCircle className="h-7 w-7 opacity-50 transition-opacity group-hover:opacity-100 md:h-9 md:w-9" />
                  WhatsApp
                </a>

                <a
                  href={`tel:${mobile}`}
                  className="group flex w-fit items-center gap-4 font-display text-5xl uppercase transition-colors hover:text-ochre md:text-7xl"
                >
                  <Phone className="h-7 w-7 opacity-50 transition-opacity group-hover:opacity-100 md:h-9 md:w-9" />
                  {mobile}
                </a>

                <a
                  href={`mailto:${mail}`}
                  className="group flex w-fit items-center gap-4 break-all font-display text-4xl uppercase transition-colors hover:text-ochre md:text-5xl"
                >
                  <Mail className="h-7 w-7 shrink-0 opacity-50 transition-opacity group-hover:opacity-100 md:h-8 md:w-8" />
                  {mail}
                </a>
              </div>

              <div className="mt-16 flex gap-8 text-[11px] font-medium uppercase tracking-[0.25em]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-ochre"
                >
                  Instagram
                </a>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-ochre"
                >
                  Facebook
                </a>
              </div>

              <div className="mt-16">
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] opacity-60">
                  Workshop
                </p>
                <p className="mt-5 max-w-sm text-xl leading-snug opacity-85 md:text-2xl">
                  No.14, Galle Road, Pamburana, Matara, Sri Lanka
                </p>
              </div>
            </Reveal>
          </div>

          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <form onSubmit={submit} className="space-y-12">
              <Field label="Your name" value={name} onChange={setName} maxLength={80} required />

              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                maxLength={120}
                required
              />

              <Field
                label="Tell us about your project"
                value={msg}
                onChange={setMsg}
                textarea
                maxLength={1000}
                required
              />

              <button
                type="submit"
                disabled={submitState === "sending"}
                className="pressable group relative inline-flex min-h-12 items-center gap-4 overflow-hidden rounded-full border border-background/20 bg-background px-8 py-5 text-[11px] font-medium uppercase tracking-[0.25em] text-foreground hover:border-ochre hover:bg-ochre hover:text-white hover:shadow-xl"
              >
                <span className="relative z-10">
                  {submitState === "sending" ? "Sending..." : "Send enquiry"}
                </span>
                <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </button>

              {submitState === "sent" ? (
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ochre">
                  Enquiry sent. We will get back to you soon.
                </p>
              ) : null}

              {submitState === "error" ? (
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-background/70">
                  Could not send right now. Please email {mail}.
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea,
  maxLength,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  maxLength?: number;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const id = useId();

  const commonProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    maxLength,
    required,
    className:
      "mt-4 w-full resize-none border-0 border-b border-background/20 bg-transparent py-3 text-xl text-background placeholder-background/30 outline-none transition-colors focus:border-ochre focus-visible:outline-none",
  };

  return (
    <label htmlFor={id} className="relative block overflow-hidden">
      <span
        className={`text-[10px] font-medium uppercase tracking-[0.3em] transition-[color,opacity] duration-[180ms] ease-[var(--ease-out-quint)] ${
          focused || value ? "text-ochre opacity-100" : "opacity-60"
        }`}
      >
        {label}
      </span>

      {textarea ? (
        <textarea {...commonProps} id={id} rows={4} />
      ) : (
        <input {...commonProps} id={id} type={type} />
      )}
      {maxLength ? (
        <span className="mt-2 block text-right text-[10px] font-medium uppercase tracking-[0.18em] text-background/35">
          {value.length}/{maxLength}
        </span>
      ) : null}
    </label>
  );
}

function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const currentYear = new Date().getFullYear();

  useGSAP(
    () => {
      if (!footerRef.current) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const words = gsap.utils.toArray<HTMLElement>(".footer-word");
      const typographyTrack = footerRef.current.querySelector<HTMLElement>(
        ".footer-typography-track",
      );
      const supportItems = gsap.utils.toArray<HTMLElement>(".footer-support");

      if (reduceMotion) {
        gsap.set([...words, ...supportItems], { clearProps: "all" });
        if (typographyTrack) gsap.set(typographyTrack, { clearProps: "all" });
        return;
      }

      gsap.set(words, {
        yPercent: 115,
        rotateX: -72,
        skewY: isMobile ? 2 : 5,
        opacity: 0,
        transformOrigin: "50% 100% -120px",
      });

      gsap.set(supportItems, {
        y: isMobile ? 15 : 25,
        autoAlpha: 0,
      });

      if (typographyTrack) {
        gsap.set(typographyTrack, { xPercent: 0 });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
          end: "bottom bottom",
          toggleActions: "play none none none",
        },
      });

      tl.to(supportItems, {
        y: 0,
        autoAlpha: 1,
        duration: isMobile ? 0.6 : 0.8,
        ease: "power3.out",
        stagger: 0.045,
      })
        .to(
          ".footer-word[data-word-index='0']",
          {
            yPercent: 0,
            rotateX: 0,
            skewY: 0,
            opacity: 1,
            duration: isMobile ? 0.72 : 0.88,
            ease: "expo.out",
          },
          "-=0.05",
        )
        .to(
          ".footer-word[data-word-index='1']",
          {
            yPercent: 0,
            rotateX: 0,
            skewY: 0,
            opacity: 1,
            duration: isMobile ? 0.72 : 0.88,
            ease: "expo.out",
          },
          "-=0.45",
        )
        .to(
          ".footer-word[data-word-index='2']",
          {
            yPercent: 0,
            rotateX: 0,
            skewY: 0,
            opacity: 1,
            duration: isMobile ? 0.72 : 0.88,
            ease: "expo.out",
          },
          "-=0.45",
        );

      if (typographyTrack) {
        tl.to(
          typographyTrack,
          {
            xPercent: -50,
            duration: isMobile ? 15 : 22,
            ease: "none",
            repeat: -1,
          },
          "+=0.15",
        );
      }

      if (!isMobile) {
        // Subtle vertical parallax for the whole footer
        gsap.fromTo(
          footerRef.current,
          { y: 56 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          },
        );
      }
    },
    { scope: footerRef },
  );

  const words = ["Damitha", "Cushion", "Works"];
  const marqueeCopies = [0, 1, 2, 3];

  return (
    <footer
      ref={footerRef}
      className="grain relative overflow-hidden bg-ochre pb-10 pt-20 text-white perspective-[1200px]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/35" />
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-14 border-b border-white/15 pb-14 md:grid-cols-12 md:gap-16 md:pb-20">
          <div className="footer-support col-span-1 space-y-10 md:col-span-5">
            <div className="space-y-6">
              <img
                src="/assets/logo-with-name.png"
                alt="Damitha Cushion Works"
                className="h-14 w-auto brightness-0 invert opacity-100"
              />
              <p className="max-w-sm text-sm leading-relaxed opacity-60 font-medium">
                A small workshop built on craft and care. We specialize in handcrafted cushions,
                tailored replacement sets, and bespoke automotive seating solutions.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Open Damitha Cushion Works on Instagram"
                className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/20 opacity-70 hover:border-white hover:opacity-100 hover:bg-white hover:text-ochre"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Open Damitha Cushion Works on Facebook"
                className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/20 opacity-70 hover:border-white hover:opacity-100 hover:bg-white hover:text-ochre"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://wa.me/94702249246"
                target="_blank"
                rel="noreferrer"
                aria-label="Message Damitha Cushion Works on WhatsApp"
                className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/20 opacity-70 hover:border-white hover:opacity-100 hover:bg-white hover:text-ochre"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          <div className="hidden md:col-span-1 md:block" />

          <div className="footer-support col-span-1 grid grid-cols-1 gap-12 sm:grid-cols-2 md:col-span-6">
            <div className="space-y-8">
              <div>
                <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                  Inquiries
                </p>
                <div className="space-y-4">
                  <a
                    href="tel:+94766438015"
                    className="group flex items-center gap-3 text-lg font-medium transition-colors hover:text-white/80"
                  >
                    <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                      <Phone size={16} />
                    </span>
                    +94 76 643 8015
                  </a>
                  <a
                    href="mailto:yeharadananjaya@gmail.com"
                    className="group flex items-center gap-3 text-lg font-medium transition-colors hover:text-white/80"
                  >
                    <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                      <Mail size={16} />
                    </span>
                    Email us
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                  The Workshop
                </p>
                <p className="text-lg font-medium leading-snug opacity-90">
                  No.14, Galle Road,
                  <br />
                  Pamburana, Matara,
                  <br />
                  Sri Lanka
                </p>
                <p className="mt-4 text-xs opacity-50 font-medium">
                  Monday to Sunday / 8:30 AM - 5:30 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-typography-window border-b border-white/15">
          <h2
            aria-label="Damitha Cushion Works"
            className="footer-typography-track font-display font-medium uppercase text-white"
          >
            {marqueeCopies.map((copyIndex) => (
              <span key={copyIndex} className="footer-typography-phrase" aria-hidden="true">
                {words.map((word, wordIdx) => (
                  <span key={`${copyIndex}-${word}`} className="footer-word-mask">
                    <span
                      className="footer-word inline-block will-change-transform"
                      data-word-index={wordIdx}
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </h2>
        </div>

        <div className="footer-support mt-10 flex flex-col items-center justify-between gap-6 text-[10px] font-bold uppercase tracking-[0.25em] md:mt-12 md:flex-row">
          <p className="opacity-40">© {currentYear} Damitha Cushion Works — All rights reserved</p>

          <div className="flex items-center gap-8">
            <a
              href="#top"
              className="pressable group flex items-center gap-2 opacity-50 hover:opacity-100"
            >
              Back to top
              <span className="inline-block transition-transform group-hover:-translate-y-1">
                ↑
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
