import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function SideBridge({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Side bridge/plank — lying on side, hip raised, supported on forearm */}
      <Circle cx={14} cy={40} r={4} fill={c} opacity={0.9} />
      <Circle cx={22} cy={44} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={48} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={50} cy={54} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={65} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={80} cy={66} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={72} r={2} fill={c} opacity={0.6} />
      {/* Forearm on floor */}
      <Circle cx={22} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={14} cy={62} r={2} fill={c} opacity={0.6} />
      {/* Top arm raised */}
      <Circle cx={38} cy={44} r={2} fill={c} opacity={0.7} />
      <Circle cx={42} cy={34} r={2} fill={c} opacity={0.6} />
      {/* Floor line */}
      <Line x1={8} y1={72} x2={94} y2={82} stroke={c} strokeWidth={1} opacity={0.25} />
      {/* Torso line */}
      <Line x1={22} y1={44} x2={80} y2={66} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Forearm support */}
      <Line x1={32} y1={48} x2={22} y2={58} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={22} y1={58} x2={14} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Top arm raised */}
      <Line x1={32} y1={48} x2={38} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={38} y1={44} x2={42} y2={34} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={65} y1={60} x2={90} y2={72} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: hip up */}
      <Line x1={50} y1={54} x2={50} y2={40} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={46} y1={44} x2={50} y2={40} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={54} y1={44} x2={50} y2={40} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
