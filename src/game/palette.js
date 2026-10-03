export const PALETTE = [
  { name: "бордовый", ink: "#8f2d2d", soft: "#f0d2c8" },
  { name: "синий", ink: "#1d4e72", soft: "#d4e4f0" },
  { name: "зелёный", ink: "#1c6846", soft: "#d3eddf" },
  { name: "янтарный", ink: "#8a5a10", soft: "#f4e4c4" },
  { name: "сливовый", ink: "#63325f", soft: "#f0dcf0" },
  { name: "чернильный", ink: "#24324a", soft: "#dce4f0" },
];

export function teamStyle(colorIndex) {
  const color = PALETTE[colorIndex % PALETTE.length];
  return { "--team": color.ink, "--team-soft": color.soft };
}

export function nextColor(teams) {
  const used = new Set(teams.map((team) => team.color));
  for (let index = 0; index < PALETTE.length; index += 1) {
    if (!used.has(index)) return index;
  }
  return teams.length % PALETTE.length;
}
