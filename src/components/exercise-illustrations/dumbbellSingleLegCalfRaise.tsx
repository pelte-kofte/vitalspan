import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellSingleLegCalfRaise({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Single leg calf raise — balanced on one foot, on toes */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={62} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      {/* Dumbbell at side */}
      <Circle cx={68} cy={42} r={2} fill={c} opacity={0.7} />
      <Circle cx={70} cy={56} r={3} fill={c} opacity={0.5} />
      {/* Other hand on wall */}
      <Circle cx={26} cy={40} r={2} fill={c} opacity={0.7} />
      <Circle cx={16} cy={40} r={2} fill={c} opacity={0.5} />
      {/* Wall */}
      <Line x1={12} y1={30} x2={12} y2={80} stroke={c} strokeWidth={1.5} opacity={0.3} />
      {/* Standing leg */}
      <Circle cx={48} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={46} cy={74} r={2} fill={c} opacity={0.7} />
      {/* On toe */}
      <Circle cx={44} cy={86} r={2} fill={c} opacity={0.7} />
      <Circle cx={40} cy={92} r={2} fill={c} opacity={0.6} />
      {/* Other leg raised */}
      <Circle cx={58} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={66} cy={72} r={2} fill={c} opacity={0.6} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={38} y1={26} x2={62} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Dumbbell arm */}
      <Line x1={62} y1={26} x2={68} y2={42} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={68} y1={42} x2={70} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Wall arm */}
      <Line x1={38} y1={26} x2={26} y2={40} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={26} y1={40} x2={16} y2={40} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Standing leg up to toe */}
      <Line x1={50} y1={44} x2={48} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={48} y1={58} x2={46} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={46} y1={74} x2={44} y2={86} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={44} y1={86} x2={40} y2={92} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Raised leg */}
      <Line x1={50} y1={44} x2={58} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={60} x2={66} y2={72} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: rise on toe */}
      <Line x1={44} y1={82} x2={42} y2={72} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={38} y1={76} x2={42} y2={72} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={42} y1={76} x2={42} y2={72} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
