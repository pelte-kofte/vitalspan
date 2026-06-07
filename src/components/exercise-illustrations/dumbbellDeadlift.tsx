import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellDeadlift({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Dumbbell deadlift — hinge, dumbbells at sides */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={35} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={65} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso hinged */}
      <Circle cx={48} cy={44} r={2.5} fill={c} opacity={0.8} />
      {/* Hips */}
      <Circle cx={40} cy={54} r={2} fill={c} opacity={0.7} />
      <Circle cx={60} cy={54} r={2} fill={c} opacity={0.7} />
      {/* Knees slightly bent */}
      <Circle cx={38} cy={70} r={2} fill={c} opacity={0.7} />
      <Circle cx={62} cy={70} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={86} r={2} fill={c} opacity={0.6} />
      <Circle cx={62} cy={86} r={2} fill={c} opacity={0.6} />
      {/* Arms hanging with dumbbells */}
      <Circle cx={28} cy={50} r={2} fill={c} opacity={0.7} />
      <Circle cx={72} cy={50} r={2} fill={c} opacity={0.7} />
      <Circle cx={26} cy={65} r={3} fill={c} opacity={0.5} />
      <Circle cx={74} cy={65} r={3} fill={c} opacity={0.5} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={48} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={35} y1={26} x2={65} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arms */}
      <Line x1={35} y1={26} x2={28} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={65} y1={26} x2={72} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={50} x2={26} y2={65} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={72} y1={50} x2={74} y2={65} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={48} y1={44} x2={40} y2={54} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={48} y1={44} x2={60} y2={54} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={40} y1={54} x2={38} y2={86} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={60} y1={54} x2={62} y2={86} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: upward */}
      <Line x1={50} y1={55} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={42} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={42} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
