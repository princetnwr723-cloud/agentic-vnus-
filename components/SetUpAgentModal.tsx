"use client";
import { useState } from "react";

interface SetUpAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DOWNLOAD_LINKS = {
  windows: "#", // Will be replaced with actual download link
  mac: "#",
  linux: "#",
};

const SHARE_LINK = "https://vnus.ai/download-agent";

export default function SetUpAgentModal({ isOpen, onClose }: SetUpAgentModalProps) {
  const [tab, setTab] = useState<"download" | "share">("download");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SHARE_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-md z-10">
        {/* Glow */}
        <div className="absolute -inset-1 rounded-2xl opacity-20 blur-xl"
          style={{ background: "linear-gradient(135deg, #FF3B30, #CC1A10)" }} aria-hidden />

        <div className="relative rounded-2xl border border-[#FF3B30]/20 overflow-hidden"
          style={{ background: "rgba(8,4,4,0.98)" }}>

          {/* Top line */}
          <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, #FF3B30, transparent)" }} />

          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div>
                <h2 className="text-white font-bold text-base leading-none">Set Up Agent</h2>
                <p className="text-gray-500 text-xs mt-0.5">Install Vnus Agent on your PC</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4">
            <div className="flex bg-white/5 rounded-xl p-1 gap-1 mb-5">
              {([
                { id: "download", label: "Download Agent", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> },
                { id: "share", label: "Share to Phone", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> },
              ] as const).map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    tab === t.id ? "bg-[#FF3B30] text-white" : "text-gray-400 hover:text-white"
                  }`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {tab === "download" ? (
              <div className="pb-5">
                {/* Steps */}
                <div className="space-y-2 mb-5">
                  {[
                    { n: "1", text: "Download agent for your OS" },
                    { n: "2", text: "Install and grant permissions" },
                    { n: "3", text: "Copy the 10-digit code shown" },
                    { n: "4", text: "Paste it in Add Workspace" },
                  ].map((s) => (
                    <div key={s.n} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#FF3B30]/15 border border-[#FF3B30]/25 flex items-center justify-center text-xs font-bold text-[#FF3B30] shrink-0">
                        {s.n}
                      </div>
                      <p className="text-gray-400 text-sm">{s.text}</p>
                    </div>
                  ))}
                </div>

                {/* Download buttons */}
                <div className="space-y-2.5">
                  <a href={DOWNLOAD_LINKS.windows}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 hover:border-[#FF3B30]/30 transition-all group">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12V6.75l6-1.32V12H3zM3 13h6v6.57L3 18.18V13zM10 5.23L21 3v9h-11V5.23zM10 13h11v9l-11-1.81V13z" fill="#00A4EF"/>
                    </svg>
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm font-semibold">Download for Windows</p>
                      <p className="text-gray-500 text-xs">Windows 10 / 11 · 64-bit</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"
                      className="group-hover:stroke-[#FF3B30] transition-colors">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                  </a>

                  <a href={DOWNLOAD_LINKS.mac}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 hover:border-[#FF3B30]/30 transition-all group">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#999"/>
                    </svg>
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm font-semibold">Download for macOS</p>
                      <p className="text-gray-500 text-xs">macOS 12+ · Apple Silicon & Intel</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"
                      className="group-hover:stroke-[#FF3B30] transition-colors">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                  </a>

                  <a href={DOWNLOAD_LINKS.linux}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 hover:border-[#FF3B30]/30 transition-all group">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="#FCC624"/>
                    </svg>
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm font-semibold">Download for Linux</p>
                      <p className="text-gray-500 text-xs">AppImage · Ubuntu, Debian, Fedora</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round"
                      className="group-hover:stroke-[#FF3B30] transition-colors">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                  </a>
                </div>
              </div>
            ) : (
              /* Share tab */
              <div className="pb-5">
                <p className="text-gray-400 text-sm mb-4 text-center">
                  Scan QR or share link to download agent on another device
                </p>

                {/* QR Code placeholder */}
                <div className="flex justify-center mb-4">
                  <div className="w-44 h-44 rounded-xl border border-white/10 bg-white/4 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                    {/* QR pattern placeholder */}
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                      {/* Corner squares */}
                      <rect x="8" y="8" width="28" height="28" rx="3" stroke="#FF3B30" strokeWidth="3" fill="none"/>
                      <rect x="14" y="14" width="16" height="16" rx="1" fill="#FF3B30"/>
                      <rect x="84" y="8" width="28" height="28" rx="3" stroke="#FF3B30" strokeWidth="3" fill="none"/>
                      <rect x="90" y="14" width="16" height="16" rx="1" fill="#FF3B30"/>
                      <rect x="8" y="84" width="28" height="28" rx="3" stroke="#FF3B30" strokeWidth="3" fill="none"/>
                      <rect x="14" y="90" width="16" height="16" rx="1" fill="#FF3B30"/>
                      {/* QR dots pattern */}
                      {[44,52,60,68,76].map(x => (
                        [8,16,24,32,40,48,56,64,72,80,88,96,104].map(y => (
                          Math.random() > 0.5 && <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1" fill="#FF3B30" opacity="0.6"/>
                        ))
                      ))}
                      {[8,16,24,32,40,48,56,64,72,80,88,96,104].map(y => (
                        [8,16,24,32,40,48,56,64,72,80,88,96,104].map(x => (
                          (x < 40 || x > 76) && (y < 40 || y > 76) ? null :
                          Math.random() > 0.55 && <rect key={`${x}${y}`} x={x} y={y} width="5" height="5" rx="0.5" fill="#FF3B30" opacity={Math.random() * 0.5 + 0.3}/>
                        ))
                      ))}
                      {/* Center demon logo */}
                      <circle cx="60" cy="60" r="12" fill="#050505"/>
                      <circle cx="60" cy="60" r="10" fill="#1a0505" stroke="#FF3B30" strokeWidth="1"/>
                      <path d="M56 56C55 53 57 51 58 53 59 51 60 53 59 56Z" fill="#FF3B30"/>
                      <path d="M64 56C63 53 65 51 66 53 67 51 64 53 65 56Z" fill="#FF3B30"/>
                      <circle cx="58" cy="60" r="2" fill="#FF3B30"/>
                      <circle cx="62" cy="60" r="2" fill="#FF3B30"/>
                    </svg>
                    <p className="text-gray-600 text-xs">Scan to download</p>
                  </div>
                </div>

                {/* Share link */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-400 font-mono truncate">
                    {SHARE_LINK}
                  </div>
                  <button onClick={handleCopy}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      copied ? "bg-green-500/20 text-green-400 border border-green-500/30" : "btn-primary text-white"
                    }`}>
                    {copied ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : "Copy"}
                  </button>
                </div>

                {/* Share options */}
                <div className="flex gap-2 mt-3">
                  {[
                    { label: "WhatsApp", color: "#25D366", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
                    { label: "Telegram", color: "#229ED9", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#229ED9"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
                    { label: "Copy Link", color: "#FF3B30", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> },
                  ].map((s) => (
                    <button key={s.label} onClick={s.label === "Copy Link" ? handleCopy : undefined}
                      className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 transition-all">
                      {s.icon}
                      <span className="text-gray-400 text-xs">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}