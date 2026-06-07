import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BarbellLateralLunge({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Lateral lunge — one leg bent sideways */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Barbell across shoulders */}
      <Line x1={20} y1={24} x2={80} y2={24} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={20} cy={24} r={3} fill={c} opacity={0.5} />
      <Circle cx={80} cy={24} r={3} fill={c} opacity={0.5} />
      {/* Torso — slight forward lean */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      {/* Hip center */}
      <Circle cx={50} cy={56} r={2} fill={c} opacity={0.7} />
      {/* Left leg straight out */}
      <Circle cx={20} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={15} cy={78} r={2} fill={c} opacity={0.6} />
      {/* Right leg deeply bent */}
      <Circle cx={70} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={78} cy={78} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Torso lines */}
      <Line x1={50} y1={18} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={26} x2={64} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      <Line x1={50} y1={44} x2={50} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Left leg */}
      <Line x1={50} y1={56} x2={20} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={20} y1={62} x2={15} y2={78} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Right leg bent */}
      <Line x1={50} y1={56} x2={70} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={70} y1={62} x2={78} y2={78} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={78} y1={78} x2={82} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: lateral */}
      <Line x1={50} y1={56} x2={68} y2={56} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={64} y1={52} x2={68} y2={56} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={64} y1={60} x2={68} y2={56} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
