import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BarbellCleanAndPress({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Clean and press — bar overhead, upright stance */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      {/* Bar overhead */}
      <Line x1={22} y1={8} x2={78} y2={8} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={22} cy={8} r={3} fill={c} opacity={0.5} />
      <Circle cx={78} cy={8} r={3} fill={c} opacity={0.5} />
      {/* Arms fully extended overhead */}
      <Circle cx={30} cy={22} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={70} cy={22} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={26} cy={14} r={2} fill={c} opacity={0.7} />
      <Circle cx={74} cy={14} r={2} fill={c} opacity={0.7} />
      <Line x1={30} y1={22} x2={26} y2={14} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={70} y1={22} x2={74} y2={14} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Torso */}
      <Circle cx={50} cy={42} r={2.5} fill={c} opacity={0.8} />
      {/* Hips */}
      <Circle cx={42} cy={56} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={56} r={2} fill={c} opacity={0.7} />
      {/* Knees, ankles */}
      <Circle cx={42} cy={72} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={72} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={88} r={2} fill={c} opacity={0.6} />
      <Circle cx={58} cy={88} r={2} fill={c} opacity={0.6} />
      {/* Torso lines */}
      <Line x1={50} y1={18} x2={50} y2={42} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={30} y1={22} x2={70} y2={22} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Legs */}
      <Line x1={50} y1={42} x2={42} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={42} x2={58} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={56} x2={42} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={56} x2={58} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: upward press */}
      <Line x1={50} y1={35} x2={50} y2={20} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={24} x2={50} y2={20} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={24} x2={50} y2={20} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
