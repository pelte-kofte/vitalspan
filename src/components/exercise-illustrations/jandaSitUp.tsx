import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function JandaSitUp({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Janda sit-up — feet hooked, core engaged, raising torso */}
      <Circle cx={22} cy={38} r={4} fill={c} opacity={0.9} />
      <Circle cx={30} cy={45} r={2} fill={c} opacity={0.7} />
      <Circle cx={40} cy={52} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={55} cy={60} r={2.5} fill={c} opacity={0.8} />
      {/* Hips on floor */}
      <Circle cx={62} cy={65} r={2} fill={c} opacity={0.7} />
      {/* Knees bent up */}
      <Circle cx={72} cy={55} r={2} fill={c} opacity={0.7} />
      <Circle cx={80} cy={44} r={2} fill={c} opacity={0.7} />
      {/* Feet hooked */}
      <Circle cx={88} cy={56} r={2} fill={c} opacity={0.6} />
      <Circle cx={90} cy={68} r={2} fill={c} opacity={0.6} />
      {/* Arms crossed at chest */}
      <Circle cx={38} cy={44} r={2} fill={c} opacity={0.7} />
      <Circle cx={48} cy={48} r={2} fill={c} opacity={0.7} />
      {/* Torso raised at 45 deg */}
      <Line x1={30} y1={45} x2={55} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={40} y1={52} x2={62} y2={65} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arms crossed */}
      <Line x1={40} y1={52} x2={38} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={40} y1={52} x2={48} y2={48} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs bent */}
      <Line x1={62} y1={65} x2={72} y2={55} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={72} y1={55} x2={80} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={80} y1={44} x2={88} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={88} y1={56} x2={90} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: sit up */}
      <Line x1={22} y1={44} x2={14} y2={36} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={14} y1={40} x2={14} y2={36} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={18} y1={36} x2={14} y2={36} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
