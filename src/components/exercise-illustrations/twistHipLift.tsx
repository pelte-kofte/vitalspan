import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function TwistHipLift({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Side-lying hip lift with twist — figure mostly horizontal */}
      <Circle cx={15} cy={55} r={4} fill={c} opacity={0.9} />
      <Circle cx={25} cy={52} r={2} fill={c} opacity={0.7} />
      <Circle cx={35} cy={50} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={48} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={65} cy={50} r={2} fill={c} opacity={0.7} />
      <Circle cx={80} cy={52} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={56} r={2} fill={c} opacity={0.6} />
      {/* Raised arm (twist) */}
      <Circle cx={42} cy={36} r={2} fill={c} opacity={0.7} />
      <Circle cx={48} cy={24} r={2} fill={c} opacity={0.6} />
      {/* Support arm on floor */}
      <Circle cx={24} cy={66} r={2} fill={c} opacity={0.7} />
      <Line x1={35} y1={50} x2={42} y2={36} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={36} x2={48} y2={24} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={35} y1={50} x2={24} y2={66} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Torso horizontal */}
      <Line x1={25} y1={52} x2={65} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={65} y1={50} x2={90} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: upward lift */}
      <Line x1={50} y1={48} x2={50} y2={34} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={38} x2={50} y2={34} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={38} x2={50} y2={34} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
