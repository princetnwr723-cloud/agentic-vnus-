"use client";
import { useEffect, useRef } from "react";

export default function DemonMascot({ size = 160 }: { size?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let ph = 0;
    const eyeInterval = setInterval(() => {
      ph += 0.04;
      const intensity = 0.5 + 0.5 * Math.sin(ph);
      const r = Math.round(180 + 75 * intensity);
      const g = Math.round(intensity * 30);
      const c = `rgb(${r},${g},0)`;
      const le = svgRef.current?.querySelector("#left-eye") as SVGEllipseElement;
      const re = svgRef.current?.querySelector("#right-eye") as SVGEllipseElement;
      if (le) le.setAttribute("fill", c);
      if (re) re.setAttribute("fill", c);
    }, 40);
    return () => clearInterval(eyeInterval);
  }, []);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size * 1.3}
      viewBox="0 0 200 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: "demonFloat 4.5s ease-in-out infinite" }}
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
        <radialGradient id="eyeGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FF4400"/>
          <stop offset="50%" stopColor="#CC0000"/>
          <stop offset="100%" stopColor="#660000"/>
        </radialGradient>
        <linearGradient id="hornG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF2200"/>
          <stop offset="100%" stopColor="#880000"/>
        </linearGradient>

        <style>{`
          @keyframes demonFloat {
            0%,100% { transform: translateY(0px); }
            25% { transform: translateY(-14px) rotate(-1.5deg); }
            75% { transform: translateY(-7px) rotate(1.5deg); }
          }
          @keyframes wingBeat {
            0%,100% { transform: scaleX(1) rotate(-6deg); }
            50%     { transform: scaleX(0.8) rotate(10deg); }
          }
          @keyframes hornGlow {
            0%,100% { filter: drop-shadow(0 0 4px #FF2200) drop-shadow(0 0 10px #FF000060); }
            50%     { filter: drop-shadow(0 0 14px #FF2200) drop-shadow(0 0 30px #FF000090); }
          }
          @keyframes eyeAngry {
            0%,100% { filter: drop-shadow(0 0 5px #FF0000); }
            50%     { filter: drop-shadow(0 0 14px #FF0000) drop-shadow(0 0 25px #FF000080); }
          }
          @keyframes leftArmSwing {
            0%,100% { transform: rotate(-12deg); }
            50%     { transform: rotate(16deg); }
          }
          @keyframes rightArmSwing {
            0%,100% { transform: rotate(12deg); }
            50%     { transform: rotate(-16deg); }
          }
          @keyframes tailWag {
            0%,100% { transform: rotate(-15deg); }
            50%     { transform: rotate(15deg); }
          }
        `}</style>
      </defs>

      {/* ── WINGS ── */}
      <g style={{ transformOrigin: "80px 125px", animation: "wingBeat 2.6s ease-in-out infinite" }}>
        <path d="M80 125 C52 105,18 90,10 64 C7 48,24 44,44 55 C30 70,34 86,54 96 C38 76,40 55,63 63 C54 80,63 102,80 114Z" fill="url(#wingG)"/>
        <path d="M78 123 C56 107,22 83,13 61" stroke="#990000" strokeWidth="0.8" fill="none" opacity="0.7"/>
        <path d="M76 116 C54 100,34 75,42 55" stroke="#770000" strokeWidth="0.6" fill="none" opacity="0.5"/>
        <path d="M80 125 C52 105,18 90,10 64 C7 48,24 44,44 55" stroke="#CC0000" strokeWidth="1.2" fill="none" opacity="0.5"/>
      </g>
      <g style={{ transformOrigin: "120px 125px", animation: "wingBeat 2.6s ease-in-out infinite reverse" }}>
        <path d="M120 125 C148 105,182 90,190 64 C193 48,176 44,156 55 C170 70,166 86,146 96 C162 76,160 55,137 63 C146 80,137 102,120 114Z" fill="url(#wingG)"/>
        <path d="M122 123 C144 107,178 83,187 61" stroke="#990000" strokeWidth="0.8" fill="none" opacity="0.7"/>
        <path d="M120 125 C148 105,182 90,190 64 C193 48,176 44,156 55" stroke="#CC0000" strokeWidth="1.2" fill="none" opacity="0.5"/>
      </g>

      {/* ── HORNS ── */}
      <g style={{ animation: "hornGlow 2s ease-in-out infinite" }}>
        <path d="M76 56 C68 42,60 26,64 12 C68 24,72 40,78 52Z" fill="url(#hornG)"/>
        <path d="M76 56 C71 44,66 30,68 16" stroke="#FF4400" strokeWidth="1.2" fill="none" opacity="0.5"/>
        <path d="M124 56 C132 42,140 26,136 12 C132 24,128 40,122 52Z" fill="url(#hornG)"/>
        <path d="M124 56 C129 44,134 30,132 16" stroke="#FF4400" strokeWidth="1.2" fill="none" opacity="0.5"/>
        <path d="M87 58 C83 47,80 36,84 26 C86 36,88 48,91 56Z" fill="#AA1100"/>
        <path d="M113 58 C117 47,120 36,116 26 C114 36,112 48,109 56Z" fill="#AA1100"/>
      </g>

      {/* ── BODY ── */}
      <ellipse cx="100" cy="142" rx="57" ry="62" fill="#440000" opacity="0.8"/>
      <ellipse cx="100" cy="140" rx="54" ry="59" fill="url(#bodyG)"/>
      <ellipse cx="100" cy="152" rx="30" ry="34" fill="#2a0000" opacity="0.5"/>
      <ellipse cx="100" cy="140" rx="54" ry="59" fill="none" stroke="#660000" strokeWidth="2" opacity="0.5"/>

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
      <path d="M80 140 C88 148,112 148,120 140" fill="#110000"/>
      <path d="M82 141 L79 152 L85 141Z" fill="#DDDDDD"/>
      <path d="M88 142 L87 153 L93 142Z" fill="#CCCCCC"/>
      <path d="M95 141 L92 156 L98 141Z" fill="#EEEEEE"/>
      <path d="M105 141 L102 156 L108 141Z" fill="#EEEEEE"/>
      <path d="M112 142 L107 153 L113 142Z" fill="#CCCCCC"/>
      <path d="M118 141 L115 152 L121 141Z" fill="#DDDDDD"/>
      <path d="M80 140 C88 148,112 148,120 140" stroke="#330000" strokeWidth="1.5" fill="none"/>

      {/* ── SCAR MARKINGS ── */}
      <path d="M68 125 L62 118 M66 130 L60 126" stroke="#AA0000" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      <path d="M132 125 L138 118 M134 130 L140 126" stroke="#AA0000" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>

      {/* ── LEFT ARM — chubby rounded like original, pivots from shoulder ── */}
      <g style={{ transformOrigin: "54px 158px", animation: "leftArmSwing 2.4s ease-in-out infinite" }}>
        {/* Upper arm — thick rounded shape */}
        <ellipse cx="54" cy="158" rx="14" ry="10" fill="url(#bodyG)" stroke="#440000" strokeWidth="1" transform="rotate(-30 54 158)"/>
        {/* Lower arm / forearm */}
        <ellipse cx="42" cy="172" rx="11" ry="8" fill="url(#bodyG)" stroke="#440000" strokeWidth="1" transform="rotate(-15 42 172)"/>
        {/* Claws */}
        <path d="M36 178 L28 182" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M36 178 L32 188" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M36 178 L40 186" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M28 182 L24 185" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M32 188 L30 193" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M40 186 L40 191" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* ── RIGHT ARM — mirror of left ── */}
      <g style={{ transformOrigin: "146px 158px", animation: "rightArmSwing 2.4s ease-in-out infinite 0.1s" }}>
        <ellipse cx="146" cy="158" rx="14" ry="10" fill="url(#bodyG)" stroke="#440000" strokeWidth="1" transform="rotate(30 146 158)"/>
        <ellipse cx="158" cy="172" rx="11" ry="8" fill="url(#bodyG)" stroke="#440000" strokeWidth="1" transform="rotate(15 158 172)"/>
        {/* Claws */}
        <path d="M164 178 L172 182" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M164 178 L168 188" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M164 178 L160 186" stroke="#DD1100" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M172 182 L176 185" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M168 188 L170 193" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M160 186 L160 191" stroke="#FF2200" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* ── LEGS ── */}
      <ellipse cx="82" cy="198" rx="18" ry="10" fill="#1a0000" stroke="#440000" strokeWidth="1"/>
      <ellipse cx="118" cy="198" rx="18" ry="10" fill="#1a0000" stroke="#440000" strokeWidth="1"/>
      <path d="M66 200 L60 208 M72 202 L68 212 M78 203 L76 213" stroke="#AA0000" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M134 200 L140 208 M128 202 L132 212 M122 203 L124 213" stroke="#AA0000" strokeWidth="1.8" strokeLinecap="round"/>

      {/* ── TAIL — fixed origin at body base ── */}
      <g style={{ transformOrigin: "100px 194px", animation: "tailWag 2.8s ease-in-out infinite" }}>
        <path
          d="M100 194 C106 202,116 208,120 220 C124 232,116 240,110 236 C116 232,118 224,112 219 C106 214,96 212,94 220 C92 228,100 235,106 231"
          stroke="#1a0000" strokeWidth="7" fill="none" strokeLinecap="round"
        />
        <path
          d="M100 194 C106 202,116 208,120 220 C124 232,116 240,110 236 C116 232,118 224,112 219 C106 214,96 212,94 220 C92 228,100 235,106 231"
          stroke="#550000" strokeWidth="3.5" fill="none" strokeLinecap="round"
        />
        {/* Spade tip */}
        <path d="M106 231 C102 237,96 241,100 247 C104 253,112 249,110 243 C114 247,120 243,116 238Z" fill="#CC0000"/>
        <path d="M106 231 C102 237,96 241,100 247 C104 253,112 249,110 243 C114 247,120 243,116 238Z" fill="#FF2200" opacity="0.5"/>
      </g>
    </svg>
  );
}