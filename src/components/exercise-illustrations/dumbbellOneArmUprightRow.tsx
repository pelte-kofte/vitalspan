import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellOneArmUprightRow({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* One-arm upright row — standing, one arm pulling dumbbell up to chin */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={42} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={58} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Pulling arm — elbow high */}
      <Circle cx={32} cy={22} r={2} fill={c} opacity={0.7} />
      <Circle cx={26} cy={14} r={3} fill={c} opacity={0.5} />
      {/* Other arm relaxed */}
      <Circle cx={70} cy={38} r={2} fill={c} opacity={0.7} />
      <Circle cx={72} cy={52} r={3} fill={c} opacity={0.5} />
      {/* Torso lines */}
      <Line x1={50} y1={18} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={26} x2={64} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Pulling arm — high elbow */}
      <Line x1={36} y1={26} x2={32} y2={22} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={22} x2={26} y2={14} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Other arm */}
      <Line x1={64} y1={26} x2={70} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={70} y1={38} x2={72} y2={52} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={50} y1={44} x2={42} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={44} x2={58} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={58} x2={42} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={58} x2={58} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: pull up */}
      <Line x1={30} y1={22} x2={28} y2={12} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={24} y1={16} x2={28} y2={12} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={28} y1={16} x2={28} y2={12} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
