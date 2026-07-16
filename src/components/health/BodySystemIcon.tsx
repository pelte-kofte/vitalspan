import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { BodySystemId } from '../../lib/healthExperience';

interface Props {
  system: BodySystemId;
  color: string;
  size?: number;
}

const strokeProps = {
  fill: 'none',
  strokeWidth: 1.55,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Cardiovascular({ color }: { color: string }) {
  return <>
    <Path d="M4 13 C7 13 7 7 10 7 C13 7 13 17 16 17 C19 17 19 11 22 11" stroke={color} {...strokeProps} />
    <Circle cx="4" cy="13" r="1" fill={color} />
    <Circle cx="22" cy="11" r="1" fill={color} />
  </>;
}

function Brain({ color }: { color: string }) {
  return <>
    <Path d="M13 4 C9 2 6 5 7 8 C3 9 4 14 7 15 C5 19 9 22 13 19 Z" stroke={color} {...strokeProps} />
    <Path d="M13 6 C10 6 10 9 13 10 M8 11 C11 11 11 14 9 16 M13 14 C10 14 10 18 13 18" stroke={color} {...strokeProps} />
    <Path d="M13 4 C17 2 20 5 19 8 C23 9 22 14 19 15 C21 19 17 22 13 19 M13 10 C16 10 16 7 18 7 M13 14 C16 14 16 17 18 17" stroke={color} {...strokeProps} />
  </>;
}

function Metabolic({ color }: { color: string }) {
  return <>
    <Path d="M7 7 C10 3 16 4 17 9 C18 14 11 15 8 12 C5 9 7 6 10 6" stroke={color} {...strokeProps} />
    <Path d="M19 19 C16 23 10 22 9 17 C8 12 15 11 18 14 C21 17 19 20 16 20" stroke={color} {...strokeProps} />
  </>;
}

function Immune({ color }: { color: string }) {
  return <>
    <Path d="M13 3 C18 3 22 7 22 12 C22 18 18 22 13 23 C8 22 4 18 4 12 C4 7 8 3 13 3 Z" stroke={color} {...strokeProps} />
    <Path d="M13 7 C17 7 19 9 19 13 C19 16 17 19 13 19 C9 19 7 16 7 13 C7 9 9 7 13 7 Z" stroke={color} {...strokeProps} />
    <Path d="M11 13 C12 11 14 11 15 13 C14 15 12 15 11 13 Z" stroke={color} {...strokeProps} />
  </>;
}

function Liver({ color }: { color: string }) {
  return <>
    <Path d="M4 10 C9 5 16 5 22 8 C21 14 18 18 11 19 C7 20 4 17 4 10 Z" stroke={color} {...strokeProps} />
    <Path d="M8 12 C12 10 17 10 21 11 M10 16 C13 14 16 14 19 14" stroke={color} {...strokeProps} />
  </>;
}

function Kidney({ color }: { color: string }) {
  return <>
    <Path d="M5 4 C5 9 9 9 9 13 C9 17 12 17 13 22" stroke={color} {...strokeProps} />
    <Path d="M21 4 C21 9 17 9 17 13 C17 17 14 17 13 22" stroke={color} {...strokeProps} />
    <Path d="M8 7 L18 7 M10 11 L16 11 M11 15 L15 15" stroke={color} {...strokeProps} />
    <Circle cx="5" cy="4" r="1" fill={color} /><Circle cx="21" cy="4" r="1" fill={color} />
  </>;
}

function Muscle({ color }: { color: string }) {
  return <>
    <Path d="M4 8 C8 5 11 5 14 8 C17 11 19 11 22 8 M4 13 C8 10 11 10 14 13 C17 16 19 16 22 13 M4 18 C8 15 11 15 14 18 C17 21 19 21 22 18" stroke={color} {...strokeProps} />
    <Line x1="7" y1="5" x2="7" y2="20" stroke={color} strokeWidth={1.55} strokeLinecap="round" />
  </>;
}

function Hormones({ color }: { color: string }) {
  return <>
    <Circle cx="6" cy="13" r="2.5" stroke={color} {...strokeProps} />
    <Circle cx="19" cy="7" r="2.5" stroke={color} {...strokeProps} />
    <Circle cx="18" cy="20" r="2.5" stroke={color} {...strokeProps} />
    <Path d="M8.5 12 L16.5 8 M8 15 L15.5 19 M19 9.5 L18.3 17.5" stroke={color} {...strokeProps} />
  </>;
}

function Nutrition({ color }: { color: string }) {
  return <>
    <Path d="M13 22 C8 19 6 15 7 10 C8 6 12 4 18 4 C19 10 18 15 13 18" stroke={color} {...strokeProps} />
    <Path d="M13 22 C12 15 14 10 18 6 M8 13 C11 13 13 14 15 16" stroke={color} {...strokeProps} />
    <Circle cx="7" cy="8" r="1" fill={color} />
  </>;
}

function Research({ color }: { color: string }) {
  return <>
    <Path d="M7 4 L4 4 L4 22 L7 22 M19 4 L22 4 L22 22 L19 22" stroke={color} {...strokeProps} />
    <Path d="M8 16 C10 9 15 7 18 10 C19 14 16 18 11 19" stroke={color} {...strokeProps} />
    <Circle cx="10" cy="7" r="1.4" stroke={color} {...strokeProps} />
    <Circle cx="16" cy="15" r="1.4" fill={color} />
  </>;
}

const GLYPHS: Record<BodySystemId, React.ComponentType<{ color: string }>> = {
  cardiovascular: Cardiovascular,
  brain: Brain,
  metabolic: Metabolic,
  immune: Immune,
  liver: Liver,
  kidney: Kidney,
  muscle: Muscle,
  hormones: Hormones,
  nutrition: Nutrition,
  research: Research,
};

export default function BodySystemIcon({ system, color, size = 28 }: Props) {
  const Glyph = GLYPHS[system];
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" accessible={false}>
      <Glyph color={color} />
    </Svg>
  );
}
