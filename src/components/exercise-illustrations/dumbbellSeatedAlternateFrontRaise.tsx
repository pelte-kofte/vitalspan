import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellSeatedAlternateFrontRaise({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Seated alternate front raise — one arm up, one at side */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso upright — seated */}
      <Circle cx={50} cy={46} r={2.5} fill={c} opacity={0.8} />
      {/* Hips seated */}
      <Circle cx={40} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={60} cy={58} r={2} fill={c} opacity={0.7} />
      {/* Knees bent, feet on floor */}
      <Circle cx={36} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={64} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={88} r={2} fill={c} opacity={0.6} />
      <Circle cx={64} cy={88} r={2} fill={c} opacity={0.6} />
      {/* Left arm raised with dumbbell */}
      <Circle cx={26} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={20} cy={8} r={3} fill={c} opacity={0.5} />
      {/* Right arm at side with dumbbell */}
      <Circle cx={72} cy={38} r={2} fill={c} opacity={0.7} />
      <Circle cx={74} cy={50} r={3} fill={c} opacity={0.5} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={50} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={26} x2={64} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Left arm raised */}
      <Line x1={36} y1={26} x2={26} y2={18} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={26} y1={18} x2={20} y2={8} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Right arm down */}
      <Line x1={64} y1={26} x2={72} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={72} y1={38} x2={74} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={50} y1={46} x2={40} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={46} x2={60} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={40} y1={58} x2={36} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={60} y1={58} x2={64} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: up */}
      <Line x1={22} y1={16} x2={18} y2={8} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={14} y1={12} x2={18} y2={8} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={18} y1={12} x2={18} y2={8} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
