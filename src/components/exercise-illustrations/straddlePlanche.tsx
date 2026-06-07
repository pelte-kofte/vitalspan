import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function StraddlePlanche({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Straddle planche — horizontal body balanced on hands, legs spread */}
      <Circle cx={14} cy={50} r={4} fill={c} opacity={0.9} />
      <Circle cx={24} cy={50} r={2} fill={c} opacity={0.7} />
      <Circle cx={35} cy={50} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={50} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={50} r={2} fill={c} opacity={0.7} />
      {/* Hips center */}
      <Circle cx={70} cy={50} r={2} fill={c} opacity={0.7} />
      {/* Legs spread wide in straddle */}
      <Circle cx={82} cy={38} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={28} r={2} fill={c} opacity={0.6} />
      <Circle cx={82} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={72} r={2} fill={c} opacity={0.6} />
      {/* Hands on floor */}
      <Circle cx={30} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={62} r={2} fill={c} opacity={0.7} />
      {/* Floor */}
      <Line x1={20} y1={68} x2={56} y2={68} stroke={c} strokeWidth={1} opacity={0.25} />
      {/* Torso horizontal */}
      <Line x1={24} y1={50} x2={70} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms pushing down */}
      <Line x1={35} y1={50} x2={30} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={50} x2={42} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Straddle legs */}
      <Line x1={70} y1={50} x2={82} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={82} y1={38} x2={90} y2={28} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={70} y1={50} x2={82} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={82} y1={62} x2={90} y2={72} stroke={c} strokeWidth={1.5} opacity={0.5} />
    </Svg>
  );
}
