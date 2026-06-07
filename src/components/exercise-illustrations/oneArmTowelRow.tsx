import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function OneArmTowelRow({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Bent over, one arm pulling towel */}
      <Circle cx={22} cy={28} r={4} fill={c} opacity={0.9} />
      <Circle cx={28} cy={36} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={42} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={58} cy={50} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={66} cy={44} r={2} fill={c} opacity={0.7} />
      {/* Knees slightly bent */}
      <Circle cx={54} cy={66} r={2} fill={c} opacity={0.7} />
      <Circle cx={70} cy={66} r={2} fill={c} opacity={0.7} />
      <Circle cx={52} cy={84} r={2} fill={c} opacity={0.6} />
      <Circle cx={72} cy={84} r={2} fill={c} opacity={0.6} />
      {/* Pulling arm — one reaching toward towel anchor */}
      <Circle cx={28} cy={56} r={2} fill={c} opacity={0.7} />
      <Circle cx={22} cy={68} r={2} fill={c} opacity={0.6} />
      {/* Towel anchor on door */}
      <Circle cx={88} cy={50} r={3} fill={c} opacity={0.4} />
      <Line x1={22} y1={68} x2={88} y2={50} stroke={c} strokeWidth={1} opacity={0.3} />
      {/* Other arm supporting */}
      <Circle cx={50} cy={38} r={2} fill={c} opacity={0.7} />
      <Line x1={36} y1={42} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Torso */}
      <Line x1={28} y1={36} x2={58} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Pulling arm */}
      <Line x1={36} y1={42} x2={28} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={56} x2={22} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={58} y1={50} x2={54} y2={84} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={66} y1={44} x2={72} y2={84} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: pull toward body */}
      <Line x1={36} y1={68} x2={36} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={32} y1={54} x2={36} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={40} y1={54} x2={36} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
