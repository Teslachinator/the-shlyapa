export function HatMark({ className = "hat-mark" }) {
  return (
    <svg className={className} viewBox="0 0 240 176" aria-hidden="true">
      <ellipse cx="122" cy="158" rx="86" ry="11" fill="#100c0a" opacity="0.5" />
      <g transform="rotate(-11 118 102)">
        <path d="M18 124c28 28 168 30 206-6-18 22-176 24-206 6z" fill="#4e1515" />
        <ellipse cx="118" cy="118" rx="104" ry="20" fill="#7a2424" />
        <ellipse cx="114" cy="112" rx="100" ry="18" fill="#a33838" />
        <path d="M48 108c4-58 22-84 70-88 48 4 66 30 70 88-28 16-112 16-140 0z" fill="#8f2d2d" />
        <path d="M64 104c4-44 16-68 50-74 10 14 12 40 8 74-16 8-44 8-58 0z" fill="#d06565" />
        <path d="M86 34c16 22 46 24 68 4-14 16-46 16-68-4z" fill="#4e1515" />
        <path d="M56 90c28 22 100 22 128-4l4 18c-32 26-104 26-136 0z" fill="#e2b15a" />
        <path d="M58 90c26 14 96 14 124-4-26 16-96 16-124 4z" fill="#f6e7c8" opacity="0.4" />
        <rect x="106" y="88" width="22" height="20" rx="3" fill="#1c1410" />
        <rect x="110" y="92" width="14" height="12" rx="2" fill="none" stroke="#e2b15a" strokeWidth="2" />
        <g transform="rotate(20 176 48)">
          <rect x="148" y="6" width="54" height="68" rx="5" fill="#f6efe0" />
          <path d="M180 6l22 18h-22z" fill="#e4d3b4" />
          <path
            d="M158 34h34M158 44h24M158 54h30"
            fill="none"
            stroke="#8f2d2d"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}
