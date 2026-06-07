import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function StandingLateralStretch({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Standing, arm raised over head, lateral lean */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      {/* Shoulders */}
      <Circle cx={34} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={66} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Arm raised right — reaching over */}
      <Circle cx={72} cy={16} r={2} fill={c} opacity={0.7} />
      <Circle cx={76} cy={8} r={2} fill={c} opacity={0.6} />
      {/* Left arm down */}
      <Circle cx={28} cy={40} r={2} fill={c} opacity={0.7} />
      {/* Torso angled slightly */}
      <Circle cx={52} cy={44} r={2.5} fill={c} opacity={0.8} />
      {/* Hips */}
      <Circle cx={44} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={58} r={2} fill={c} opacity={0.7} />
      {/* Knees, ankles */}
      <Circle cx={44} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={44} cy={90} r={2} fill={c} opacity={0.6} />
      <Circle cx={58} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Right arm raised */}
      <Line x1={66} y1={26} x2={72} y2={16} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={72} y1={16} x2={76} y2={8} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Left arm down */}
      <Line x1={34} y1={26} x2={28} y2={40} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={52} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={34} y1={26} x2={66} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Hips to legs */}
      <Line x1={52} y1={44} x2={44} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={52} y1={44} x2={58} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={44} y1={58} x2={44} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={58} y1={58} x2={58} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: lateral */}
      <Line x1={66} y1={50} x2={76} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={72} y1={46} x2={76} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={72} y1={54} x2={76} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
