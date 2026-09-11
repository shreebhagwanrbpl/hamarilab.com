"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";

import {
  Microscope,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Wrench,
  Activity,
  Award,
  Zap,
  CheckCircle2,
  PhoneCall,
  FileCheck,
  Cpu,
} from "lucide-react";


// ============================================================
// STATIC WORKFLOW DATA
// NOTE:
// Ye services fallback nahi hain.
// Ye sirf workflow/process section ke liye static content hai.
// ============================================================

const workflowSteps = [
  {
    step: "01",
    title: "Diagnostic Audit & Consultation",
    desc: "We analyze your hospital sample load, space constraints, and technical requirements to select the exact analyzer configuration.",
    icon: FileCheck,
  },
  {
    step: "02",
    title: "Precision Solution Engineering",
    desc: "Custom lab layout designs, power backup specifications, and reagent supply schedule formulation.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Installation & NABL Calibration",
    desc: "Certified engineers perform physical installation, IQ/OQ/PQ protocols, and NABL-traceable reference calibration.",
    icon: Award,
  },
  {
    step: "04",
    title: "24/7 SLA Field Maintenance",
    desc: "Round-the-clock technical emergency support, scheduled preventive maintenance visits, and automated reagent restocking.",
    icon: Zap,
  },
];


// ============================================================
// SERVICES PAGE
// ============================================================

export default function ServicesPage() {

  // ==========================================================
  // SERVICES - FIREBASE ONLY
  // ==========================================================

  const [services, setServices] = useState([]);

  const [contactInfo, setContactInfo] = useState([]);

  const [loading, setLoading] = useState(true);


  // ==========================================================
  // DISTRICT ROUTING
  // ==========================================================

  const pathname = usePathname();

  const pathParts = pathname.split("/").filter(Boolean);

  const staticRoutes = [
    "about",
    "services",
    "products",
    "contact",
    "items",
  ];

  const district =
    pathParts.length > 0 &&
      !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";


  // ==========================================================
  // LINK HELPER
  // ==========================================================

  const makeLink = (path) => {

    if (!district) {
      return path;
    }

    if (path === "/") {
      return `/${district}`;
    }

    return `/${district}${path}`;
  };


  // ==========================================================
  // SERVICE ICONS
  // Icons are static visual elements only.
  // Title + Description come from Firebase.
  // ==========================================================

  const icons = [
    <Microscope size={28} key={1} />,
    <FlaskConical size={28} key={2} />,
    <ShieldCheck size={28} key={3} />,
    <Stethoscope size={28} key={4} />,
    <Wrench size={28} key={5} />,
    <Activity size={28} key={6} />,
  ];


  // ==========================================================
  // FETCH SERVICES + CONTACT
  // ==========================================================

  useEffect(() => {

    let isMounted = true;


    const fetchServicesAndContact = async () => {

      try {

        // ====================================================
        // SERVICES
        // ====================================================

        const servicesSnap = await getDoc(
          doc(
            db,
            "websites",
            "hamarilabcom",
            "pages",
            "services"
          )
        );


        if (!isMounted) {
          return;
        }


        // ====================================================
        // FIREBASE SERVICES ONLY
        // ====================================================

        if (servicesSnap.exists()) {

          const firebaseServices =
            servicesSnap.data()?.services;


          if (Array.isArray(firebaseServices)) {

            const dynamicServices =
              firebaseServices
                .map((service, index) => {

                  const title =
                    typeof service?.title === "string"
                      ? service.title.trim()
                      : "";

                  const desc =
                    typeof service?.desc === "string"
                      ? service.desc.trim()
                      : "";

                  return {
                    id:
                      service?.id ||
                      `service-${index}`,

                    title,

                    desc,
                  };

                })
                .filter(
                  (service) =>
                    service.title &&
                    service.desc
                );


            setServices(dynamicServices);

          } else {

            // Firebase document exists,
            // but services array doesn't exist.
            setServices([]);

          }

        } else {

          // Firebase services document doesn't exist.
          setServices([]);

        }


        // ====================================================
        // CONTACT
        // ====================================================

        const contactSnap = await getDoc(
          doc(
            db,
            "websites",
            "hamarilabcom",
            "pages",
            "contact"
          )
        );


        if (!isMounted) {
          return;
        }


        if (contactSnap.exists()) {

          const contactData =
            contactSnap.data()?.contactInfo;

          setContactInfo(
            Array.isArray(contactData)
              ? contactData
              : []
          );

        } else {

          setContactInfo([]);

        }

      } catch (error) {

        console.error(
          "Error loading services/contact data:",
          error
        );


        // ====================================================
        // IMPORTANT:
        // NO STATIC FALLBACK ON ERROR
        // ====================================================

        if (isMounted) {

          setServices([]);

          setContactInfo([]);

        }

      } finally {

        if (isMounted) {
          setLoading(false);
        }

      }

    };


    fetchServicesAndContact();


    return () => {
      isMounted = false;
    };

  }, []);


  // ==========================================================
  // DYNAMIC EMERGENCY PHONE
  // ==========================================================

  const emergencyPhone = (() => {

    const item = contactInfo.find((contact) => {

      const label =
        (contact?.label || "").toLowerCase();


      return (
        label.includes("phone") ||
        label.includes("mobile") ||
        label.includes("helpline") ||
        label.includes("emergency") ||
        label.includes("tel") ||
        label.includes("contact")
      );

    });


    if (!item) {
      return "";
    }


    if (Array.isArray(item.value)) {
      return item.value[0] || "";
    }


    return typeof item.value === "string"
      ? item.value.trim()
      : "";

  })();


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="bg-[#f8fafc] text-[#0f172a]">


      {/* ======================================================
          PAGE BANNER
      ====================================================== */}

      <PageBanner
        badge="Technical Services"
        title="Biomedical Support From Setup to Service"
        subtitle="NABL-certified calibration, 2-hour emergency repair SLAs, cold-chain reagent distribution, and turnkey pathology setup."
      />


      {/* ======================================================
          SERVICES GRID
      ====================================================== */}

      <section className="section-padding bg-gradient-to-b from-white via-[#f0fdf9] to-slate-50">

        <div className="container-custom">

          <SectionTitle
            badge="Full Service Catalog"
            title="Designed Around Reliable Operations"
            description="Explore our specialized services designed to keep clinical laboratories and hospital departments operating at peak accuracy."
            center
          />


          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">


            {/* =================================================
                LOADING SKELETON
            ================================================= */}

            {loading ? (

              [...Array(6)].map((_, index) => (

                <div
                  key={index}
                  className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm animate-pulse"
                >

                  <div className="h-14 w-14 rounded-2xl bg-[#e6f8f3] mb-6" />

                  <div className="h-6 w-3/4 bg-slate-200 rounded-md mb-3" />

                  <div className="h-20 w-full bg-[#f0fdf9] rounded-xl mb-6" />

                  <div className="h-4 w-1/2 bg-slate-200 rounded-md" />

                </div>

              ))

            ) : services.length > 0 ? (

              /* =================================================
                 DYNAMIC FIREBASE SERVICE CARDS
              ================================================= */

              services.map((service, index) => (

                <ServiceCard
                  key={service.id || index}
                  icon={
                    icons[
                    index % icons.length
                    ]
                  }
                  title={service.title}
                  description={service.desc}
                />

              ))

            ) : (

              /* =================================================
                 NO SERVICE CARD
              ================================================= */

              <div className="col-span-full flex justify-center py-8">

                <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6f8f3] text-[#0d9488]">

                    <Wrench size={30} />

                  </div>


                  <h3 className="mt-5 text-2xl font-bold text-[#0f172a]">
                    No Services Available
                  </h3>


                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Service information is currently unavailable.
                    Please check back later or contact our team for assistance.
                  </p>


                  <Link
                    href={makeLink("/contact")}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0d9488] px-6 py-3.5 text-sm font-bold !text-white shadow-lg shadow-teal-900/10 transition-all hover:bg-[#0f766e] hover:-translate-y-0.5"
                  >

                    <PhoneCall size={16} />

                    Contact Our Team

                  </Link>

                </div>

              </div>

            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          WORKFLOW PROCESS
      ====================================================== */}

      <section className="section-padding bg-white border-y border-slate-200">

        <div className="container-custom">

          <SectionTitle
            badge="Execution Framework"
            title="Our 4-Step Engineering Workflow"
            description="A systematic process ensuring seamless integration, rapid compliance, and long-term instrument reliability."
            center
          />


          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            {workflowSteps.map((step, index) => {

              const Icon = step.icon;


              return (

                <div
                  key={index}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-[#f0fdf9] p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#0d9488] hover:shadow-xl"
                >

                  <div>

                    <div className="flex items-center justify-between">

                      <span className="text-4xl font-black text-[#0d9488]/30 group-hover:text-[#0d9488] transition-colors">
                        {step.step}
                      </span>


                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0d9488] shadow-sm">

                        <Icon size={24} />

                      </div>

                    </div>


                    <h3 className="mt-6 text-xl font-bold text-[#0f172a] group-hover:text-[#0d9488] transition-colors">
                      {step.title}
                    </h3>


                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {step.desc}
                    </p>

                  </div>


                  <div className="mt-6 pt-4 border-t border-slate-200/60">

                    <span className="text-xs font-bold text-[#0f766e]">
                      Phase {index + 1} Milestone
                    </span>

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      </section>


      {/* ======================================================
          BREAKDOWN SLA
      ====================================================== */}

      <section className="section-padding bg-gradient-to-b from-[#f0fdf9] via-white to-slate-50">

        <div className="container-custom">

          <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-r from-[#042f2e] to-[#0f172a] p-8 sm:p-12 text-white shadow-xl">

            <div className="grid lg:grid-cols-12 gap-8 items-center">


              <div className="lg:col-span-8">

                <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-500/40 px-4 py-1.5 text-xs font-bold text-teal-300 uppercase tracking-wider">

                  <Zap size={14} />

                  Emergency Breakdown Helpline

                </span>


                <h3 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                  Facing an Equipment Emergency in ICU or Lab?
                </h3>


                <p className="mt-3 text-base text-slate-200 leading-relaxed">
                  Our certified field engineers are equipped with OEM diagnostic kits and genuine spare parts for instant on-site restoration.
                </p>


                <div className="mt-6 flex flex-wrap items-center gap-6 text-sm font-semibold text-white">


                  <div className="flex items-center gap-2">

                    <CheckCircle2
                      size={18}
                      className="text-teal-400"
                    />

                    <span>
                      2-Hour On-Site SLA
                    </span>

                  </div>


                  <div className="flex items-center gap-2">

                    <CheckCircle2
                      size={18}
                      className="text-teal-400"
                    />

                    <span>
                      Loaner Analyzer Option
                    </span>

                  </div>


                  <div className="flex items-center gap-2">

                    <CheckCircle2
                      size={18}
                      className="text-teal-400"
                    />

                    <span>
                      NABL Re-calibration Included
                    </span>

                  </div>

                </div>

              </div>


              <div className="lg:col-span-4 flex flex-col items-center justify-center text-center border-t lg:border-t-0 lg:border-l border-white/20 pt-6 lg:pt-0 lg:pl-8">

                <p className="text-xs font-bold uppercase tracking-wider text-teal-200">
                  Emergency Dispatch
                </p>


                {emergencyPhone ? (

                  <a
                    href={`tel:${emergencyPhone.replace(/\s+/g, "")}`}
                    className="mt-2 text-2xl font-black text-white hover:text-teal-300 transition-colors inline-block"
                  >
                    {emergencyPhone}
                  </a>

                ) : (

                  <p className="mt-2 text-sm text-slate-200">
                    24/7 Field Dispatch Active
                  </p>

                )}


                <Link
                  href={makeLink("/contact")}
                  className="mt-5 w-full rounded-2xl bg-[#0d9488] py-3.5 text-center text-sm font-bold text-white shadow-lg transition-all hover:bg-[#0f766e]"
                >
                  Book Priority Repair
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>

  );
}