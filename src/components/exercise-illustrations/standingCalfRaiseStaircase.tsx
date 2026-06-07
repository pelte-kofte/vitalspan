import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function StandingCalfRaiseStaircase({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Standing calf raise on staircase — toes on edge, heel drop/raise */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso upright */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={42} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={58} r={2} fill={c} opacity={0.7} />
      {/* Calves — on toes raised */}
      <Circle cx={42} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={40} cy={84} r={2} fill={c} opacity={0.7} />
      <Circle cx={60} cy={84} r={2} fill={c} opacity={0.7} />
      {/* Toes on stair edge — heel in air */}
      <Circle cx={38} cy={90} r={2} fill={c} opacity={0.7} />
      <Circle cx={62} cy={90} r={2} fill={c} opacity={0.7} />
      {/* Stair edge */}
      <Line x1={28} y1={92} x2={72} y2={92} stroke={c} strokeWidth={2} opacity={0.4} />
      <Line x1={28} y1={92} x2={28} y2={100} stroke={c} strokeWidth={1.5} opacity={0.3} />
      <Line x1={72} y1={92} x2={72} y2={100} stroke={c} strokeWidth={1.5} opacity={0.3} />
      {/* Handrail / wall hold */}
      <Circle cx={22} cy={36} r={2} fill={c} opacity={0.6} />
      <Line x1={36} y1={26} x2={22} y2={36} stroke={c} strokeWidth={1.5} opacity={0.4} />
      <Line x1={22} y1={36} x2={14} y2={36} stroke={c} strokeWidth={1} opacity={0.3} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={26} x2={64} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Legs */}
      <Line x1={50} y1={44} x2={42} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={44} x2={58} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={58} x2={38} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={58} x2={62} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: rise on toes */}
      <Line x1={50} y1={52} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={42} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={42} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
