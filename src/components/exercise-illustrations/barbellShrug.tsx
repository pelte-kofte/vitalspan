import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BarbellShrug({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={30} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={70} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={45} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={42} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={76} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={76} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={58} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Barbell */}
      <Line x1={20} y1={34} x2={80} y2={34} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={20} cy={34} r={3} fill={c} opacity={0.5} />
      <Circle cx={80} cy={34} r={3} fill={c} opacity={0.5} />
      {/* Hands grip barbell */}
      <Line x1={30} y1={26} x2={30} y2={34} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={70} y1={26} x2={70} y2={34} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={18} x2={50} y2={45} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={30} y1={26} x2={70} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      <Line x1={50} y1={45} x2={42} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={45} x2={58} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={60} x2={42} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={60} x2={58} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: upward shrug */}
      <Line x1={50} y1={32} x2={50} y2={22} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={26} x2={50} y2={22} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={26} x2={50} y2={22} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
