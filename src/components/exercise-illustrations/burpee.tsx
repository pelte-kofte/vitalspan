import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function Burpee({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Burpee — jump phase with arms overhead */}
      <Circle cx={50} cy={8} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={16} r={2} fill={c} opacity={0.7} />
      {/* Arms overhead */}
      <Circle cx={34} cy={24} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={66} cy={24} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={24} cy={14} r={2} fill={c} opacity={0.7} />
      <Circle cx={76} cy={14} r={2} fill={c} opacity={0.7} />
      <Circle cx={18} cy={6} r={2} fill={c} opacity={0.6} />
      <Circle cx={82} cy={6} r={2} fill={c} opacity={0.6} />
      {/* Torso */}
      <Circle cx={50} cy={40} r={2.5} fill={c} opacity={0.8} />
      {/* Hips */}
      <Circle cx={44} cy={52} r={2} fill={c} opacity={0.7} />
      <Circle cx={56} cy={52} r={2} fill={c} opacity={0.7} />
      {/* Legs in air, knees slightly tucked */}
      <Circle cx={36} cy={64} r={2} fill={c} opacity={0.7} />
      <Circle cx={64} cy={64} r={2} fill={c} opacity={0.7} />
      <Circle cx={30} cy={78} r={2} fill={c} opacity={0.6} />
      <Circle cx={70} cy={78} r={2} fill={c} opacity={0.6} />
      {/* Arms overhead */}
      <Line x1={34} y1={24} x2={24} y2={14} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={24} y1={14} x2={18} y2={6} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={66} y1={24} x2={76} y2={14} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={76} y1={14} x2={82} y2={6} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Torso */}
      <Line x1={50} y1={16} x2={50} y2={40} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={34} y1={24} x2={66} y2={24} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Legs tuck */}
      <Line x1={50} y1={40} x2={44} y2={52} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={40} x2={56} y2={52} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={44} y1={52} x2={36} y2={64} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={56} y1={52} x2={64} y2={64} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={64} x2={30} y2={78} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={64} x2={70} y2={78} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: jump up */}
      <Line x1={50} y1={34} x2={50} y2={20} stroke={c} strokeWidth={2} opacity={0.8} />
      <Line x1={46} y1={24} x2={50} y2={20} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={24} x2={50} y2={20} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
