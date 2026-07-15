export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-10">
      <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col md:flex-row items-start justify-between gap-10">

        {/* Brand */}
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-3">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
              <circle cx="16" cy="16" r="14" fill="#1a0505" stroke="#FF3B30" strokeWidth="1.5" />
              <path d="M11 11 C10 8, 12 6, 13 8 C14 6, 15 8, 14 11 Z" fill="#FF3B30" />
              <path d="M21 11 C20 8, 22 6, 23 8 C24 6, 21 8, 22 11 Z" fill="#FF3B30" />
              <circle cx="13" cy="16" r="2.5" fill="#00BFFF" />
              <circle cx="19" cy="16" r="2.5" fill="#00BFFF" />
              <path d="M13 21 Q16 24 19 21" stroke="#6B1010" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
            <span className="text-white font-bold text-base">Vnus AI</span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            The agentic AI that actually does things. Built for people who are tired of doing
            things themselves.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="text-white font-semibold mb-3">Product</p>
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Skills",       href: "#skills" },
              { label: "Pricing",      href: "#pricing" },
              { label: "Changelog",    href: "#" },
              { label: "Roadmap",      href: "#" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="block text-gray-500 hover:text-white mb-2 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div>
            <p className="text-white font-semibold mb-3">Developers</p>
            {["Documentation", "API Reference", "GitHub", "SDK"].map((l) => (
              <a key={l} href="#" className="block text-gray-500 hover:text-white mb-2 transition-colors">{l}</a>
            ))}
          </div>

          <div>
            <p className="text-white font-semibold mb-3">Community</p>
            {["Discord", "Twitter / X", "Blog", "Support"].map((l) => (
              <a key={l} href="#" className="block text-gray-500 hover:text-white mb-2 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-gray-600 text-xs">© 2026 Vnus AI. All rights reserved.</p>
        <div className="flex items-center gap-5">
          {["Privacy", "Terms", "Security"].map((l) => (
            <a key={l} href="#" className="text-gray-600 hover:text-gray-300 text-xs transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}