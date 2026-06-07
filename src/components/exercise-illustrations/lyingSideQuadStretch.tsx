import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function LyingSideQuadStretch({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Lying on side, top knee bent back — head left */}
      <Circle cx={12} cy={48} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={48} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={48} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={50} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={65} cy={52} r={2} fill={c} opacity={0.7} />
      {/* Bottom leg straight */}
      <Circle cx={80} cy={54} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={56} r={2} fill={c} opacity={0.6} />
      {/* Top leg bent back — knee up toward head */}
      <Circle cx={62} cy={36} r={2} fill={c} opacity={0.7} />
      <Circle cx={55} cy={24} r={2} fill={c} opacity={0.6} />
      {/* Hand pulling foot */}
      <Circle cx={40} cy={22} r={2} fill={c} opacity={0.7} />
      {/* Support arm extended */}
      <Circle cx={16} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={8} cy={68} r={2} fill={c} opacity={0.6} />
      {/* Torso */}
      <Line x1={22} y1={48} x2={65} y2={52} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Bottom leg */}
      <Line x1={65} y1={52} x2={90} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Top leg bent */}
      <Line x1={65} y1={52} x2={62} y2={36} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={62} y1={36} x2={55} y2={24} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Hand to foot */}
      <Line x1={32} y1={48} x2={40} y2={22} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={40} y1={22} x2={55} y2={24} stroke={c} strokeWidth={1} opacity={0.4} />
      {/* Support arm */}
      <Line x1={22} y1={48} x2={8} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
    </Svg>
  );
}
