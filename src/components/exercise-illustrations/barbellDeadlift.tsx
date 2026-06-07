import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BarbellDeadlift({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Deadlift hinge — torso forward, knees bent, bar at floor level */}
      <Circle cx={45} cy={12} r={4} fill={c} opacity={0.9} />
      <Circle cx={46} cy={20} r={2} fill={c} opacity={0.7} />
      {/* Shoulders */}
      <Circle cx={32} cy={28} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={58} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso hinged forward */}
      <Circle cx={50} cy={46} r={2.5} fill={c} opacity={0.8} />
      {/* Hips high */}
      <Circle cx={42} cy={52} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={52} r={2} fill={c} opacity={0.7} />
      {/* Knees bent */}
      <Circle cx={38} cy={70} r={2} fill={c} opacity={0.7} />
      <Circle cx={62} cy={70} r={2} fill={c} opacity={0.7} />
      {/* Ankles */}
      <Circle cx={36} cy={86} r={2} fill={c} opacity={0.6} />
      <Circle cx={64} cy={86} r={2} fill={c} opacity={0.6} />
      {/* Barbell at floor */}
      <Line x1={18} y1={90} x2={82} y2={90} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={18} cy={90} r={3.5} fill={c} opacity={0.5} />
      <Circle cx={82} cy={90} r={3.5} fill={c} opacity={0.5} />
      {/* Arms to bar */}
      <Line x1={32} y1={28} x2={36} y2={86} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={26} x2={64} y2={86} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Spine */}
      <Line x1={46} y1={20} x2={50} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={28} x2={58} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Legs */}
      <Line x1={50} y1={46} x2={42} y2={52} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={46} x2={58} y2={52} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={52} x2={36} y2={86} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={52} x2={64} y2={86} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: upward pull */}
      <Line x1={50} y1={56} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={42} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={42} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
