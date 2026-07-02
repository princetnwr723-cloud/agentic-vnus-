"use client";
import { useEffect, useRef } from "react";

export default function DemonMascot({ size = 160 }: { size?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let ph = 0;
    const interval = setInterval(() => {
      ph += 0.04;
      const intensity = 0.5 + 0.5 * Math.sin(ph);
      const r = Math.round(180 + 75 * intensity);
      const g = Math.round(intensity * 30);
      const b = 0;
      const c = `rgb(${r},${g},${b})`;
      const le = svgRef.current?.querySelector("#left-eye") as SVGEllipseElement;
      const re = svgRef.current?.querySelector("#right-eye") as SVGEllipseElement;
      if (le) le.setAttribute("fill", c);
      if (re) re.setAttribute("fill", c);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size * 1.25}
      viewBox="0 0 200 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="demon-float"
      aria-label="Vnus AI demon mascot"
    >
      <defs>
        <radialGradient id="bodyG" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1a1a1a"/>
          <stop offset="55%" stopColor="#0d0d0d"/>
          <stop offset="85%" stopColor="#220000"/>
          <stop offset="100%" stopColor="#550000"/>
        </radialGradient>
        <radialGradient id="faceG" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#222222"/>
          <stop offset="60%" stopColor="#111111"/>
          <stop offset="100%" stopColor="#330000"/>
        </radialGradient>
        <radialGradient id="wingG" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1a0000"/>
          <stop offset="100%" stopColor="#050000"/>
        </radialGradient>
        <radialGradient id="bellyG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2a0000"/>
          <stop offset="100%" stopColor="#110000"/>
        </radialGradient>
        <radialGradient id="eyeGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FF4400"/>
          <stop offset="50%" stopColor="#CC0000"/>
          <stop offset="100%" stopColor="#660000"/>
        </radialGradient>
        <linearGradient id="hornG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF2200"/>
          <stop offset="100%" stopColor="#880000"/>
        </linearGradient>
      </defs>

      {/* ── WINGS ── */}
      <g style={{ transformOrigin: "82px 128px", animation: "wingBeat 2.6s ease-in-out infinite" }}>
        <path d="M80 128 C52 108,18 92,10 66 C7 50,24 46,44 57 C30 72,34 88,54 98 C38 78,40 57,63 65 C54 82,63 104,80 116Z" fill="url(#wingG)"/>
        <path d="M78 126 C56 110,22 86,13 64" stroke="#990000" strokeWidth="0.8" fill="none" opacity="0.7"/>
        <path d="M76 120 C54 104,34 78,42 58" stroke="#770000" strokeWidth="0.6" fill="none" opacity="0.5"/>
        <path d="M80 128 C52 108,18 92,10 66 C7 50,24 46,44 57" stroke="#CC0000" strokeWidth="1.2" fill="none" opacity="0.5"/>
      </g>
      <g style={{ transformOrigin: "118px 128px", animation: "wingBeat 2.6s ease-in-out infinite reverse" }}>
        <path d="M120 128 C148 108,182 92,190 66 C193 50,176 46,156 57 C170 72,166 88,146 98 C162 78,160 57,137 65 C146 82,137 104,120 116Z" fill="url(#wingG)"/>
        <path d="M122 126 C144 110,178 86,187 64" stroke="#990000" strokeWidth="0.8" fill="none" opacity="0.7"/>
        <path d="M124 120 C146 104,166 78,158 58" stroke="#770000" strokeWidth="0.6" fill="none" opacity="0.5"/>
        <path d="M120 128 C148 108,182 92,190 66 C193 50,176 46,156 57" stroke="#CC0000" strokeWidth="1.2" fill="none" opacity="0.5"/>
      </g>

      {/* ── HORNS ── */}
      <g style={{ animation: "hornGlow 2s ease-in-out infinite" }}>
        <path d="M76 58 C68 44,60 28,64 14 C68 26,72 42,78 54Z" fill="url(#hornG)"/>
        <path d="M76 58 C71 46,66 32,68 18" stroke="#FF4400" strokeWidth="1.2" fill="none" opacity="0.5"/>
        <path d="M124 58 C132 44,140 28,136 14 C132 26,128 42,122 54Z" fill="url(#hornG)"/>
        <path d="M124 58 C129 46,134 32,132 18" stroke="#FF4400" strokeWidth="1.2" fill="none" opacity="0.5"/>
        <path d="M87 60 C83 49,80 38,84 28 C86 38,88 50,91 58Z" fill="#AA1100"/>
        <path d="M113 60 C117 49,120 38,116 28 C114 38,112 50,109 58Z" fill="#AA1100"/>
      </g>

      {/* ── BODY ── */}
      <ellipse cx="100" cy="142" rx="57" ry="64" fill="#440000" opacity="0.8"/>
      <ellipse cx="100" cy="140" rx="54" ry="61" fill="url(#bodyG)"/>
      <ellipse cx="100" cy="152" rx="30" ry="36" fill="url(#bellyG)" opacity="0.6"/>

      {/* ── FACE ── */}
      <ellipse cx="100" cy="117" rx="44" ry="40" fill="#330000" opacity="0.7"/>
      <ellipse cx="100" cy="116" rx="42" ry="38" fill="url(#faceG)"/>

      {/* ── ANGRY BROWS ── */}
      <path d="M68 100 C78 92,88 96,100 94 C112 96,122 92,132 100" stroke="#000000" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.9"/>
      <path d="M70 103 C78 97,88 100,96 103" stroke="#CC0000" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M70 103 C78 97,88 100,96 103" stroke="#FF2200" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M130 103 C122 97,112 100,104 103" stroke="#CC0000" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M130 103 C122 97,112 100,104 103" stroke="#FF2200" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M94 103 L100 108 L106 103" stroke="#440000" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* ── EYES ── */}
      <g style={{ animation: "eyeAngry 1.8s ease-in-out infinite" }}>
        <ellipse cx="83" cy="116" rx="15" ry="13" fill="#000000" opacity="0.8"/>
        <ellipse cx="117" cy="116" rx="15" ry="13" fill="#000000" opacity="0.8"/>
        <ellipse cx="83" cy="116" rx="13" ry="11" fill="#0a0000"/>
        <ellipse id="left-eye" cx="83" cy="116" rx="10" ry="8" fill="url(#eyeGrad)"/>
        <ellipse cx="83" cy="116" rx="3" ry="7" fill="#000000"/>
        <ellipse cx="80" cy="113" rx="1.5" ry="1" fill="#FF6644" opacity="0.8"/>
        <ellipse cx="117" cy="116" rx="13" ry="11" fill="#0a0000"/>
        <ellipse id="right-eye" cx="117" cy="116" rx="10" ry="8" fill="url(#eyeGrad)"/>
        <ellipse cx="117" cy="116" rx="3" ry="7" fill="#000000"/>
        <ellipse cx="114" cy="113" rx="1.5" ry="1" fill="#FF6644" opacity="0.8"/>
        <ellipse cx="83" cy="116" rx="13" ry="11" fill="none" stroke="#CC0000" strokeWidth="1" opacity="0.6"/>
        <ellipse cx="117" cy="116" rx="13" ry="11" fill="none" stroke="#CC0000" strokeWidth="1" opacity="0.6"/>
      </g>

      {/* ── NOSE ── */}
      <path d="M97 128 L100 133 L103 128" stroke="#550000" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="97" cy="129" r="1.5" fill="#220000"/>
      <circle cx="103" cy="129" r="1.5" fill="#220000"/>

      {/* ── SNARL MOUTH ── */}
      <path d="M82 138 C88 134,94 135,100 133 C106 135,112 134,118 138" stroke="#110000" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M80 140 C88 148,112 148,120 140" fill="#110000"/>
      <path d="M82 141 L79 152 L85 141Z" fill="#DDDDDD"/>
      <path d="M88 142 L87 153 L93 142Z" fill="#CCCCCC"/>
      <path d="M95 141 L92 156 L98 141Z" fill="#EEEEEE"/>
      <path d="M105 141 L102 156 L108 141Z" fill="#EEEEEE"/>
      <path d="M112 142 L107 153 L113 142Z" fill="#CCCCCC"/>
      <path d="M118 141 L115 152 L121 141Z" fill="#DDDDDD"/>
      <path d="M80 140 C88 150,112 150,120 140" stroke="#330000" strokeWidth="1.5" fill="none"/>
      <ellipse cx="100" cy="156" rx="1.5" ry="3" fill="#220011" opacity="0.6"/>

      {/* ── SCAR MARKINGS ── */}
      <path d="M68 125 L62 118 M66 130 L60 126" stroke="#AA0000" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      <path d="M132 125 L138 118 M134 130 L140 126" stroke="#AA0000" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>

      {/* ── BODY RIM GLOW ── */}
      <ellipse cx="100" cy="140" rx="54" ry="61" fill="none" stroke="#660000" strokeWidth="2" opacity="0.5"/>
      <ellipse cx="100" cy="140" rx="52" ry="59" fill="none" stroke="#440000" strokeWidth="1" opacity="0.3"/>

      {/* ── LEFT ARM ── */}
      <g style={{ transformOrigin: "50px 150px", animation: "armSwingL 2.2s ease-in-out infinite" }}>
        <path d="M50 150 C36 142,26 152,30 165 C34 176,48 172,53 160" fill="url(#bodyG)" stroke="#440000" strokeWidth="1.5"/>
        <circle cx="36" cy="155" r="5" fill="#1a0000" stroke="#550000" strokeWidth="1"/>
        <path d="M30 165 L20 172" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M30 165 L24 178" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M30 165 L34 176" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M20 172 L17 175" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M24 178 L22 182" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M34 176 L34 180" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* ── RIGHT ARM ── */}
      <g style={{ transformOrigin: "150px 150px", animation: "armSwingR 2.2s ease-in-out infinite 0.1s" }}>
        <path d="M150 150 C164 142,174 152,170 165 C166 176,152 172,147 160" fill="url(#bodyG)" stroke="#440000" strokeWidth="1.5"/>
        <circle cx="164" cy="155" r="5" fill="#1a0000" stroke="#550000" strokeWidth="1"/>
        <path d="M170 165 L180 172" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M170 165 L176 178" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M170 165 L166 176" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M180 172 L183 175" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M176 178 L178 182" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M166 176 L166 180" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* ── LEGS ── */}
      <ellipse cx="82" cy="200" rx="18" ry="10" fill="#1a0000" stroke="#440000" strokeWidth="1"/>
      <ellipse cx="118" cy="200" rx="18" ry="10" fill="#1a0000" stroke="#440000" strokeWidth="1"/>
      <path d="M66 202 L60 210 M72 204 L68 214 M78 205 L76 215" stroke="#AA0000" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M134 202 L140 210 M128 204 L132 214 M122 205 L124 215" stroke="#AA0000" strokeWidth="1.8" strokeLinecap="round"/>

      {/* ── TAIL ── */}
      <g style={{ transformOrigin: "100px 197px", animation: "tailSwing 2.8s ease-in-out infinite" }}>
        <path d="M100 197 C110 208,122 213,127 226 C132 238,122 244,117 238 C124 235,126 228,120 222 C114 217,102 214,99 222 C96 230,104 237,110 232" stroke="#1a0000" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M100 197 C110 208,122 213,127 226 C132 238,122 244,117 238 C124 235,126 228,120 222 C114 217,102 214,99 222 C96 230,104 237,110 232" stroke="#550000" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M110 232 C106 238,100 242,104 248 C108 254,116 250,114 244 C118 248,124 244,120 239Z" fill="#CC0000"/>
        <path d="M110 232 C106 238,100 242,104 248 C108 254,116 250,114 244 C118 248,124 244,120 239Z" fill="#FF2200" opacity="0.5"/>
      </g>
    </svg>
  );
}