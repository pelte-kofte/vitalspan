import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function StandingBehindNeckPress({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Behind neck press — standing, bar behind head, pressing overhead */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      {/* Bar overhead */}
      <Line x1={18} y1={8} x2={82} y2={8} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={18} cy={8} r={3} fill={c} opacity={0.5} />
      <Circle cx={82} cy={8} r={3} fill={c} opacity={0.5} />
      {/* Shoulders wide, arms fully extended */}
      <Circle cx={26} cy={22} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={74} cy={22} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={22} cy={14} r={2} fill={c} opacity={0.7} />
      <Circle cx={78} cy={14} r={2} fill={c} opacity={0.7} />
      {/* Bar behind neck — lower position */}
      <Line x1={20} y1={24} x2={80} y2={24} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Torso */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={42} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={58} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Arms */}
      <Line x1={26} y1={22} x2={22} y2={14} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={74} y1={22} x2={78} y2={14} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={18} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={26} y1={22} x2={74} y2={22} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Legs */}
      <Line x1={50} y1={44} x2={42} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={44} x2={58} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={58} x2={42} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={58} x2={58} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: press overhead */}
      <Line x1={50} y1={28} x2={50} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={18} x2={50} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={18} x2={50} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
