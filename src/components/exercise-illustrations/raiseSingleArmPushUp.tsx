import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function RaiseSingleArmPushUp({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Single arm push-up — one arm raised to side */}
      <Circle cx={14} cy={42} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={48} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={52} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={58} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={68} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={74} r={2} fill={c} opacity={0.6} />
      {/* Support hand on floor */}
      <Circle cx={38} cy={65} r={2} fill={c} opacity={0.7} />
      {/* Raised arm to side */}
      <Circle cx={24} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={14} cy={62} r={2} fill={c} opacity={0.6} />
      {/* Floor */}
      <Line x1={10} y1={76} x2={94} y2={82} stroke={c} strokeWidth={1} opacity={0.3} />
      {/* Torso */}
      <Line x1={22} y1={48} x2={82} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Support arm */}
      <Line x1={50} y1={58} x2={38} y2={65} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Raised arm to side */}
      <Line x1={32} y1={52} x2={24} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={24} y1={58} x2={14} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={68} y1={62} x2={90} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: lateral raise */}
      <Line x1={14} y1={60} x2={8} y2={56} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={8} y1={60} x2={8} y2={56} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={12} y1={56} x2={8} y2={56} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
