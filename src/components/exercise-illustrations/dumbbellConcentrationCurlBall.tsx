import React from 'react';
import Svg, { Circle, Line, Ellipse } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellConcentrationCurlBall({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Concentration curl on ball — seated on ball, elbow on thigh */}
      {/* Ball */}
      <Ellipse cx={56} cy={72} rx={24} ry={14} stroke={c} strokeWidth={1} fill="none" opacity={0.3} />
      <Circle cx={40} cy={18} r={4} fill={c} opacity={0.9} />
      <Circle cx={44} cy={26} r={2} fill={c} opacity={0.7} />
      <Circle cx={52} cy={32} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={64} cy={32} r={2.5} fill={c} opacity={0.8} />
      {/* Torso leaning forward */}
      <Circle cx={60} cy={50} r={2.5} fill={c} opacity={0.8} />
      {/* Hips on ball */}
      <Circle cx={50} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={68} cy={62} r={2} fill={c} opacity={0.7} />
      {/* Feet on floor */}
      <Circle cx={42} cy={80} r={2} fill={c} opacity={0.7} />
      <Circle cx={76} cy={80} r={2} fill={c} opacity={0.7} />
      <Circle cx={40} cy={92} r={2} fill={c} opacity={0.6} />
      <Circle cx={78} cy={92} r={2} fill={c} opacity={0.6} />
      {/* Curling arm — elbow on thigh */}
      <Circle cx={42} cy={42} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={32} r={2} fill={c} opacity={0.7} />
      <Circle cx={32} cy={22} r={3} fill={c} opacity={0.5} />
      {/* Other arm on knee */}
      <Circle cx={72} cy={44} r={2} fill={c} opacity={0.6} />
      {/* Torso */}
      <Line x1={44} y1={26} x2={60} y2={50} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={52} y1={32} x2={64} y2={32} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Curling arm */}
      <Line x1={52} y1={32} x2={42} y2={42} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={42} y1={42} x2={36} y2={32} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={36} y1={32} x2={32} y2={22} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Other arm on knee */}
      <Line x1={64} y1={32} x2={72} y2={44} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs */}
      <Line x1={60} y1={50} x2={50} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={60} y1={50} x2={68} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={50} y1={62} x2={42} y2={92} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={68} y1={62} x2={78} y2={92} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: curl up */}
      <Line x1={32} y1={22} x2={28} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={24} y1={18} x2={28} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={28} y1={18} x2={28} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
