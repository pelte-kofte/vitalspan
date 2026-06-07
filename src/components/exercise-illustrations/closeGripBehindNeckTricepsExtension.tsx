import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function CloseGripBehindNeckTricepsExtension({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Behind neck triceps extension — standing, bar behind head */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Arms bent behind head — elbows pointing up */}
      <Circle cx={30} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={70} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={34} cy={32} r={2} fill={c} opacity={0.7} />
      <Circle cx={66} cy={32} r={2} fill={c} opacity={0.7} />
      {/* Barbell behind neck */}
      <Line x1={28} y1={36} x2={72} y2={36} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={28} cy={36} r={2.5} fill={c} opacity={0.5} />
      <Circle cx={72} cy={36} r={2.5} fill={c} opacity={0.5} />
      {/* Torso */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={42} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={58} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Arms bent */}
      <Line x1={36} y1={26} x2={30} y2={18} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={30} y1={18} x2={34} y2={32} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={26} x2={70} y2={18} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={70} y1={18} x2={66} y2={32} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Spine */}
      <Line x1={50} y1={18} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={26} x2={64} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Legs */}
      <Line x1={50} y1={44} x2={42} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={44} x2={58} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={58} x2={42} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={58} x2={58} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: extend upward */}
      <Line x1={50} y1={36} x2={50} y2={22} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={26} x2={50} y2={22} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={26} x2={50} y2={22} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
