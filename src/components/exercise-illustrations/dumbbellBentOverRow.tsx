import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellBentOverRow({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Head — bent over */}
      <Circle cx={25} cy={28} r={4} fill={c} opacity={0.9} />
      <Circle cx={32} cy={35} r={2} fill={c} opacity={0.7} />
      {/* Torso horizontal ~45 deg */}
      <Circle cx={40} cy={40} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={62} cy={48} r={2.5} fill={c} opacity={0.8} />
      {/* Hips */}
      <Circle cx={68} cy={42} r={2} fill={c} opacity={0.7} />
      {/* Knees bent */}
      <Circle cx={58} cy={65} r={2} fill={c} opacity={0.7} />
      <Circle cx={76} cy={65} r={2} fill={c} opacity={0.7} />
      <Circle cx={55} cy={82} r={2} fill={c} opacity={0.6} />
      <Circle cx={78} cy={82} r={2} fill={c} opacity={0.6} />
      {/* Both arms down with dumbbells */}
      <Circle cx={35} cy={55} r={2} fill={c} opacity={0.7} />
      <Circle cx={35} cy={68} r={2} fill={c} opacity={0.6} />
      <Circle cx={45} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={45} cy={68} r={2} fill={c} opacity={0.6} />
      {/* Torso */}
      <Line x1={32} y1={35} x2={62} y2={48} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={40} y1={40} x2={68} y2={42} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arms */}
      <Line x1={40} y1={40} x2={35} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={40} y1={40} x2={45} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={62} y1={48} x2={58} y2={82} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={68} y1={42} x2={78} y2={82} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: pull up toward body */}
      <Line x1={40} y1={68} x2={40} y2={52} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={36} y1={56} x2={40} y2={52} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={44} y1={56} x2={40} y2={52} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
