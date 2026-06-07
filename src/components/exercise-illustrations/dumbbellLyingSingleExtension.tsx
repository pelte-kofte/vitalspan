import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellLyingSingleExtension({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Lying single arm triceps extension — head left, feet right */}
      <Circle cx={12} cy={52} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={52} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={52} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={54} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={56} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={60} r={2} fill={c} opacity={0.6} />
      {/* Arm bent at elbow, dumbbell toward head */}
      <Circle cx={32} cy={38} r={2} fill={c} opacity={0.7} />
      <Circle cx={28} cy={26} r={2} fill={c} opacity={0.7} />
      <Circle cx={26} cy={16} r={3} fill={c} opacity={0.5} />
      {/* Elbow pointing up */}
      <Circle cx={24} cy={34} r={1.5} fill={c} opacity={0.6} />
      {/* Other arm at side */}
      <Circle cx={50} cy={64} r={2} fill={c} opacity={0.7} />
      <Circle cx={52} cy={74} r={3} fill={c} opacity={0.5} />
      {/* Torso horizontal */}
      <Line x1={22} y1={52} x2={82} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Extending arm */}
      <Line x1={32} y1={52} x2={32} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={38} x2={28} y2={26} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={26} x2={26} y2={16} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Other arm */}
      <Line x1={50} y1={54} x2={50} y2={64} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={64} x2={52} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={68} y1={56} x2={90} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: extend upward */}
      <Line x1={26} y1={16} x2={22} y2={8} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={18} y1={12} x2={22} y2={8} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={22} y1={12} x2={22} y2={8} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
