import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function ObliqueCrunches({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Oblique crunch — lying, knees to one side, rotating torso */}
      <Circle cx={20} cy={40} r={4} fill={c} opacity={0.9} />
      <Circle cx={30} cy={46} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={52} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={58} cy={58} r={2.5} fill={c} opacity={0.8} />
      {/* Hips */}
      <Circle cx={66} cy={62} r={2} fill={c} opacity={0.7} />
      {/* Knees bent, dropped to one side */}
      <Circle cx={74} cy={72} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={80} r={2} fill={c} opacity={0.7} />
      <Circle cx={88} cy={88} r={2} fill={c} opacity={0.6} />
      {/* Hands behind head */}
      <Circle cx={22} cy={30} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={28} r={2} fill={c} opacity={0.7} />
      {/* Torso — rotating */}
      <Line x1={30} y1={46} x2={66} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms/hands behind head */}
      <Line x1={30} y1={46} x2={22} y2={30} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={52} x2={32} y2={28} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs dropped to side */}
      <Line x1={66} y1={62} x2={74} y2={72} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={74} y1={72} x2={82} y2={80} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={82} y1={80} x2={88} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Rotation indicator */}
      <Line x1={42} y1={52} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arrow: rotational crunch up */}
      <Line x1={22} y1={40} x2={14} y2={32} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={14} y1={36} x2={14} y2={32} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={18} y1={32} x2={14} y2={32} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
