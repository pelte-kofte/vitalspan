import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function ScapulaPushUp({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Scapula push-up — plank position, scapulae protracting */}
      <Circle cx={14} cy={44} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={48} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={52} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={56} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={66} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={72} r={2} fill={c} opacity={0.6} />
      {/* Hands on floor */}
      <Circle cx={24} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={63} r={2} fill={c} opacity={0.7} />
      {/* Scapular retraction/protraction indicator — small arrow between shoulder blades */}
      <Circle cx={42} cy={50} r={1.5} fill={c} opacity={0.6} />
      <Circle cx={48} cy={52} r={1.5} fill={c} opacity={0.6} />
      {/* Torso */}
      <Line x1={22} y1={48} x2={82} y2={66} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arms to floor */}
      <Line x1={32} y1={52} x2={24} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={56} x2={38} y2={63} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={68} y1={60} x2={90} y2={72} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: scapula protract forward */}
      <Line x1={32} y1={52} x2={22} y2={46} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={22} y1={50} x2={22} y2={46} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={26} y1={46} x2={22} y2={46} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
