import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BackAndForthStep({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Back and forth step — walking/stepping motion, one leg forward */}
      <Circle cx={50} cy={10} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={18} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={26} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={62} cy={26} r={2.5} fill={c} opacity={0.8} />
      {/* Torso slight lean */}
      <Circle cx={50} cy={44} r={2.5} fill={c} opacity={0.8} />
      {/* Hips */}
      <Circle cx={44} cy={56} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={56} r={2} fill={c} opacity={0.7} />
      {/* Front leg forward */}
      <Circle cx={36} cy={68} r={2} fill={c} opacity={0.7} />
      <Circle cx={28} cy={82} r={2} fill={c} opacity={0.7} />
      <Circle cx={24} cy={92} r={2} fill={c} opacity={0.6} />
      {/* Back leg pushing off */}
      <Circle cx={66} cy={64} r={2} fill={c} opacity={0.7} />
      <Circle cx={74} cy={76} r={2} fill={c} opacity={0.7} />
      <Circle cx={78} cy={90} r={2} fill={c} opacity={0.6} />
      {/* Arms swinging opposite */}
      <Circle cx={30} cy={36} r={2} fill={c} opacity={0.7} />
      <Circle cx={70} cy={38} r={2} fill={c} opacity={0.7} />
      {/* Torso */}
      <Line x1={50} y1={18} x2={50} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={38} y1={26} x2={62} y2={26} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arms swing */}
      <Line x1={38} y1={26} x2={30} y2={36} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={62} y1={26} x2={70} y2={38} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Hips */}
      <Line x1={50} y1={44} x2={44} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={44} x2={58} y2={56} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Front leg */}
      <Line x1={44} y1={56} x2={36} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={68} x2={28} y2={82} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={28} y1={82} x2={24} y2={92} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Back leg */}
      <Line x1={58} y1={56} x2={66} y2={64} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={66} y1={64} x2={74} y2={76} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={74} y1={76} x2={78} y2={90} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: forward step */}
      <Line x1={40} y1={50} x2={32} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={32} y1={46} x2={32} y2={50} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={32} y1={50} x2={32} y2={54} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
