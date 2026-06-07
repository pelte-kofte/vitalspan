import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BarbellFrontSquat({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Front squat — deep squat, bar in front rack */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      {/* Shoulders */}
      <Circle cx={34} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={66} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Front rack — arms up, bar on front delts */}
      <Circle cx={28} cy={22} r={2} fill={c} opacity={0.7} />
      <Circle cx={72} cy={22} r={2} fill={c} opacity={0.7} />
      <Line x1={20} y1={28} x2={80} y2={28} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={20} cy={28} r={3} fill={c} opacity={0.5} />
      <Circle cx={80} cy={28} r={3} fill={c} opacity={0.5} />
      {/* Torso upright */}
      <Circle cx={50} cy={46} r={2.5} fill={c} opacity={0.8} />
      {/* Hips low — deep squat */}
      <Circle cx={40} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={60} cy={62} r={2} fill={c} opacity={0.7} />
      {/* Knees wide, forward */}
      <Circle cx={28} cy={76} r={2} fill={c} opacity={0.7} />
      <Circle cx={72} cy={76} r={2} fill={c} opacity={0.7} />
      {/* Ankles */}
      <Circle cx={30} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={70} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Spine */}
      <Line x1={50} y1={18} x2={50} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={34} y1={26} x2={66} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Hips */}
      <Line x1={50} y1={46} x2={40} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={46} x2={60} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={40} y1={62} x2={28} y2={76} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={60} y1={62} x2={72} y2={76} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={76} x2={30} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={72} y1={76} x2={70} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: downward */}
      <Line x1={50} y1={50} x2={50} y2={65} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={61} x2={50} y2={65} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={61} x2={50} y2={65} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
