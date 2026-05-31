import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface TabIconProps {
  color: string;
  focused: boolean;
  size?: number;
}

export function HomeIcon({ color, focused, size = 24 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Connection lines from focal center to orbit nodes */}
      <Line x1={12} y1={12} x2={5} y2={7} stroke={color} strokeWidth={1.5} />
      <Line x1={12} y1={12} x2={19} y2={7} stroke={color} strokeWidth={1.5} />
      <Line x1={12} y1={12} x2={12} y2={3} stroke={color} strokeWidth={1.5} />
      {/* Orbit nodes (stroke-only) */}
      <Circle cx={5} cy={7} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={19} cy={7} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={12} cy={3} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Focal node */}
      <Circle cx={12} cy={12} r={2.5} fill={focused ? color : 'none'} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function BiomarkersIcon({ color, focused, size = 24 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Left strand spine */}
      <Line x1={7} y1={4} x2={9} y2={12} stroke={color} strokeWidth={1.5} />
      <Line x1={9} y1={12} x2={7} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Right strand spine */}
      <Line x1={17} y1={4} x2={15} y2={12} stroke={color} strokeWidth={1.5} />
      <Line x1={15} y1={12} x2={17} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Cross-rungs */}
      <Line x1={7} y1={4} x2={17} y2={4} stroke={color} strokeWidth={1.5} />
      <Line x1={9} y1={12} x2={15} y2={12} stroke={color} strokeWidth={1.5} />
      <Line x1={7} y1={20} x2={17} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Left strand nodes */}
      <Circle cx={7} cy={4} r={1.5} fill={focused ? color : 'none'} stroke={color} strokeWidth={1.5} />
      <Circle cx={9} cy={12} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={7} cy={20} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Right strand nodes */}
      <Circle cx={17} cy={4} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={15} cy={12} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={17} cy={20} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function ProtocolIcon({ color, focused, size = 24 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Bond lines */}
      <Line x1={5} y1={14} x2={12} y2={10} stroke={color} strokeWidth={1.5} />
      <Line x1={12} y1={10} x2={19} y2={14} stroke={color} strokeWidth={1.5} />
      {/* Focal node */}
      <Circle cx={5} cy={14} r={2.5} fill={focused ? color : 'none'} stroke={color} strokeWidth={1.5} />
      {/* Secondary nodes */}
      <Circle cx={12} cy={10} r={1.8} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={19} cy={14} r={1.5} fill="none" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function ExerciseIcon({ color, focused, size = 24 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Top ellipse */}
      <Path
        d="M 6 8 A 6 5 0 1 1 18 8 A 6 5 0 1 1 6 8"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Bottom ellipse */}
      <Path
        d="M 6 16 A 6 5 0 1 0 18 16 A 6 5 0 1 0 6 16"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Focal node — top loop */}
      <Circle cx={12} cy={8} r={2} fill={focused ? color : 'none'} stroke={color} strokeWidth={1.5} />
      {/* Second node — bottom loop */}
      <Circle cx={12} cy={16} r={1.5} fill="none" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function ProfileIcon({ color, focused, size = 24 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Neck line */}
      <Line x1={12} y1={10} x2={12} y2={15} stroke={color} strokeWidth={1.5} />
      {/* Shoulder connections */}
      <Line x1={6} y1={16} x2={12} y2={18} stroke={color} strokeWidth={1.5} />
      <Line x1={12} y1={18} x2={18} y2={16} stroke={color} strokeWidth={1.5} />
      {/* Head — focal node */}
      <Circle cx={12} cy={7} r={3} fill={focused ? color : 'none'} stroke={color} strokeWidth={1.5} />
      {/* Shoulder nodes */}
      <Circle cx={6} cy={16} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={12} cy={18} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={18} cy={16} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}
