import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function SideToSideChin({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={25} cy={22} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={75} cy={22} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={30} cy={5} r={2} fill={c} opacity={0.7} />
      <Circle cx={70} cy={5} r={2} fill={c} opacity={0.7} />
      <Circle cx={50} cy={40} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={42} cy={55} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={55} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={72} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={72} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={88} r={2} fill={c} opacity={0.6} />
      <Circle cx={58} cy={88} r={2} fill={c} opacity={0.6} />
      <Line x1={25} y1={22} x2={30} y2={5} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={75} y1={22} x2={70} y2={5} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={18} x2={50} y2={40} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={25} y1={22} x2={75} y2={22} stroke={c} strokeWidth={1.5} opacity={0.4} />
      <Line x1={50} y1={40} x2={42} y2={55} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={40} x2={58} y2={55} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={55} x2={42} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={55} x2={58} y2={88} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={30} x2={50} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={18} x2={50} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={18} x2={50} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
