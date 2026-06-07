import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellInclineRow({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Incline bench figure — torso angled ~30 deg prone */}
      <Circle cx={20} cy={35} r={4} fill={c} opacity={0.9} />
      <Circle cx={28} cy={40} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={43} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={55} cy={48} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={65} cy={54} r={2} fill={c} opacity={0.7} />
      <Circle cx={75} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={85} cy={72} r={2} fill={c} opacity={0.6} />
      {/* Arms hanging down with dumbbells */}
      <Circle cx={38} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={38} cy={68} r={2} fill={c} opacity={0.6} />
      <Circle cx={55} cy={63} r={2} fill={c} opacity={0.7} />
      <Circle cx={55} cy={73} r={2} fill={c} opacity={0.6} />
      {/* Torso line */}
      <Line x1={28} y1={40} x2={65} y2={54} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={38} y1={43} x2={55} y2={48} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Arms */}
      <Line x1={38} y1={43} x2={38} y2={68} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={55} y1={48} x2={55} y2={73} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs on bench */}
      <Line x1={65} y1={54} x2={85} y2={72} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Bench line */}
      <Line x1={15} y1={50} x2={90} y2={80} stroke={c} strokeWidth={1} opacity={0.3} />
      {/* Arrow: pull up */}
      <Line x1={38} y1={68} x2={38} y2={52} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={34} y1={56} x2={38} y2={52} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={42} y1={56} x2={38} y2={52} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
