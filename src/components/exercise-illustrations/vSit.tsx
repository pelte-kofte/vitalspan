import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function VSit({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* V-sit — balanced on tailbone, legs and torso form a V */}
      <Circle cx={50} cy={22} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={30} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={38} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={58} cy={38} r={2.5} fill={c} opacity={0.8} />
      {/* Torso raised at 45 deg */}
      <Circle cx={50} cy={55} r={2.5} fill={c} opacity={0.8} />
      {/* Hips — balance point */}
      <Circle cx={50} cy={65} r={2} fill={c} opacity={0.7} />
      {/* Legs raised forming V */}
      <Circle cx={36} cy={52} r={2} fill={c} opacity={0.7} />
      <Circle cx={24} cy={40} r={2} fill={c} opacity={0.7} />
      <Circle cx={64} cy={52} r={2} fill={c} opacity={0.7} />
      <Circle cx={76} cy={40} r={2} fill={c} opacity={0.7} />
      {/* Arms extended alongside legs */}
      <Circle cx={38} cy={42} r={2} fill={c} opacity={0.6} />
      <Circle cx={62} cy={42} r={2} fill={c} opacity={0.6} />
      {/* Torso line */}
      <Line x1={50} y1={30} x2={50} y2={65} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={38} x2={58} y2={38} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arms along legs */}
      <Line x1={42} y1={38} x2={38} y2={42} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={38} x2={62} y2={42} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs raising */}
      <Line x1={50} y1={65} x2={36} y2={52} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={52} x2={24} y2={40} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={65} x2={64} y2={52} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={52} x2={76} y2={40} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* V shape emphasis */}
      <Line x1={24} y1={40} x2={50} y2={65} stroke={c} strokeWidth={1} opacity={0.3} />
      <Line x1={76} y1={40} x2={50} y2={65} stroke={c} strokeWidth={1} opacity={0.3} />
    </Svg>
  );
}
