"use client";
import { useEffect, useRef } from "react";

export default function DemonMascot({ size = 160 }: { size?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Continuous eye colour cycle
    const leftEye = svg.querySelector("#left-eye") as SVGCircleElement;
    const rightEye = svg.querySelector("#right-eye") as SVGCircleElement;

    let phase = 0;
    const raf = setInterval(() => {
      phase += 0.025;
      const r = Math.round(150 + 105 * Math.sin(phase));
      const g = Math.round(30 + 20 * Math.sin(phase + 1));
      const b = Math.round(200 + 55 * Math.sin(phase + 2));
      const color = `rgb(${r},${g},${b})`;
      if (leftEye) leftEye.setAttribute("fill", color);
      if (rightEye) rightEye.setAttribute("fill", color);
    }, 40);

    return () => clearInterval(raf);
  }, []);

  const s = size;
  const cx = s / 2;

  return (
    <svg
      ref={svgRef}
      width={s}
      height={s * 1.25}
      viewBox="0 0 200 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="demon-float"
      aria-label="Vnus AI demon mascot"
    >
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FF5A4A" />
          <stop offset="60%" stopColor="#E02A1E" />
          <stop offset="100%" stopColor="#8B1010" />
        </radialGradient>
        <radialGradient id="bellyGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF8070" />
          <stop offset="100%" stopColor="#FF4535" />
        </radialGradient>
        <radialGradient id="wingGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#CC2A1A" />
          <stop offset="100%" stopColor="#550808" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hornGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── WINGS (behind body) ── */}
      <g className="wing-left" style={{ transformOrigin: "80px 130px", animation: "wingBeat 2.8s ease-in-out infinite" }}>
        <path
          d="M80 130 C50 110, 15 95, 10 70 C8 55, 25 50, 45 60 C30 75, 35 90, 55 100 C40 80, 42 60, 65 68 C55 85, 65 105, 80 118 Z"
          fill="url(#wingGrad)"
          opacity="0.9"
        />
        {/* Wing ribs */}
        <path d="M80 130 C60 115, 20 90, 12 68" stroke="#FF3B30" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
        <path d="M78 125 C55 108, 30 82, 40 62" stroke="#FF3B30" strokeWidth="0.6" strokeOpacity="0.3" fill="none" />
      </g>

      <g className="wing-right" style={{ transformOrigin: "120px 130px", animation: "wingBeat 2.8s ease-in-out infinite reverse" }}>
        <path
          d="M120 130 C150 110, 185 95, 190 70 C192 55, 175 50, 155 60 C170 75, 165 90, 145 100 C160 80, 158 60, 135 68 C145 85, 135 105, 120 118 Z"
          fill="url(#wingGrad)"
          opacity="0.9"
        />
        <path d="M120 130 C140 115, 180 90, 188 68" stroke="#FF3B30" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
        <path d="M122 125 C145 108, 170 82, 160 62" stroke="#FF3B30" strokeWidth="0.6" strokeOpacity="0.3" fill="none" />
      </g>

      {/* ── HORNS ── */}
      <g filter="url(#hornGlow)" style={{ animation: "hornPulse 2s ease-in-out infinite" }}>
        {/* Left horn */}
        <path d="M78 58 C70 45, 62 30, 66 18 C70 28, 74 40, 80 52 Z" fill="#FF3B30" />
        <path d="M78 58 C73 48, 68 35, 70 22" stroke="#FF6B5B" strokeWidth="1.5" fill="none" strokeOpacity="0.6" />
        {/* Right horn */}
        <path d="M122 58 C130 45, 138 30, 134 18 C130 28, 126 40, 120 52 Z" fill="#FF3B30" />
        <path d="M122 58 C127 48, 132 35, 130 22" stroke="#FF6B5B" strokeWidth="1.5" fill="none" strokeOpacity="0.6" />
        {/* Small inner horns */}
        <path d="M88 60 C84 50, 82 40, 85 32 C87 40, 89 50, 92 58 Z" fill="#CC2A1A" />
        <path d="M112 60 C116 50, 118 40, 115 32 C113 40, 111 50, 108 58 Z" fill="#CC2A1A" />
      </g>

      {/* ── MAIN BODY ── */}
      <ellipse cx="100" cy="140" rx="55" ry="62" fill="url(#bodyGrad)" />

      {/* ── BELLY ── */}
      <ellipse cx="100" cy="150" rx="32" ry="38" fill="url(#bellyGrad)" opacity="0.45" />

      {/* ── FACE AREA ── */}
      <ellipse cx="100" cy="118" rx="42" ry="38" fill="url(#bodyGrad)" />

      {/* ── EYES ── */}
      {/* Eye whites */}
      <ellipse cx="84" cy="115" rx="13" ry="14" fill="white" />
      <ellipse cx="116" cy="115" rx="13" ry="14" fill="white" />
      {/* Pupils */}
      <circle id="left-eye" cx="86" cy="116" r="8" fill="#00BFFF" filter="url(#glow)" />
      <circle id="right-eye" cx="118" cy="116" r="8" fill="#00BFFF" filter="url(#glow)" />
      {/* Pupil blacks */}
      <circle cx="87" cy="117" r="4.5" fill="#0a0a0a" />
      <circle cx="119" cy="117" r="4.5" fill="#0a0a0a" />
      {/* Eye shine */}
      <circle cx="83" cy="113" r="2" fill="white" opacity="0.9" />
      <circle cx="115" cy="113" r="2" fill="white" opacity="0.9" />

      {/* ── FROWN / MOUTH ── */}
      <path d="M89 138 Q100 148 111 138" stroke="#6B1010" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Fangs */}
      <path d="M94 140 L91 150 L97 140 Z" fill="white" />
      <path d="M106 140 L103 150 L109 140 Z" fill="white" />

      {/* ── BLUSH MARKS (subtle) ── */}
      <ellipse cx="72" cy="128" rx="9" ry="5" fill="#FF6B5B" opacity="0.3" />
      <ellipse cx="128" cy="128" rx="9" ry="5" fill="#FF6B5B" opacity="0.3" />

      {/* ── ARMS ── */}
      <path d="M47 148 C35 140, 28 150, 32 162 C36 172, 47 168, 52 158" fill="url(#bodyGrad)" stroke="#CC2A1A" strokeWidth="1" />
      {/* Left claws */}
      <path d="M32 162 L24 168 M32 162 L28 174 M32 162 L36 170" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />

      <path d="M153 148 C165 140, 172 150, 168 162 C164 172, 153 168, 148 158" fill="url(#bodyGrad)" stroke="#CC2A1A" strokeWidth="1" />
      {/* Right claws */}
      <path d="M168 162 L176 168 M168 162 L172 174 M168 162 L164 170" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />

      {/* ── LEGS ── */}
      <ellipse cx="82" cy="198" rx="18" ry="10" fill="#CC2A1A" />
      <ellipse cx="118" cy="198" rx="18" ry="10" fill="#CC2A1A" />
      {/* Feet claws */}
      <path d="M66 200 L60 208 M72 202 L68 212 M78 203 L76 213" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />
      <path d="M134 200 L140 208 M128 202 L132 212 M122 203 L124 213" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />

      {/* ── TAIL ── */}
      <g style={{ transformOrigin: "100px 195px", animation: "tailSwing 3s ease-in-out infinite" }}>
        <path
          d="M100 195 C108 205, 120 210, 125 222 C130 234, 120 240, 115 235 C122 232, 124 225, 118 220 C112 215, 100 212, 97 220 C94 228, 102 235, 108 230"
          stroke="#CC2A1A"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Tail tip — arrow/spade shape */}
        <path d="M108 230 C104 236, 98 240, 102 246 C106 252, 114 248, 112 242 C116 246, 122 242, 118 237 Z" fill="#FF3B30" />
      </g>

      {/* ── BODY TEXTURE LINES ── */}
      <path d="M85 170 C100 175, 115 170" stroke="#FF6B5B" strokeWidth="0.8" fill="none" strokeOpacity="0.25" />
      <path d="M80 182 C100 188, 120 182" stroke="#FF6B5B" strokeWidth="0.8" fill="none" strokeOpacity="0.2" />
    </svg>
  );
}