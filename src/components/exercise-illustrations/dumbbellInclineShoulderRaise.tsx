import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function DumbbellInclineShoulderRaise({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Incline shoulder raise — lying on incline bench, arm raising forward */}
      <Circle cx={18} cy={38} r={4} fill={c} opacity={0.9} />
      <Circle cx={26} cy={44} r={2} fill={c} opacity={0.7} />
      <Circle cx={36} cy={48} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={52} cy={53} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={68} cy={58} r={2} fill={c} opacity={0.7} />
      <Circle cx={82} cy={64} r={2} fill={c} opacity={0.7} />
      <Circle cx={90} cy={70} r={2} fill={c} opacity={0.6} />
      {/* Arm raising forward */}
      <Circle cx={26} cy={32} r={2} fill={c} opacity={0.7} />
      <Circle cx={20} cy={22} r={3} fill={c} opacity={0.5} />
      {/* Other arm hanging */}
      <Circle cx={44} cy={60} r={2} fill={c} opacity={0.7} />
      <Circle cx={48} cy={70} r={3} fill={c} opacity={0.5} />
      {/* Bench */}
      <Line x1={12} y1={52} x2={94} y2={78} stroke={c} strokeWidth={1} opacity={0.3} />
      {/* Torso on bench */}
      <Line x1={26} y1={44} x2={82} y2={64} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Raising arm */}
      <Line x1={36} y1={48} x2={26} y2={32} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={26} y1={32} x2={20} y2={22} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Hanging arm */}
      <Line x1={52} y1={53} x2={44} y2={60} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={44} y1={60} x2={48} y2={70} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Legs on bench */}
      <Line x1={68} y1={58} x2={90} y2={70} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: raise forward/up */}
      <Line x1={20} y1={22} x2={14} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={14} y1={18} x2={14} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={18} y1={14} x2={14} y2={14} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
