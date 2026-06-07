import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function InclinePushUpDepthJump({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Incline push-up depth jump — explosive jump off box to floor */}
      <Circle cx={18} cy={35} r={4} fill={c} opacity={0.9} />
      <Circle cx={26} cy={42} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={47} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={52} cy={54} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={80} cy={70} r={2} fill={c} opacity={0.7} />
      <Circle cx={88} cy={78} r={2} fill={c} opacity={0.6} />
      {/* Hands on box edge */}
      <Circle cx={30} cy={54} r={2} fill={c} opacity={0.7} />
      <Circle cx={44} cy={60} r={2} fill={c} opacity={0.7} />
      {/* Box */}
      <Line x1={20} y1={62} x2={56} y2={62} stroke={c} strokeWidth={2} opacity={0.4} />
      <Line x1={20} y1={62} x2={20} y2={80} stroke={c} strokeWidth={1.5} opacity={0.3} />
      <Line x1={56} y1={62} x2={56} y2={80} stroke={c} strokeWidth={1.5} opacity={0.3} />
      {/* Floor level */}
      <Line x1={56} y1={80} x2={94} y2={80} stroke={c} strokeWidth={1} opacity={0.25} />
      {/* Torso */}
      <Line x1={26} y1={42} x2={80} y2={70} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms to box */}
      <Line x1={36} y1={47} x2={30} y2={54} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={52} y1={54} x2={44} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={68} y1={62} x2={88} y2={78} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: jump off box downward/forward */}
      <Line x1={44} y1={60} x2={52} y2={68} stroke={c} strokeWidth={2} opacity={0.8} />
      <Line x1={48} y1={68} x2={52} y2={68} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={52} y1={64} x2={52} y2={68} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
