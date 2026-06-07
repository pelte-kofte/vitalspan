import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function SeatedWideAngleStretch({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Seated wide-angle stretch — legs spread wide, torso forward */}
      <Circle cx={50} cy={35} r={4} fill={c} opacity={0.9} />
      <Circle cx={50} cy={43} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={50} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={62} cy={50} r={2.5} fill={c} opacity={0.8} />
      {/* Torso leaning forward */}
      <Circle cx={50} cy={62} r={2.5} fill={c} opacity={0.8} />
      {/* Hips on ground */}
      <Circle cx={40} cy={72} r={2} fill={c} opacity={0.7} />
      <Circle cx={60} cy={72} r={2} fill={c} opacity={0.7} />
      {/* Left leg spread wide */}
      <Circle cx={18} cy={80} r={2} fill={c} opacity={0.7} />
      <Circle cx={10} cy={86} r={2} fill={c} opacity={0.6} />
      {/* Right leg spread wide */}
      <Circle cx={82} cy={80} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={86} r={2} fill={c} opacity={0.6} />
      {/* Arms reaching forward to floor */}
      <Circle cx={46} cy={74} r={2} fill={c} opacity={0.7} />
      <Circle cx={54} cy={74} r={2} fill={c} opacity={0.7} />
      {/* Torso forward lean */}
      <Line x1={50} y1={43} x2={50} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={38} y1={50} x2={62} y2={50} stroke={c} strokeWidth={1.5} opacity={0.4} />
      <Line x1={50} y1={62} x2={50} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Hips to legs */}
      <Line x1={50} y1={72} x2={18} y2={80} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={72} x2={82} y2={80} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={18} y1={80} x2={10} y2={86} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={82} y1={80} x2={90} y2={86} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms reaching */}
      <Line x1={38} y1={50} x2={46} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={62} y1={50} x2={54} y2={74} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: forward lean */}
      <Line x1={50} y1={56} x2={50} y2={70} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={66} x2={50} y2={70} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={66} x2={50} y2={70} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
