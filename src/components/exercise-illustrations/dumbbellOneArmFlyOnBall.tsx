import React from 'react';
import Svg, { Circle, Line, Ellipse } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellOneArmFlyOnBall({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Fly on stability ball — back on ball, one arm fly */}
      {/* Ball */}
      <Ellipse cx={50} cy={72} rx={28} ry={16} stroke={c} strokeWidth={1} fill="none" opacity={0.3} />
      <Circle cx={12} cy={58} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={56} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={58} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={60} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={62} r={2} fill={c} opacity={0.7} />
      {/* Feet on floor */}
      <Circle cx={62} cy={82} r={2} fill={c} opacity={0.7} />
      <Circle cx={78} cy={82} r={2} fill={c} opacity={0.7} />
      <Circle cx={60} cy={92} r={2} fill={c} opacity={0.6} />
      <Circle cx={80} cy={92} r={2} fill={c} opacity={0.6} />
      {/* Flying arm extended */}
      <Circle cx={28} cy={46} r={2} fill={c} opacity={0.7} />
      <Circle cx={22} cy={36} r={2} fill={c} opacity={0.6} />
      <Circle cx={18} cy={26} r={3} fill={c} opacity={0.5} />
      {/* Other arm up */}
      <Circle cx={50} cy={48} r={2} fill={c} opacity={0.7} />
      <Circle cx={50} cy={38} r={3} fill={c} opacity={0.5} />
      {/* Torso on ball */}
      <Line x1={22} y1={56} x2={68} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Flying arm arc */}
      <Line x1={32} y1={58} x2={28} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={46} x2={22} y2={36} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={22} y1={36} x2={18} y2={26} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Up arm */}
      <Line x1={50} y1={60} x2={50} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs bent */}
      <Line x1={68} y1={62} x2={62} y2={82} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={68} y1={62} x2={78} y2={82} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={62} y1={82} x2={60} y2={92} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={78} y1={82} x2={80} y2={92} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: arc inward */}
      <Line x1={22} y1={36} x2={30} y2={30} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={30} y1={34} x2={30} y2={30} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={26} y1={30} x2={30} y2={30} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
