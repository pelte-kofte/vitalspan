import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function JumpingJacks({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Jumping jacks — arms and legs spread wide */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso */}
      <Circle cx={50} cy={46} r={2.5} fill={c} opacity={0.8} />
      {/* Hips */}
      <Circle cx={36} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={64} cy={60} r={2} fill={c} opacity={0.7} />
      {/* Legs wide */}
      <Circle cx={22} cy={76} r={2} fill={c} opacity={0.7} />
      <Circle cx={78} cy={76} r={2} fill={c} opacity={0.7} />
      <Circle cx={16} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={84} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Arms wide and up */}
      <Circle cx={18} cy={16} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={16} r={2} fill={c} opacity={0.7} />
      <Circle cx={12} cy={8} r={2} fill={c} opacity={0.6} />
      <Circle cx={88} cy={8} r={2} fill={c} opacity={0.6} />
      {/* Arms spread */}
      <Line x1={36} y1={26} x2={18} y2={16} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={18} y1={16} x2={12} y2={8} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={26} x2={82} y2={16} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={82} y1={16} x2={88} y2={8} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={50} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={26} x2={64} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Legs wide */}
      <Line x1={50} y1={46} x2={36} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={46} x2={64} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={60} x2={16} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={60} x2={84} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
    </Svg>
  );
}
