import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function FrogCrunch({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Frog crunch — lying, knees out wide like frog, crunching up */}
      <Circle cx={20} cy={36} r={4} fill={c} opacity={0.9} />
      <Circle cx={30} cy={44} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={52} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={58} cy={58} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={64} r={2} fill={c} opacity={0.7} />
      {/* Knees wide to sides */}
      <Circle cx={52} cy={80} r={2} fill={c} opacity={0.7} />
      <Circle cx={76} cy={80} r={2} fill={c} opacity={0.7} />
      {/* Feet together */}
      <Circle cx={64} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Hands clasped behind head */}
      <Circle cx={24} cy={28} r={2} fill={c} opacity={0.7} />
      <Circle cx={34} cy={28} r={2} fill={c} opacity={0.7} />
      {/* Torso raised */}
      <Line x1={30} y1={44} x2={64} y2={64} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms behind head */}
      <Line x1={30} y1={44} x2={24} y2={28} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={52} x2={34} y2={28} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Frog legs — knees wide */}
      <Line x1={64} y1={64} x2={52} y2={80} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={64} x2={76} y2={80} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={52} y1={80} x2={64} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={76} y1={80} x2={64} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: crunch up */}
      <Line x1={20} y1={42} x2={12} y2={34} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={12} y1={38} x2={12} y2={34} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={16} y1={34} x2={12} y2={34} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
