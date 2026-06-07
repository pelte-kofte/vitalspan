import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function Plank({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Plank — fully horizontal, forearms on floor */}
      <Circle cx={14} cy={46} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={50} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={54} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={58} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={66} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={70} r={2} fill={c} opacity={0.6} />
      {/* Forearms on floor */}
      <Circle cx={24} cy={64} r={2} fill={c} opacity={0.7} />
      <Circle cx={16} cy={68} r={2} fill={c} opacity={0.6} />
      <Circle cx={38} cy={66} r={2} fill={c} opacity={0.7} />
      <Circle cx={30} cy={70} r={2} fill={c} opacity={0.6} />
      {/* Floor */}
      <Line x1={8} y1={74} x2={94} y2={80} stroke={c} strokeWidth={1} opacity={0.25} />
      {/* Torso straight horizontal */}
      <Line x1={22} y1={50} x2={82} y2={66} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={54} x2={50} y2={58} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Forearm supports */}
      <Line x1={32} y1={54} x2={24} y2={64} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={24} y1={64} x2={16} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={58} x2={38} y2={66} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={38} y1={66} x2={30} y2={70} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs straight */}
      <Line x1={68} y1={62} x2={90} y2={70} stroke={c} strokeWidth={1.5} opacity={0.5} />
    </Svg>
  );
}
