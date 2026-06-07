import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellLyingElbowPress({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Lying dumbbell elbow press — on back, pressing from close grip */}
      <Circle cx={12} cy={55} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={55} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={55} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={56} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={62} r={2} fill={c} opacity={0.6} />
      {/* Elbows tucked, arms pressing up */}
      <Circle cx={32} cy={42} r={2} fill={c} opacity={0.7} />
      <Circle cx={50} cy={40} r={2} fill={c} opacity={0.7} />
      <Circle cx={30} cy={28} r={3} fill={c} opacity={0.5} />
      <Circle cx={52} cy={26} r={3} fill={c} opacity={0.5} />
      {/* Elbow dots close to body */}
      <Circle cx={32} cy={48} r={1.5} fill={c} opacity={0.6} />
      <Circle cx={50} cy={47} r={1.5} fill={c} opacity={0.6} />
      {/* Torso horizontal */}
      <Line x1={22} y1={55} x2={82} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms pressing — close elbows */}
      <Line x1={32} y1={55} x2={32} y2={42} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={42} x2={30} y2={28} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={56} x2={50} y2={40} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={40} x2={52} y2={26} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={68} y1={58} x2={90} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: press up */}
      <Line x1={41} y1={28} x2={41} y2={16} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={37} y1={20} x2={41} y2={16} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={45} y1={20} x2={41} y2={16} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
