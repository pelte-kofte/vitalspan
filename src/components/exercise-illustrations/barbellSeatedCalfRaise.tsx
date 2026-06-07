import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BarbellSeatedCalfRaise({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Seated calf raise — bar across knees, on toes */}
      <Circle cx={50} cy={12} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={20} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={28} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={28} r={2.5} fill={c} opacity={0.8} />
      {/* Torso upright seated */}
      <Circle cx={50} cy={46} r={2.5} fill={c} opacity={0.8} />
      {/* Hips seated on bench */}
      <Circle cx={40} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={60} cy={58} r={2} fill={c} opacity={0.7} />
      {/* Knees bent 90 deg */}
      <Circle cx={36} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={64} cy={74} r={2} fill={c} opacity={0.7} />
      {/* Feet on toes — raised */}
      <Circle cx={32} cy={84} r={2} fill={c} opacity={0.7} />
      <Circle cx={68} cy={84} r={2} fill={c} opacity={0.7} />
      <Circle cx={28} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={72} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Barbell across knees */}
      <Line x1={22} y1={74} x2={78} y2={74} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={22} cy={74} r={3} fill={c} opacity={0.5} />
      <Circle cx={78} cy={74} r={3} fill={c} opacity={0.5} />
      {/* Hands hold bar */}
      <Line x1={36} y1={28} x2={36} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={28} x2={64} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Torso */}
      <Line x1={50} y1={20} x2={50} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={28} x2={64} y2={28} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Hips to knees */}
      <Line x1={50} y1={46} x2={40} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={46} x2={60} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={40} y1={58} x2={36} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={60} y1={58} x2={64} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Calf — foot to toe */}
      <Line x1={36} y1={74} x2={28} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={74} x2={72} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: calf raise upward */}
      <Line x1={30} y1={84} x2={28} y2={74} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={24} y1={78} x2={28} y2={74} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={28} y1={78} x2={28} y2={74} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
