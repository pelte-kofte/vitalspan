import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function CalfWallStretch({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Calf wall stretch — hands on wall, one leg back, heel down */}
      <Circle cx={34} cy={14} r={4} fill={c} opacity={0.9} />
      <Circle cx={36} cy={22} r={2} fill={c} opacity={0.7} />
      <Circle cx={28} cy={30} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={48} cy={30} r={2.5} fill={c} opacity={0.8} />
      {/* Torso leaning forward */}
      <Circle cx={40} cy={48} r={2.5} fill={c} opacity={0.8} />
      {/* Hips */}
      <Circle cx={38} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={54} cy={60} r={2} fill={c} opacity={0.7} />
      {/* Front knee bent */}
      <Circle cx={32} cy={72} r={2} fill={c} opacity={0.7} />
      <Circle cx={28} cy={86} r={2} fill={c} opacity={0.7} />
      <Circle cx={26} cy={94} r={2} fill={c} opacity={0.6} />
      {/* Rear leg straight, heel on floor */}
      <Circle cx={64} cy={66} r={2} fill={c} opacity={0.7} />
      <Circle cx={72} cy={80} r={2} fill={c} opacity={0.7} />
      <Circle cx={76} cy={92} r={2} fill={c} opacity={0.6} />
      {/* Hands on wall */}
      <Circle cx={14} cy={26} r={2} fill={c} opacity={0.7} />
      <Circle cx={18} cy={38} r={2} fill={c} opacity={0.7} />
      {/* Wall */}
      <Line x1={8} y1={10} x2={8} y2={90} stroke={c} strokeWidth={1.5} opacity={0.3} />
      {/* Torso */}
      <Line x1={36} y1={22} x2={40} y2={48} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={30} x2={48} y2={30} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Hands on wall */}
      <Line x1={28} y1={30} x2={14} y2={26} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={14} y1={26} x2={8} y2={26} stroke={c} strokeWidth={1} opacity={0.5} />
      <Line x1={28} y1={30} x2={18} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={18} y1={38} x2={8} y2={38} stroke={c} strokeWidth={1} opacity={0.5} />
      {/* Front leg bent */}
      <Line x1={40} y1={48} x2={38} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={38} y1={60} x2={32} y2={72} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={72} x2={28} y2={86} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={86} x2={26} y2={94} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Rear leg straight */}
      <Line x1={40} y1={48} x2={54} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={54} y1={60} x2={64} y2={66} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={66} x2={72} y2={80} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={72} y1={80} x2={76} y2={92} stroke={c} strokeWidth={1.5} opacity={0.5} />
    </Svg>
  );
}
