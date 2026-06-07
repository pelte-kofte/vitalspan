import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BarbellLowBarSquat({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Low bar squat — bar below traps, torso more forward lean */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={34} cy={28} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={66} cy={28} r={2.5} fill={c} opacity={0.8} />
      {/* Low bar position */}
      <Line x1={18} y1={34} x2={82} y2={34} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={18} cy={34} r={3} fill={c} opacity={0.5} />
      <Circle cx={82} cy={34} r={3} fill={c} opacity={0.5} />
      {/* Torso leaning forward more than front squat */}
      <Circle cx={48} cy={50} r={2.5} fill={c} opacity={0.8} />
      {/* Hips low */}
      <Circle cx={38} cy={65} r={2} fill={c} opacity={0.7} />
      <Circle cx={62} cy={65} r={2} fill={c} opacity={0.7} />
      {/* Knees */}
      <Circle cx={32} cy={78} r={2} fill={c} opacity={0.7} />
      <Circle cx={68} cy={78} r={2} fill={c} opacity={0.7} />
      {/* Ankles */}
      <Circle cx={33} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={67} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={48} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={34} y1={28} x2={66} y2={28} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Hips */}
      <Line x1={48} y1={50} x2={38} y2={65} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={48} y1={50} x2={62} y2={65} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={38} y1={65} x2={32} y2={78} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={62} y1={65} x2={68} y2={78} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={78} x2={33} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={68} y1={78} x2={67} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: downward */}
      <Line x1={50} y1={54} x2={50} y2={68} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={64} x2={50} y2={68} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={64} x2={50} y2={68} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
