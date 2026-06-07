import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellDeclineOneArmFly({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Decline one-arm fly — lying on decline bench, one arm arc */}
      <Circle cx={12} cy={65} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={61} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={58} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={55} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={52} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={50} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={48} r={2} fill={c} opacity={0.6} />
      {/* One arm extended wide */}
      <Circle cx={32} cy={44} r={2} fill={c} opacity={0.7} />
      <Circle cx={28} cy={32} r={2} fill={c} opacity={0.6} />
      <Circle cx={26} cy={22} r={3} fill={c} opacity={0.5} />
      {/* Other arm across chest */}
      <Circle cx={48} cy={46} r={2} fill={c} opacity={0.7} />
      <Circle cx={46} cy={38} r={3} fill={c} opacity={0.5} />
      {/* Bench */}
      <Line x1={8} y1={74} x2={94} y2={58} stroke={c} strokeWidth={1} opacity={0.3} />
      {/* Torso */}
      <Line x1={22} y1={61} x2={82} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Extended arm */}
      <Line x1={32} y1={58} x2={32} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={44} x2={28} y2={32} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={32} x2={26} y2={22} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Across chest arm */}
      <Line x1={50} y1={55} x2={48} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={48} y1={46} x2={46} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={68} y1={52} x2={90} y2={48} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: arc inward */}
      <Line x1={28} y1={32} x2={36} y2={26} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={36} y1={30} x2={36} y2={26} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={32} y1={26} x2={36} y2={26} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
