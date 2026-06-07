import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function CaptainsChairStraightLegRaise({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Captain's chair leg raise — arms on pads, legs raising straight */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      {/* Shoulders on arm pads */}
      <Circle cx={32} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Forearms horizontal on pads */}
      <Circle cx={22} cy={30} r={2} fill={c} opacity={0.7} />
      <Circle cx={78} cy={30} r={2} fill={c} opacity={0.7} />
      {/* Chair back */}
      <Line x1={18} y1={28} x2={18} y2={60} stroke={c} strokeWidth={1.5} opacity={0.3} />
      <Line x1={82} y1={28} x2={82} y2={60} stroke={c} strokeWidth={1.5} opacity={0.3} />
      {/* Torso hanging */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={56} r={2} fill={c} opacity={0.7} />
      {/* Legs raised straight horizontal */}
      <Circle cx={36} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={22} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={64} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={78} cy={62} r={2} fill={c} opacity={0.7} />
      {/* Torso lines */}
      <Line x1={50} y1={18} x2={50} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={32} y1={26} x2={68} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arm pads */}
      <Line x1={32} y1={26} x2={22} y2={30} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={68} y1={26} x2={78} y2={30} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs raised */}
      <Line x1={50} y1={56} x2={36} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={62} x2={22} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={56} x2={64} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={64} y1={62} x2={78} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: legs up */}
      <Line x1={50} y1={70} x2={50} y2={58} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={62} x2={50} y2={58} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={62} x2={50} y2={58} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
