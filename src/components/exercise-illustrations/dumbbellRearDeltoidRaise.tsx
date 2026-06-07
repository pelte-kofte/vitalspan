import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellRearDeltoidRaise({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Rear deltoid raise — bent over, arms raising to sides */}
      <Circle cx={28} cy={26} r={4} fill={c} opacity={0.9} />
      <Circle cx={34} cy={34} r={2} fill={c} opacity={0.7} />
      {/* Torso bent ~90 deg */}
      <Circle cx={42} cy={40} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={62} cy={44} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={70} cy={38} r={2} fill={c} opacity={0.7} />
      {/* Knees */}
      <Circle cx={58} cy={64} r={2} fill={c} opacity={0.7} />
      <Circle cx={74} cy={64} r={2} fill={c} opacity={0.7} />
      <Circle cx={56} cy={82} r={2} fill={c} opacity={0.6} />
      <Circle cx={76} cy={82} r={2} fill={c} opacity={0.6} />
      {/* Arms raised wide to sides */}
      <Circle cx={28} cy={32} r={2} fill={c} opacity={0.7} />
      <Circle cx={18} cy={24} r={3} fill={c} opacity={0.5} />
      <Circle cx={56} cy={32} r={2} fill={c} opacity={0.7} />
      <Circle cx={68} cy={24} r={3} fill={c} opacity={0.5} />
      {/* Torso */}
      <Line x1={34} y1={34} x2={62} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={40} x2={70} y2={38} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arms to sides */}
      <Line x1={42} y1={40} x2={28} y2={32} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={32} x2={18} y2={24} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={40} x2={56} y2={32} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={56} y1={32} x2={68} y2={24} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={62} y1={44} x2={58} y2={82} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={70} y1={38} x2={76} y2={82} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: raise to sides */}
      <Line x1={18} y1={24} x2={12} y2={18} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={12} y1={22} x2={12} y2={18} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={16} y1={18} x2={12} y2={18} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
