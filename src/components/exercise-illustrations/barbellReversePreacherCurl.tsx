import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { Colors } from '../../theme';

interface Props { size?: number }

export default function BarbellReversePreacherCurl({ size = 120 }: Props) {
  const c = Colors.accent;
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Reverse preacher curl — arms on pad, curling reverse grip */}
      <Circle cx={36} cy={12} r={4} fill={c} opacity={0.9} />
      <Circle cx={38} cy={20} r={2} fill={c} opacity={0.7} />
      <Circle cx={44} cy={28} r={2.5} fill={c} opacity={0.8} />
      <Circle cx={56} cy={28} r={2.5} fill={c} opacity={0.8} />
      {/* Torso leaning forward on pad */}
      <Circle cx={52} cy={46} r={2.5} fill={c} opacity={0.8} />
      {/* Hips seated */}
      <Circle cx={56} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={70} cy={62} r={2} fill={c} opacity={0.7} />
      <Circle cx={58} cy={78} r={2} fill={c} opacity={0.6} />
      <Circle cx={72} cy={78} r={2} fill={c} opacity={0.6} />
      {/* Preacher pad */}
      <Line x1={28} y1={50} x2={62} y2={50} stroke={c} strokeWidth={2} opacity={0.4} />
      <Line x1={28} y1={50} x2={22} y2={70} stroke={c} strokeWidth={1.5} opacity={0.3} />
      {/* Arms on pad, curling up */}
      <Circle cx={34} cy={42} r={2} fill={c} opacity={0.7} />
      <Circle cx={30} cy={32} r={2} fill={c} opacity={0.7} />
      {/* Barbell */}
      <Line x1={22} y1={30} x2={44} y2={30} stroke={c} strokeWidth={2} opacity={0.6} />
      <Circle cx={22} cy={30} r={2.5} fill={c} opacity={0.5} />
      <Circle cx={44} cy={30} r={2.5} fill={c} opacity={0.5} />
      {/* Arms */}
      <Line x1={44} y1={28} x2={34} y2={42} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={34} y1={42} x2={30} y2={32} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Torso */}
      <Line x1={38} y1={20} x2={52} y2={46} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={44} y1={28} x2={56} y2={28} stroke={c} strokeWidth={1.5} opacity={0.4} />
      {/* Seated legs */}
      <Line x1={52} y1={46} x2={56} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={52} y1={46} x2={70} y2={62} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={56} y1={62} x2={58} y2={78} stroke={c} strokeWidth={1.5} opacity={0.5} />
      <Line x1={70} y1={62} x2={72} y2={78} stroke={c} strokeWidth={1.5} opacity={0.5} />
      {/* Arrow: curl up */}
      <Line x1={30} y1={32} x2={26} y2={24} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={22} y1={28} x2={26} y2={24} stroke={c} strokeWidth={1.5} opacity={0.8} />
      <Line x1={26} y1={28} x2={26} y2={24} stroke={c} strokeWidth={1.5} opacity={0.8} />
    </Svg>
  );
}
