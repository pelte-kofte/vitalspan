import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function InclinePushUpOnBox({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Incline push-up on box — hands elevated, body in plank angle */}
      <Circle cx={20} cy={38} r={4} fill={c} opacity={0.9} />
      <Circle cx={28} cy={44} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={48} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={52} cy={56} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={80} cy={70} r={2} fill={c} opacity={0.7} />
      <Circle cx={88} cy={78} r={2} fill={c} opacity={0.6} />
      {/* Hands on box */}
      <Circle cx={30} cy={52} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={56} r={2} fill={c} opacity={0.7} />
      {/* Box */}
      <Line x1={20} y1={60} x2={55} y2={60} stroke={c} strokeWidth={2} opacity={0.4} />
      <Line x1={20} y1={60} x2={20} y2={75} stroke={c} strokeWidth={1.5} opacity={0.3} />
      <Line x1={55} y1={60} x2={55} y2={75} stroke={c} strokeWidth={1.5} opacity={0.3} />
      {/* Torso plank line */}
      <Line x1={28} y1={44} x2={80} y2={70} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms to box */}
      <Line x1={36} y1={48} x2={30} y2={52} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={52} y1={56} x2={42} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={68} y1={62} x2={88} y2={78} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: push away from body */}
      <Line x1={28} y1={44} x2={18} y2={36} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={18} y1={40} x2={18} y2={36} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={22} y1={36} x2={18} y2={36} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
