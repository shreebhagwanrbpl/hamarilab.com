"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowRight,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Film,
} from "lucide-react";

// Default high-quality fallback slides if database has no media configured yet
const FALLBACK_SLIDES = [
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1900&q=80",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1900&q=80",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1900&q=80",
  },
];

export default function HeroCarousel({
  homeData = null,
  locationTitle = "",
  makeLink = (path) => path,
  loading = false,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const videoRefs = useRef({});

  // Parse media items from Firestore home data
  const parseMediaList = (data) => {
    if (!data) return [];
    const list = [];

    // 1. Check media array (preferred)
    if (Array.isArray(data.media) && data.media.length > 0) {
      data.media.forEach((item, idx) => {
        const url = typeof item === "string" ? item : item?.url;
        const type =
          item?.type ||
          (url?.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ? "video" : "image");
        if (url) {
          list.push({
            id: `media-${idx}`,
            type,
            url,
          });
        }
      });
    }

    // 2. Check images array
    if (list.length === 0 && Array.isArray(data.images) && data.images.length > 0) {
      data.images.forEach((url, idx) => {
        if (url) {
          list.push({
            id: `img-${idx}`,
            type: "image",
            url,
          });
        }
      });
    }

    // 3. Check single imageUrl / image
    if (list.length === 0 && (data.imageUrl || data.image)) {
      const singleImg = data.imageUrl || data.image;
      if (singleImg) {
        list.push({
          id: "single-img",
          type: "image",
          url: singleImg,
        });
      }
    }

    // 4. Check videos array
    if (Array.isArray(data.videos) && data.videos.length > 0) {
      data.videos.forEach((vUrl, idx) => {
        if (vUrl && !list.some((item) => item.url === vUrl)) {
          list.push({
            id: `vid-${idx}`,
            type: "video",
            url: vUrl,
          });
        }
      });
    }

    // 5. Check single videoUrl
    if (data.videoUrl && !list.some((item) => item.url === data.videoUrl)) {
      list.push({
        id: "single-vid",
        type: "video",
        url: data.videoUrl,
      });
    }

    return list;
  };

  const dbSlides = parseMediaList(homeData);
  const slides = dbSlides.length > 0 ? dbSlides : FALLBACK_SLIDES;

  // Pure dynamic texts - zero static fallback text
  const heroTitle = homeData?.title?.trim()
    ? (locationTitle && !homeData.title.toLowerCase().includes(locationTitle.toLowerCase())
      ? `${homeData.title.trim()} in ${locationTitle}`
      : homeData.title.trim())
    : (locationTitle ? `Biomedical Equipment in ${locationTitle}` : "");

  const heroDescription =
    homeData?.description?.trim() ||
    homeData?.desc?.trim() ||
    homeData?.subtitle?.trim() ||
    "";

  // Pure dynamic buttons - zero static fallback strings
  const btn1Text = (
    homeData?.button1Text ||
    homeData?.button1Title ||
    homeData?.btn1Text ||
    homeData?.buttonText ||
    ""
  )?.trim();
  const rawBtn1Link = homeData?.button1Link || homeData?.button1Url || homeData?.btn1Link || "/items";
  const btn1Href = rawBtn1Link.startsWith("http") || rawBtn1Link.startsWith("tel:") || rawBtn1Link.startsWith("mailto:")
    ? rawBtn1Link
    : makeLink(rawBtn1Link.startsWith("/") ? rawBtn1Link : `/${rawBtn1Link}`);

  const btn2Text = (
    homeData?.button2Text ||
    homeData?.button2Title ||
    homeData?.btn2Text ||
    ""
  )?.trim();
  const rawBtn2Link = homeData?.button2Link || homeData?.button2Url || homeData?.btn2Link || "/contact";
  const btn2Href = rawBtn2Link.startsWith("http") || rawBtn2Link.startsWith("tel:") || rawBtn2Link.startsWith("mailto:")
    ? rawBtn2Link
    : makeLink(rawBtn2Link.startsWith("/") ? rawBtn2Link : `/${rawBtn2Link}`);

  const badgeText = (
    homeData?.badge ||
    homeData?.tagline ||
    (locationTitle ? `Biomedical Equipment Supplier in ${locationTitle}` : "")
  )?.trim();

  // Auto-slide effect
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPlaying, slides.length, currentSlide]);

  // Adjust active slide index safely if slides array length changes
  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(slides.length - 1);
    }
  }, [slides.length, currentSlide]);

  // Play video on current slide
  useEffect(() => {
    const currentMedia = slides[currentSlide];
    if (currentMedia?.type === "video") {
      const vid = videoRefs.current[currentSlide];
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => { });
      }
    }
  }, [currentSlide, slides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Touch swipe support for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const activeMedia = slides[currentSlide] || slides[0];

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white min-h-[520px] lg:min-h-[580px] flex items-center">
      {/* Ambient Teal Background Glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-teal-600/10 blur-[140px]" />

      {/* Main Grid Container with Diagonal Split */}
      <div className="container-custom relative z-10 w-full py-10 lg:py-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ================= LEFT CONTENT COLUMN ================= */}
          <div className="lg:col-span-6 z-20">
            {/* Top Innovation Badge */}
            {badgeText && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300 shadow-lg backdrop-blur-md"
              >
                <Sparkles size={14} className="text-teal-400 animate-pulse" />
                <span>{badgeText}</span>
              </motion.div>
            )}

            {/* Dynamic Hero Heading */}
            {heroTitle && (
              <motion.h1
                key={`title-${heroTitle}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[2.85rem] leading-[1.12]"
              >
                {heroTitle}
              </motion.h1>
            )}

            {/* Dynamic Description */}
            {heroDescription && (
              <motion.p
                key={`desc-${heroDescription}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-3.5 text-sm sm:text-base leading-relaxed text-slate-300 max-w-xl font-medium"
              >
                {heroDescription}
              </motion.p>
            )}

            {/* CTA Buttons */}
            {(btn1Text || btn2Text) && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 flex flex-wrap items-center gap-3.5"
              >
                {btn1Text && (
                  <Link
                    href={btn1Href}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0d9488] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#0d9488]/30 transition-all duration-300 hover:bg-[#0f766e] hover:shadow-2xl hover:-translate-y-0.5 border border-teal-400/20"
                  >
                    <span>{btn1Text}</span>
                    <ArrowRight size={16} />
                  </Link>
                )}

                {btn2Text && (
                  <Link
                    href={btn2Href}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:!text-slate-950 hover:border-white hover:-translate-y-0.5"
                  >
                    <PhoneCall size={16} className="text-teal-400" />
                    <span>{btn2Text}</span>
                  </Link>
                )}
              </motion.div>
            )}

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-5 border-t border-slate-800/80 pt-5 text-xs font-semibold text-slate-300"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#0d9488] shrink-0" />
                <span>ISO 13485 Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#0d9488] shrink-0" />
                <span>24/7 SLA Field Support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#0d9488] shrink-0" />
                <span>NABL Traceable Calibration</span>
              </div>
            </motion.div>
          </div>

          {/* ================= RIGHT DIAGONAL CAROUSEL MEDIA ================= */}
          <div className="lg:col-span-6 relative">
            {/* Diagonal Frame Container */}
            <div
              className="relative h-[340px] sm:h-[420px] md:h-[460px] lg:h-[490px] w-full overflow-hidden rounded-3xl lg:rounded-[36px] border border-teal-500/20 shadow-2xl shadow-black/80 bg-slate-900"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              }}
            >
              {/* Diagonal Decorative Cut Accent Lines */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-teal-500/20 blur-2xl z-20" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 z-10" />

              {/* Animated Slides */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  {activeMedia?.type === "video" ? (
                    <video
                      ref={(el) => (videoRefs.current[currentSlide] = el)}
                      src={activeMedia.url}
                      className="w-full h-full object-cover object-center"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                    />
                  ) : (
                    <img
                      src={activeMedia?.url}
                      alt={`Hero Slide ${currentSlide + 1}`}
                      className="w-full h-full object-cover object-center brightness-[0.98] contrast-[1.03]"
                      onError={(e) => {
                        e.target.src = FALLBACK_SLIDES[0].url;
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Floating Slide Tag */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-xl bg-slate-950/80 border border-teal-500/30 px-3.5 py-1.5 text-xs font-bold text-teal-300 backdrop-blur-md shadow-lg">
                {activeMedia?.type === "video" ? (
                  <Film size={14} className="text-teal-400" />
                ) : (
                  <ImageIcon size={14} className="text-teal-400" />
                )}
                <span>Diagnostic Equipment</span>
              </div>

              {/* Floating Slide Navigation Controls */}
              {slides.length > 1 && (
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    title="Previous Slide"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/80 text-white backdrop-blur-md border border-slate-700 hover:bg-[#0d9488] hover:border-[#0d9488] transition-all shadow-md"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center rounded-xl bg-slate-950/90 px-3 py-1.5 text-xs font-bold text-teal-200 backdrop-blur-md border border-slate-700 shadow-md">
                    <span>
                      {currentSlide + 1} / {slides.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    title="Next Slide"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/80 text-white backdrop-blur-md border border-slate-700 hover:bg-[#0d9488] hover:border-[#0d9488] transition-all shadow-md"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* Diagonal Bottom Pagination Dots */}
              {slides.length > 1 && (
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full h-2 ${currentSlide === idx
                        ? "w-7 bg-[#0d9488] shadow-md shadow-[#0d9488]/80"
                        : "w-2 bg-white/40 hover:bg-white"
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
