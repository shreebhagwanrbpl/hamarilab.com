"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const staticRoutes = [
    "about",
    "services",
    "items",
    "contact",
  ];

  const district =
    pathParts.length > 0 &&
      !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  const makeLink = (path) => {
    if (!district) return path;

    if (path === "/") {
      return `/${district}`;
    }

    return `/${district}${path}`;
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Products", path: "/items" },
    { name: "Contact", path: "/contact" },
  ];

  return (
 <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-sm">

  <div className="container-custom flex h-20 items-center justify-between">

    {/* Logo */}

    <Link href={makeLink("/")} className="relative block h-16 w-48 shrink-0 transition-transform hover:scale-105">

      <Image
        src="/logo.png"
        alt="Raj Biosis Private Limited"
        fill
        className="object-contain object-left"
        priority
      />

    </Link>

    {/* Desktop Menu */}

    <nav className="hidden items-center gap-8 lg:flex">

      {navLinks.map((link) => (

        <Link
          key={link.name}
          href={makeLink(link.path)}
          className="relative font-semibold text-slate-700 transition-all duration-300 hover:text-[#0d9488] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#0d9488] after:transition-all after:duration-300 hover:after:w-full"
        >
          {link.name}
        </Link>

      ))}

    </nav>

    {/* Desktop Button */}

    <div className="hidden lg:block">

      <Link href={makeLink("/contact")}>

        <button className="rounded-xl bg-[#0d9488] px-6 py-3 font-bold text-white shadow-md shadow-[#0d9488]/20 transition-all duration-300 hover:bg-[#0f766e] hover:shadow-xl hover:shadow-[#0d9488]/30">

          Get Quote

        </button>

      </Link>

    </div>

    {/* Mobile Button */}

    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="rounded-xl border border-slate-200 bg-[#f0fdf9] p-2 transition-all duration-300 hover:bg-[#e6f8f3] lg:hidden"
    >

      {menuOpen ? (
        <X
          size={26}
          className="text-[#0d9488]"
        />
      ) : (
        <Menu
          size={26}
          className="text-[#0d9488]"
        />
      )}

    </button>

  </div>

  {/* Mobile Menu */}

  <div
    className={`overflow-hidden transition-all duration-300 lg:hidden ${
      menuOpen ? "max-h-[500px]" : "max-h-0"
    }`}
  >

    <div className="border-t border-slate-200 bg-white px-6 py-6">

      <nav className="flex flex-col gap-5">

        {navLinks.map((link) => (

          <Link
            key={link.name}
            href={makeLink(link.path)}
            onClick={() => setMenuOpen(false)}
            className="font-semibold text-slate-700 transition-all duration-300 hover:translate-x-1 hover:text-[#0d9488]"
          >

            {link.name}

          </Link>

        ))}

        <Link
          href={makeLink("/contact")}
          onClick={() => setMenuOpen(false)}
        >

          <button className="mt-2 w-full rounded-xl bg-[#0d9488] py-3 font-bold text-white transition-all duration-300 hover:bg-[#0f766e]">

            Get Quote

          </button>

        </Link>

      </nav>

    </div>

  </div>

</header>
  );
}