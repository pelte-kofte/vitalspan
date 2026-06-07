import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function ThreeFourSitUp({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* 3/4 sit-up — torso raised to 3/4 height, knees bent */}
      <Circle cx={28} cy={30} r={4} fill={c} opacity={0.9} />
      <Circle cx={36} cy={38} r={2} fill={c} opacity={0.7} />
      <Circle cx={44} cy={46} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={58} cy={56} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={64} r={2} fill={c} opacity={0.7} />
      {/* Knees bent */}
      <Circle cx={72} cy={76} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={76} r={2} fill={c} opacity={0.7} />
      <Circle cx={78} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={88} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Arms reaching forward */}
      <Circle cx={52} cy={38} r={2} fill={c} opacity={0.7} />
      <Circle cx={60} cy={44} r={2} fill={c} opacity={0.7} />
      {/* Torso at 60-75 deg */}
      <Line x1={36} y1={38} x2={64} y2={64} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms extended */}
      <Line x1={44} y1={46} x2={52} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={44} y1={46} x2={60} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Hips to legs */}
      <Line x1={64} y1={64} x2={72} y2={76} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={64} x2={82} y2={76} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={72} y1={76} x2={78} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={82} y1={76} x2={88} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: sit up */}
      <Line x1={28} y1={36} x2={20} y2={26} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={20} y1={30} x2={20} y2={26} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={24} y1={26} x2={20} y2={26} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
