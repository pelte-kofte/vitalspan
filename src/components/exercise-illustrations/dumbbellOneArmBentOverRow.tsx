import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellOneArmBentOverRow({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Head */}
      <Circle cx={25} cy={30} r={4} fill={c} opacity={0.9} />
      <Circle cx={30} cy={38} r={2} fill={c} opacity={0.7} />
      {/* Torso bent at 45 deg */}
      <Circle cx={38} cy={44} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={60} cy={52} r={2.5} fill={c} opacity={0.8} />
      {/* Hips up */}
      <Circle cx={68} cy={45} r={2} fill={c} opacity={0.7} />
      <Circle cx={76} cy={38} r={2} fill={c} opacity={0.7} />
      {/* Pulling arm down */}
      <Circle cx={38} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={72} r={2} fill={c} opacity={0.6} />
      {/* Support arm */}
      <Circle cx={20} cy={52} r={2} fill={c} opacity={0.7} />
      {/* Knees + ankles */}
      <Circle cx={60} cy={68} r={2} fill={c} opacity={0.7} />
      <Circle cx={76} cy={68} r={2} fill={c} opacity={0.7} />
      <Circle cx={60} cy={85} r={2} fill={c} opacity={0.6} />
      <Circle cx={76} cy={85} r={2} fill={c} opacity={0.6} />
      {/* Torso line */}
      <Line x1={30} y1={38} x2={60} y2={52} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={38} y1={44} x2={68} y2={45} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Pulling arm */}
      <Line x1={38} y1={44} x2={38} y2={72} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Support */}
      <Line x1={38} y1={44} x2={20} y2={52} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={60} y1={52} x2={60} y2={85} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={76} y1={38} x2={76} y2={85} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: pull upward */}
      <Line x1={38} y1={72} x2={38} y2={56} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={34} y1={60} x2={38} y2={56} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={42} y1={60} x2={38} y2={56} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
