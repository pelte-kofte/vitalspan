import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellArnoldPress({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Arnold press — seated, arms pressing overhead with rotation */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={34} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={66} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso seated */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={40} cy={56} r={2} fill={c} opacity={0.7} />
      <Circle cx={60} cy={56} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={72} r={2} fill={c} opacity={0.7} />
      <Circle cx={62} cy={72} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={88} r={2} fill={c} opacity={0.6} />
      <Circle cx={62} cy={88} r={2} fill={c} opacity={0.6} />
      {/* Arms pressing overhead — elbows flared */}
      <Circle cx={22} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={78} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={20} cy={8} r={3} fill={c} opacity={0.5} />
      <Circle cx={80} cy={8} r={3} fill={c} opacity={0.5} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={34} y1={26} x2={66} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arms pressing up + rotating */}
      <Line x1={34} y1={26} x2={22} y2={18} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={22} y1={18} x2={20} y2={8} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={66} y1={26} x2={78} y2={18} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={78} y1={18} x2={80} y2={8} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Seated legs */}
      <Line x1={50} y1={44} x2={40} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={44} x2={60} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={40} y1={56} x2={38} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={60} y1={56} x2={62} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: press up */}
      <Line x1={50} y1={22} x2={50} y2={12} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={16} x2={50} y2={12} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={16} x2={50} y2={12} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
