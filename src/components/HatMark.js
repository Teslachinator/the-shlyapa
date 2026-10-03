export function HatMark({ className = "hat-mark" }) {
  return (
    <svg className={className} viewBox="0 0 128 96" aria-hidden="true">
      <ellipse cx="64" cy="80" rx="54" ry="10" fill="#3f1414" />
      <ellipse cx="64" cy="74" rx="54" ry="10" fill="#7a2828" />
      <path d="M34 74c1-30 10-48 30-48s29 18 30 48" fill="#8f2d2d" />
      <path d="M42 74c1-24 8-40 22-40s21 16 22 40" fill="#a33b3b" />
      <path d="M40 60c3 5 13 9 24 9s21-4 24-9c-2 7-13 13-24 13s-22-6-24-13z" fill="#e2b15a" />
      <path
        d="M50 34c5-7 14-9 20-4"
        fill="none"
        stroke="#f6e7c8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
