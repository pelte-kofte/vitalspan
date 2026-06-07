import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function RunningInPlace({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Running in place — high knee, arms pumping */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={62} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso slight lean */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      {/* Hips */}
      <Circle cx={46} cy={56} r={2} fill={c} opacity={0.7} />
      <Circle cx={56} cy={56} r={2} fill={c} opacity={0.7} />
      {/* High knee — left leg up */}
      <Circle cx={38} cy={50} r={2} fill={c} opacity={0.7} />
      <Circle cx={30} cy={40} r={2} fill={c} opacity={0.7} />
      {/* Right leg pushing down/back */}
      <Circle cx={60} cy={68} r={2} fill={c} opacity={0.7} />
      <Circle cx={64} cy={82} r={2} fill={c} opacity={0.7} />
      <Circle cx={66} cy={92} r={2} fill={c} opacity={0.6} />
      {/* Arms pumping opposite */}
      <Circle cx={28} cy={32} r={2} fill={c} opacity={0.7} />
      <Circle cx={22} cy={22} r={2} fill={c} opacity={0.6} />
      <Circle cx={70} cy={38} r={2} fill={c} opacity={0.7} />
      <Circle cx={76} cy={48} r={2} fill={c} opacity={0.6} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={38} y1={26} x2={62} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Left arm forward-up */}
      <Line x1={38} y1={26} x2={28} y2={32} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={32} x2={22} y2={22} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Right arm back-down */}
      <Line x1={62} y1={26} x2={70} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={70} y1={38} x2={76} y2={48} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* High knee left */}
      <Line x1={46} y1={56} x2={38} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={38} y1={50} x2={30} y2={40} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Right leg stride */}
      <Line x1={56} y1={56} x2={60} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={60} y1={68} x2={64} y2={82} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={82} x2={66} y2={92} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Torso to hips */}
      <Line x1={50} y1={44} x2={46} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={44} x2={56} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: upward knee drive */}
      <Line x1={32} y1={40} x2={28} y2={32} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={24} y1={36} x2={28} y2={32} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={28} y1={36} x2={28} y2={32} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
