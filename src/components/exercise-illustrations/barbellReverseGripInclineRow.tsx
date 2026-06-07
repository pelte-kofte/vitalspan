import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BarbellReverseGripInclineRow({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Prone on incline bench — head up left, feet right low */}
      <Circle cx={18} cy={32} r={4} fill={c} opacity={0.9} />
      <Circle cx={26} cy={38} r={2} fill={c} opacity={0.7} />
      <Circle cx={35} cy={42} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={52} cy={48} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={65} cy={55} r={2} fill={c} opacity={0.7} />
      <Circle cx={80} cy={65} r={2} fill={c} opacity={0.7} />
      <Circle cx={88} cy={75} r={2} fill={c} opacity={0.6} />
      {/* Barbell arms hanging */}
      <Circle cx={35} cy={56} r={2} fill={c} opacity={0.7} />
      <Circle cx={52} cy={62} r={2} fill={c} opacity={0.7} />
      {/* Barbell */}
      <Line x1={28} y1={65} x2={60} y2={65} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={28} cy={65} r={2.5} fill={c} opacity={0.5} />
      <Circle cx={60} cy={65} r={2.5} fill={c} opacity={0.5} />
      {/* Bench */}
      <Line x1={12} y1={46} x2={92} y2={82} stroke={c} strokeWidth={1} opacity={0.3} />
      {/* Torso */}
      <Line x1={26} y1={38} x2={65} y2={55} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms to barbell */}
      <Line x1={35} y1={42} x2={35} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={52} y1={48} x2={52} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={35} y1={56} x2={28} y2={65} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={52} y1={62} x2={60} y2={65} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={65} y1={55} x2={88} y2={75} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: pull up */}
      <Line x1={44} y1={65} x2={44} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={40} y1={54} x2={44} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={48} y1={54} x2={44} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
