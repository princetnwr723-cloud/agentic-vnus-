"use client";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import AuthModal from "./auth/AuthModal";
import toast from "react-hot-toast";

const navLinks = [
  { label: "Home",         href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Skills",       href: "#skills" },
  { label: "Pricing",      href: "#pricing" },
  { label: "Docs",         href: "#docs" },
];

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [active,       setActive]       = useState("Home");
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalTab,     setModalTab]     = useState<"login" | "signup">("login");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openModal = (tab: "login" | "signup") => {
    setModalTab(tab);
    setModalOpen(true);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out! 👋");
    setDropdownOpen(false);
    window.location.href = "/";
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? "U";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "nav-blur" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                <circle cx="16" cy="16" r="14" fill="#1a0505" stroke="#FF3B30" strokeWidth="1.5"/>
                <path d="M11 11 C10 8,12 6,13 8 C14 6,15 8,14 11Z" fill="#FF3B30"/>
                <path d="M21 11 C20 8,22 6,23 8 C24 6,21 8,22 11Z" fill="#FF3B30"/>
                <circle cx="13" cy="16" r="2.5" fill="#FF3B30"/>
                <circle cx="19" cy="16" r="2.5" fill="#FF3B30"/>
                <circle cx="13" cy="16" r="1.2" fill="#000"/>
                <circle cx="19" cy="16" r="1.2" fill="#000"/>
                <path d="M13 21 Q16 24 19 21" stroke="#6B1010" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight group-hover:text-red-400 transition-colors">
              Vnus AI
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActive(link.label)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  active === link.label
                    ? "nav-active"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#FF3B30]/25 bg-[#FF3B30]/8 hover:bg-[#FF3B30]/15 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FF3B30] flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                  <span className="text-sm text-white font-medium max-w-[100px] truncate">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 overflow-hidden shadow-2xl z-50"
                    style={{ background: "rgba(10,5,5,0.97)" }}
                  >
                    <a
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                      </svg>
                      Dashboard
                    </a>
                    <a
                      href="#pricing"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Upgrade Plan
                    </a>
                    <div className="h-px bg-white/5"/>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => openModal("login")}
                  className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
                >
                  Login
                </button>
                <button
                  onClick={() => openModal("signup")}
                  className="btn-primary px-4 py-2 text-sm font-semibold text-white rounded-lg"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden nav-blur border-t border-white/5 px-6 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => { setActive(link.label); setMenuOpen(false); }}
                className="text-gray-300 hover:text-white py-2 text-sm"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-white/10 my-2"/>
            {user ? (
              <>
                <a href="/dashboard" className="text-gray-300 hover:text-white py-2 text-sm">Dashboard</a>
                <a href="#pricing"   className="text-[#FF3B30] hover:text-red-300 py-2 text-sm font-semibold">⚡ Upgrade Plan</a>
                <button onClick={handleLogout} className="text-red-400 text-sm py-2 text-left">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => openModal("login")}  className="text-gray-300 hover:text-white py-2 text-sm text-left">Login</button>
                <button onClick={() => openModal("signup")} className="btn-primary mt-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg text-center">
                  Get Started — Free
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultTab={modalTab} />
    </>
  );
}