import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BarbellUprightRow({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Barbell upright row — standing, pulling bar to chin */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={34} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={66} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Barbell at chin height */}
      <Line x1={24} y1={22} x2={76} y2={22} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={24} cy={22} r={2.5} fill={c} opacity={0.5} />
      <Circle cx={76} cy={22} r={2.5} fill={c} opacity={0.5} />
      {/* Elbows flared high */}
      <Circle cx={22} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={78} cy={18} r={2} fill={c} opacity={0.7} />
      {/* Torso */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={42} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={58} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Arms bent high elbows */}
      <Line x1={34} y1={26} x2={22} y2={18} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={22} y1={18} x2={24} y2={22} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={66} y1={26} x2={78} y2={18} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={78} y1={18} x2={76} y2={22} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Torso/spine */}
      <Line x1={50} y1={18} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={34} y1={26} x2={66} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Legs */}
      <Line x1={50} y1={44} x2={42} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={44} x2={58} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={58} x2={42} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={58} x2={58} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: pull up */}
      <Line x1={50} y1={34} x2={50} y2={20} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={24} x2={50} y2={20} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={24} x2={50} y2={20} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
