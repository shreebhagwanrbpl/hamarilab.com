"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import {
  Microscope,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Building2,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Mail,
  Wrench,
  Activity,
  Award,
  Clock,
  HeartPulse,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";

import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import ProductCard from "@/components/ProductCard";
import ContactForm from "@/components/ContactForm";
import HeroCarousel from "@/components/HeroCarousel";
import { fetchAllDynamicProducts } from "@/lib/fetchProducts";

const stats = [
  {
    number: "5,000+",
    title: "Healthcare Partners",
    desc: "Hospitals & labs served nationwide",
    icon: Building2,
  },
  {
    number: "3,500+",
    title: "Products & Kits",
    desc: "Precision diagnostic instruments",
    icon: Microscope,
  },
  {
    number: "10+ Yrs",
    title: "Engineering Excellence",
    desc: "Proven biomedical leadership",
    icon: ShieldCheck,
  },
  {
    number: "99.9%",
    title: "Accuracy SLA",
    desc: "NABL & ISO certified standards",
    icon: Award,
  },
];

const pillars = [
  {
    title: "Certified Calibration Standards",
    desc: "Every diagnostic analyzer undergoes NABL-traceable calibration to ensure precise patient diagnostics and regulatory safety.",
    icon: Award,
    badge: "ISO 13485 Certified",
  },
  {
    title: "24/7 Emergency AMC Response",
    desc: "Our nationwide team of biomedical engineers delivers rapid on-site maintenance to keep critical ICU and OT gear active.",
    icon: Zap,
    badge: "2-Hour SLA",
  },
  {
    title: "Turnkey Lab Setup & Engineering",
    desc: "From architectural workflow layout to instrument installation and staff certification, we engineer complete pathology labs.",
    icon: Building2,
    badge: "Turnkey Engineering",
  },
  {
    title: "Cold-Chain Reagent Supply",
    desc: "Strictly temperature-monitored distribution of biochemistry reagents, controls, and rapid assay kits with extended shelf life.",
    icon: FlaskConical,
    badge: "Monitored Cold Chain",
  },
];

const testimonials = [
  {
    quote:
      "Raj Biosis transformed our central laboratory setup. Their automated analyzers increased our daily sample throughput by 40% with zero downtime.",
    author: "Dr. Arvind Sharma",
    role: "Chief Pathologist",
    institution: "Apollo Diagnostics Center",
    rating: 5,
  },
  {
    quote:
      "The 24/7 AMC response team is outstanding. When our ICU patient monitor system faced a sensor issue, their engineer arrived within 90 minutes.",
    author: "Dr. Meenakshi Sundaram",
    role: "Medical Director",
    institution: "Metro Multispecialty Hospital",
    rating: 5,
  },
  {
    quote:
      "Their cold-chain reagent delivery has never failed us. Quality control results are consistently accurate, month after month.",
    author: "Rajesh Varma",
    role: "Laboratory Operations Manager",
    institution: "LifeCare PathLabs",
    rating: 5,
  },
];

export default function Home({ city }) {
  // Dynamic Firebase services only
  const [services, setServices] = useState([]);

  const [products, setProducts] = useState([]);
  const [homeData, setHomeData] = useState(null);
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);

  const staticRoutes = ["about", "services", "items", "contact"];

  const district =
    pathParts.length > 0 && !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  const locationTitle =
    city || (district ? district.replace(/-/g, " ") : "");

  const makeLink = (path) => {
    if (!district) return path;
    if (path === "/") return `/${district}`;
    return `/${district}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ============================================================
        // HOME PAGE DATA
        // ============================================================
        try {
          const homeSnap = await getDoc(
            doc(db, "websites", "hamarilabcom", "pages", "home")
          );

          if (homeSnap.exists()) {
            setHomeData(homeSnap.data());
          }
        } catch (homeErr) {
          console.error("Error fetching home data:", homeErr);
        }

        // ============================================================
        // CONTACT DATA
        // ============================================================
        try {
          const contactSnap = await getDoc(
            doc(db, "websites", "hamarilabcom", "pages", "contact")
          );

          if (contactSnap.exists()) {
            setContactInfo(contactSnap.data().contactInfo || []);
          }
        } catch (contactErr) {
          console.error("Error fetching contact data:", contactErr);
        }

        // ============================================================
        // SERVICES - FIREBASE ONLY
        // NO FALLBACK DATA
        // ADMIN SCHEMA:
        // {
        //   services: [
        //     {
        //       title: "...",
        //       desc: "..."
        //     }
        //   ]
        // }
        // ============================================================
        try {
          const serviceSnap = await getDoc(
            doc(db, "websites", "hamarilabcom", "pages", "services")
          );

          if (serviceSnap.exists()) {
            const firebaseServices = serviceSnap.data()?.services;

            if (Array.isArray(firebaseServices)) {
              const dynamicServices = firebaseServices
                .map((service, index) => ({
                  id: service?.id || `service-${index}`,
                  title:
                    typeof service?.title === "string"
                      ? service.title.trim()
                      : "",
                  desc:
                    typeof service?.desc === "string"
                      ? service.desc.trim()
                      : "",
                }))
                // Only show properly configured services
                .filter(
                  (service) =>
                    service.title.length > 0 &&
                    service.desc.length > 0
                );

              setServices(dynamicServices);
            } else {
              setServices([]);
            }
          } else {
            setServices([]);
          }
        } catch (serviceErr) {
          console.error("Error fetching services:", serviceErr);
          setServices([]);
        }

        // ============================================================
        // PRODUCTS - FIREBASE ONLY
        // ============================================================
        try {
          const fetchedProducts = await fetchAllDynamicProducts();

          if (Array.isArray(fetchedProducts)) {
            setProducts(fetchedProducts);
          } else {
            setProducts([]);
          }
        } catch (productErr) {
          console.error("Error fetching dynamic products:", productErr);
          setProducts([]);
        }
      } catch (err) {
        console.error("Error loading home dynamic data:", err);

        // Keep everything empty if Firebase fails
        setServices([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const featuredProducts = products.slice(0, 3);

  // ============================================================
  // SERVICE ICONS
  // ============================================================
  const serviceIcons = [
    <Microscope size={28} key={1} />,
    <Building2 size={28} key={2} />,
    <Wrench size={28} key={3} />,
    <FlaskConical size={28} key={4} />,
    <Stethoscope size={28} key={5} />,
    <Award size={28} key={6} />,
  ];

  // ============================================================
  // DYNAMIC PHONE
  // ============================================================
  const helplinePhone = (() => {
    const item = contactInfo.find(
      (c) =>
        c?.label?.toLowerCase().includes("phone") ||
        c?.label?.toLowerCase().includes("mobile") ||
        c?.label?.toLowerCase().includes("helpline") ||
        c?.label?.toLowerCase().includes("contact")
    );

    if (!item) return "";

    if (Array.isArray(item.value)) {
      return item.value[0] || "";
    }

    return typeof item.value === "string"
      ? item.value.trim()
      : "";
  })();

  // ============================================================
  // DYNAMIC EMAIL
  // ============================================================
  const supportEmail = (() => {
    const item = contactInfo.find(
      (c) =>
        c?.label?.toLowerCase().includes("email") ||
        c?.label?.toLowerCase().includes("mail")
    );

    if (!item) return "";

    if (Array.isArray(item.value)) {
      return item.value[0] || "";
    }

    return typeof item.value === "string"
      ? item.value.trim()
      : "";
  })();

  return (
    <div className="bg-[#f8fafc] text-[#0f172a]">

      {/* ============================================================
          DYNAMIC HERO BANNER & CAROUSEL
      ============================================================ */}
      <HeroCarousel
        homeData={homeData}
        locationTitle={locationTitle}
        makeLink={makeLink}
        loading={loading}
      />

      {/* ============================================================
          STATS TICKER
      ============================================================ */}
      <section className="bg-gradient-to-r from-[#042f2e] via-[#0f172a] to-[#042f2e] py-10 text-white shadow-inner">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((item, idx) => {
              const Icon = item.icon;

              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    <Icon size={26} />
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {item.number}
                    </h3>

                    <p className="text-xs sm:text-sm font-bold text-teal-200">
                      {item.title}
                    </p>

                    <p className="text-[11px] text-slate-300 hidden sm:block">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          PILLARS / WHY CHOOSE US
      ============================================================ */}
      <section className="section-padding bg-gradient-to-b from-white via-[#f0fdf9] to-slate-50">
        <div className="container-custom">
          <SectionTitle
            badge="Why Modern Labs Choose Us"
            title="Fresh Thinking for Better Labs"
            description="Fresh, airy product discovery with clear pathways from equipment to support."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;

              return (
                <div
                  key={index}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#0d9488]/40 hover:shadow-2xl hover:shadow-teal-900/10"
                >
                  <div>
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f8f3] to-[#ccfbf1] text-[#0d9488] transition-all duration-300 group-hover:from-[#0d9488] group-hover:to-[#0f766e] group-hover:text-white group-hover:scale-110 shadow-sm group-hover:shadow-lg group-hover:shadow-[#0d9488]/30">
                      <Icon size={28} />
                    </div>

                    <span className="mb-3 inline-block rounded-full bg-[#e6f8f3] border border-[#ccfbf1] px-3 py-1 text-xs font-bold text-[#0f766e]">
                      {pillar.badge}
                    </span>

                    <h3 className="mb-3 text-xl font-bold text-[#0f172a] group-hover:text-[#0d9488] transition-colors">
                      {pillar.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-slate-600">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-[#0d9488]">
                    <span>Learn standard</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED PRODUCTS SHOWCASE
      ============================================================ */}
      <section className="section-padding bg-white border-y border-slate-200">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <SectionTitle
              badge="Diagnostic Inventory"
              title="Featured Laboratory Equipment"
              description="Explore our certified high-performance automated clinical analyzers, PCR units, and diagnostic systems."
            />

            <Link
              href={makeLink("/items")}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#e6f8f3] border border-[#ccfbf1] px-6 py-3.5 text-sm font-bold text-[#0d9488] shadow-sm transition-all hover:bg-[#0d9488] hover:!text-white hover:border-[#0d9488] shrink-0"
            >
              <span>View All Equipment</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {loading && featuredProducts.length === 0 ? (
              [...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm animate-pulse"
                >
                  <div className="h-52 w-full rounded-2xl bg-gradient-to-br from-[#e6f8f3] to-[#ccfbf1] mb-5" />

                  <div className="h-4 w-1/3 bg-slate-200 rounded-md mb-3" />

                  <div className="h-6 w-3/4 bg-slate-200 rounded-md mb-4" />

                  <div className="h-20 w-full bg-[#f0fdf9] rounded-xl mb-4" />

                  <div className="h-12 w-full bg-slate-200 rounded-xl" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((prod) => (
                <ProductCard
                  key={prod.id || prod.slug}
                  product={prod}
                  makeLink={makeLink}
                />
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3">
                <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6f8f3] text-[#0d9488]">
                    <Microscope size={30} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    No Instruments Available
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Our equipment catalog is currently being updated.
                  </p>

                  <Link
                    href={makeLink("/contact")}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0d9488] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#0f766e]"
                  >
                    Contact Our Team
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          SERVICES MATRIX - FIREBASE DYNAMIC ONLY
      ============================================================ */}
      <section className="section-padding bg-gradient-to-b from-[#f0fdf9] via-white to-slate-50">
        <div className="container-custom">

          <SectionTitle
            badge="Healthcare Solutions"
            title="Support Built Around Your Workflow"
            description="From NABL-certified calibration to 2-hour emergency repair response, our certified engineers support your clinical operations round the clock."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {/* ======================================================
                LOADING SKELETON
            ====================================================== */}
            {loading && services.length === 0 ? (
              [...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm animate-pulse"
                >
                  <div className="h-12 w-12 rounded-2xl bg-[#e6f8f3] mb-5" />

                  <div className="h-6 w-3/4 bg-slate-200 rounded-md mb-3" />

                  <div className="h-16 w-full bg-[#f0fdf9] rounded-xl mb-4" />

                  <div className="h-4 w-1/2 bg-slate-200 rounded-md" />
                </div>
              ))
            ) : services.length > 0 ? (

              /* ====================================================
                 FIREBASE SERVICES
                 ONLY TITLE + DESCRIPTION
              ==================================================== */
              services.map((srv, idx) => (
                <ServiceCard
                  key={srv.id || idx}
                  icon={serviceIcons[idx % serviceIcons.length]}
                  title={srv.title}
                  description={srv.desc}
                  makeLink={makeLink}
                />
              ))

            ) : (

              /* ====================================================
                 NO SERVICES CARD
              ==================================================== */
              <div className="md:col-span-2 lg:col-span-3">
                <div className="rounded-[28px] border border-slate-200 bg-white p-10 sm:p-12 text-center shadow-sm">

                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6f8f3] text-[#0d9488]">
                    <Wrench size={30} />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    No Services Available
                  </h3>

                  <p className="mx-auto mt-2 max-w-lg text-sm sm:text-base text-slate-500 leading-relaxed">
                    Our services are currently being updated.
                    Please contact our team for more information.
                  </p>

                  <Link
                    href={makeLink("/contact")}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d9488] px-6 py-3 text-sm font-bold !text-white transition-all hover:bg-[#0f766e] hover:-translate-y-0.5 shadow-sm"
                  >
                    Contact Our Team
                    <ArrowRight size={16} />
                  </Link>

                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ============================================================
          ISO & QUALITY CERTIFICATION BANNER
      ============================================================ */}
      <section className="section-padding bg-[#042f2e] text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-500/40 px-4 py-1.5 text-xs font-bold text-teal-300 uppercase tracking-wider">
                <Award size={16} />
                Quality Assurance & Compliance
              </span>

              <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Uncompromised Clinical Accuracy & Regulatory Standards
              </h2>

              <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed">
                Raj Biosis strictly adheres to international quality protocols.
                Every equipment installation comes with complete IQ/OQ/PQ
                validation documentation and certified calibration reports.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={20} className="text-teal-400" />
                    ISO 13485 & CE Compliance
                  </h4>

                  <p className="mt-2 text-xs text-slate-300">
                    Certified medical device quality management system for
                    diagnostic analyzers.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock size={20} className="text-teal-400" />
                    2-Hour SLA Maintenance
                  </h4>

                  <p className="mt-2 text-xs text-slate-300">
                    Dedicated engineer dispatch team ready for emergency
                    hospital repairs.
                  </p>
                </div>

              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-md text-center">

                <div className="mx-auto flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-full bg-gradient-to-br from-teal-400 via-[#0d9488] to-teal-800 text-white shadow-2xl shadow-teal-900/50 border-2 border-teal-300/40 p-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                    100%
                  </span>

                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-teal-100 mt-1">
                    Certified
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-bold text-white">
                  Compliance Guarantee
                </h3>

                <p className="mt-3 text-sm text-slate-200 leading-relaxed">
                  All instruments tested with traceable reference standards
                  before dispatch to your medical facility.
                </p>

                <Link
                  href={makeLink("/contact")}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0d9488] !text-white px-8 py-3.5 text-sm font-bold shadow-xl shadow-teal-950/40 transition-all hover:bg-[#0f766e] hover:shadow-2xl hover:-translate-y-0.5 border border-teal-300/30"
                >
                  <span className="!text-white font-bold">
                    Request Inspection Certificate
                  </span>

                  <ArrowRight size={16} className="!text-white" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS
      ============================================================ */}
      <section className="section-padding bg-gradient-to-b from-white via-[#f0fdf9] to-slate-50">
        <div className="container-custom">

          <SectionTitle
            badge="What Our Partners Say"
            title="Chosen by Diagnostic Teams"
            description="Read how healthcare professionals rely on Raj Biosis for accurate diagnostics and uninterrupted equipment uptime."
            center
          />

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[#0d9488]/30"
              >
                <div>
                  <div className="flex gap-1 text-[#0d9488] mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f8f3] text-[#0d9488] font-bold text-lg">
                    {t.author.charAt(4) || "D"}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[#0f172a]">
                      {t.author}
                    </h4>

                    <p className="text-xs text-slate-500">
                      {t.role} —{" "}
                      <span className="text-[#0d9488] font-semibold">
                        {t.institution}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================
          QUICK INQUIRY FORM
      ============================================================ */}
      <section className="section-padding bg-gradient-to-br from-[#f0fdf9] via-white to-slate-50 border-t border-slate-200">
        <div className="container-custom">

          <div className="grid lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-5">
              <SectionTitle
                badge="Direct Consultation"
                title="Planning a Purchase or Need Technical Guidance?"
                description="Our biomedical engineering consultants will analyze your laboratory requirements, recommend optimal instruments, and provide a customized quote."
              />

              <div className="mt-8 space-y-4">

                {helplinePhone && (
                  <a
                    href={`tel:${String(helplinePhone).replace(/\s+/g, "")}`}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#0d9488]/40 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f8f3] text-[#0d9488] shrink-0">
                      <PhoneCall size={22} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-500">
                        Direct Helpline
                      </p>

                      <p className="text-base font-bold text-[#0f172a]">
                        {helplinePhone}
                      </p>
                    </div>
                  </a>
                )}

                {supportEmail && (
                  <a
                    href={`mailto:${supportEmail}`}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#0d9488]/40 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f8f3] text-[#0d9488] shrink-0">
                      <Mail size={22} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-500">
                        Official Email
                      </p>

                      <p className="text-base font-bold text-[#0f172a] break-all">
                        {supportEmail}
                      </p>
                    </div>
                  </a>
                )}

              </div>
            </div>

            <div className="lg:col-span-7">
              <ContactForm
                title="Request a Tailored Equipment Plan"
                subtitle="Fill out the form below and our equipment specialist will reach out within 2 hours."
              />
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}