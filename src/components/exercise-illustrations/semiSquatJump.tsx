import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function SemiSquatJump({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Semi-squat jump — launching from squat, legs leaving ground */}
      <Circle cx={50} cy={8} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={16} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={24} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={24} r={2.5} fill={c} opacity={0.8} />
      {/* Torso */}
      <Circle cx={50} cy={42} r={2.5} fill={c} opacity={0.8} />
      {/* Hips slightly bent */}
      <Circle cx={42} cy={54} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={54} r={2} fill={c} opacity={0.7} />
      {/* Knees in air — semi-squat tuck */}
      <Circle cx={36} cy={68} r={2} fill={c} opacity={0.7} />
      <Circle cx={64} cy={68} r={2} fill={c} opacity={0.7} />
      {/* Feet off floor */}
      <Circle cx={32} cy={80} r={2} fill={c} opacity={0.6} />
      <Circle cx={68} cy={80} r={2} fill={c} opacity={0.6} />
      {/* Arms swinging up */}
      <Circle cx={24} cy={16} r={2} fill={c} opacity={0.7} />
      <Circle cx={76} cy={16} r={2} fill={c} opacity={0.7} />
      {/* Torso */}
      <Line x1={50} y1={16} x2={50} y2={42} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={24} x2={64} y2={24} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arms swinging up */}
      <Line x1={36} y1={24} x2={24} y2={16} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={24} x2={76} y2={16} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs semi-squat tuck */}
      <Line x1={50} y1={42} x2={42} y2={54} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={42} x2={58} y2={54} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={54} x2={36} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={54} x2={64} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={68} x2={32} y2={80} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={68} x2={68} y2={80} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: explode upward */}
      <Line x1={50} y1={30} x2={50} y2={16} stroke={c} strokeWidth={2} opacity={0.8} />
      <Line x1={46} y1={20} x2={50} y2={16} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={20} x2={50} y2={16} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
