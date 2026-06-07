import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BarbellBentArmPullover({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Lying figure: head left, feet right */}
      <Circle cx={12} cy={50} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={50} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={44} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={32} cy={56} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={50} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={65} cy={50} r={2} fill={c} opacity={0.7} />
      <Circle cx={80} cy={50} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={50} r={2} fill={c} opacity={0.6} />
      {/* Arms reaching overhead */}
      <Circle cx={28} cy={30} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={20} r={2} fill={c} opacity={0.7} />
      <Line x1={32} y1={44} x2={28} y2={30} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={30} x2={36} y2={20} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Barbell overhead */}
      <Line x1={26} y1={18} x2={46} y2={18} stroke={c} strokeWidth={2} opacity={0.6} />
      {/* Torso */}
      <Line x1={22} y1={50} x2={65} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={44} x2={32} y2={56} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Legs */}
      <Line x1={65} y1={50} x2={90} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: arc motion */}
      <Line x1={36} y1={20} x2={36} y2={34} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={32} y1={30} x2={36} y2={34} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={40} y1={30} x2={36} y2={34} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
