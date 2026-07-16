import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
}

// --- GROUP 1: Original 10 ---

export function SearchIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Lens */}
      <Circle cx={10} cy={10} r={6} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Handle */}
      <Line x1={14.5} y1={14.5} x2={20} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Neural dots on lens circle */}
      <Circle cx={10} cy={4} r={1} fill={color} />
      <Circle cx={15.2} cy={7} r={1} fill={color} />
      <Circle cx={4.8} cy={7} r={1} fill={color} />
    </Svg>
  );
}

export function SuccessCheckIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Outer ring */}
      <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Checkmark stroke */}
      <Path
        d="M7.5 12 L10.5 15 L16.5 9"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Neural dot at checkmark apex */}
      <Circle cx={10.5} cy={15} r={1} fill={color} />
    </Svg>
  );
}

export function GoalTimerIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Top horizontal bar */}
      <Line x1={6} y1={4} x2={18} y2={4} stroke={color} strokeWidth={1.5} />
      {/* Bottom horizontal bar */}
      <Line x1={6} y1={20} x2={18} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Left hourglass sides */}
      <Line x1={6} y1={4} x2={12} y2={12} stroke={color} strokeWidth={1.5} />
      <Line x1={12} y1={12} x2={6} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Right hourglass sides */}
      <Line x1={18} y1={4} x2={12} y2={12} stroke={color} strokeWidth={1.5} />
      <Line x1={12} y1={12} x2={18} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Neural dots at corners and pinch point */}
      <Circle cx={6} cy={4} r={1} fill={color} />
      <Circle cx={18} cy={4} r={1} fill={color} />
      <Circle cx={12} cy={12} r={1} fill={color} />
      <Circle cx={6} cy={20} r={1} fill={color} />
      <Circle cx={18} cy={20} r={1} fill={color} />
    </Svg>
  );
}

export function GoalSparkIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Zigzag bolt shape */}
      <Path
        d="M13 2 L6 13 L12 13 L11 22 L18 11 L12 11 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Neural dots at bend points */}
      <Circle cx={13} cy={2} r={1} fill={color} />
      <Circle cx={6} cy={13} r={1} fill={color} />
      <Circle cx={18} cy={11} r={1} fill={color} />
      <Circle cx={11} cy={22} r={1} fill={color} />
    </Svg>
  );
}

export function GoalDnaIcon({ color, size = 24 }: IconProps) {
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
      <Circle cx={7} cy={4} r={1.5} fill={color} stroke={color} strokeWidth={1.5} />
      <Circle cx={9} cy={12} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={7} cy={20} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Right strand nodes */}
      <Circle cx={17} cy={4} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={15} cy={12} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={17} cy={20} r={1.2} fill="none" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function GoalChartIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Baseline */}
      <Line x1={3} y1={20} x2={21} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Left bar — short */}
      <Line x1={7} y1={16} x2={7} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Center bar — medium */}
      <Line x1={12} y1={12} x2={12} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Right bar — tall */}
      <Line x1={17} y1={7} x2={17} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Neural dots at top of each bar */}
      <Circle cx={7} cy={16} r={1.2} fill={color} />
      <Circle cx={12} cy={12} r={1.2} fill={color} />
      <Circle cx={17} cy={7} r={1.2} fill={color} />
    </Svg>
  );
}

export function CheckmarkIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 12 L10 17 L19 7"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9 5 L16 12 L9 19"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PillIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Capsule outline — rotated */}
      <Path
        d="M8 4 Q4 4 4 8 L4 16 Q4 20 8 20 L16 20 Q20 20 20 16 L20 8 Q20 4 16 4 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Center dividing line */}
      <Line x1={4} y1={12} x2={20} y2={12} stroke={color} strokeWidth={1.5} />
      {/* Neural dots at each end */}
      <Circle cx={12} cy={4} r={1.5} fill={color} />
      <Circle cx={12} cy={20} r={1.5} fill={color} />
    </Svg>
  );
}

export function RunnerIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Head */}
      <Circle cx={14} cy={5} r={2} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Torso */}
      <Line x1={14} y1={7} x2={12} y2={13} stroke={color} strokeWidth={1.5} />
      {/* Forward leg */}
      <Line x1={12} y1={13} x2={16} y2={19} stroke={color} strokeWidth={1.5} />
      {/* Back leg */}
      <Line x1={12} y1={13} x2={8} y2={17} stroke={color} strokeWidth={1.5} />
      {/* Forward arm */}
      <Line x1={13} y1={9} x2={18} y2={11} stroke={color} strokeWidth={1.5} />
      {/* Back arm */}
      <Line x1={13} y1={9} x2={9} y2={7} stroke={color} strokeWidth={1.5} />
      {/* Neural dots at joints */}
      <Circle cx={12} cy={13} r={1} fill={color} />
      <Circle cx={13} cy={9} r={1} fill={color} />
    </Svg>
  );
}

// DnaIcon: backward-compat alias for GoalDnaIcon
export const DnaIcon = GoalDnaIcon;

// --- GROUP 2: New icons for emoji sweeps in P4, P5, P6 ---

export function BellIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Bell body */}
      <Path
        d="M5 16 Q5 10 12 10 Q19 10 19 16 L5 16"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Bell base flat */}
      <Line x1={5} y1={16} x2={19} y2={16} stroke={color} strokeWidth={1.5} />
      {/* Bell stem at top */}
      <Line x1={12} y1={7} x2={12} y2={10} stroke={color} strokeWidth={1.5} />
      {/* Top arc cap */}
      <Circle cx={12} cy={7} r={1} fill={color} />
      {/* Clapper dot */}
      <Circle cx={12} cy={19} r={1.5} fill={color} />
    </Svg>
  );
}

// DnaHelixIcon: alias for GoalDnaIcon (replaces 🧬 in DashboardScreen emptyState)
export const DnaHelixIcon = GoalDnaIcon;

export function ClipboardIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Clipboard body */}
      <Path
        d="M8 4 L5 4 Q4 4 4 5 L4 21 Q4 22 5 22 L19 22 Q20 22 20 21 L20 5 Q20 4 19 4 L16 4"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Top clip */}
      <Path
        d="M9 3 Q9 2 12 2 Q15 2 15 3 L15 5 Q15 6 12 6 Q9 6 9 5 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Content lines */}
      <Line x1={8} y1={10} x2={16} y2={10} stroke={color} strokeWidth={1.5} />
      <Line x1={8} y1={14} x2={16} y2={14} stroke={color} strokeWidth={1.5} />
      <Line x1={8} y1={18} x2={13} y2={18} stroke={color} strokeWidth={1.5} />
      {/* Neural dot */}
      <Circle cx={12} cy={6} r={1} fill={color} />
    </Svg>
  );
}

export function CameraIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Camera body */}
      <Path
        d="M2 9 Q2 8 3 8 L7 8 L9 5 L15 5 L17 8 L21 8 Q22 8 22 9 L22 19 Q22 20 21 20 L3 20 Q2 20 2 19 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Lens */}
      <Circle cx={12} cy={13} r={4} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Shutter indicator */}
      <Circle cx={18} cy={10} r={1} fill={color} />
      {/* Neural dot at lens rim */}
      <Circle cx={12} cy={9} r={1} fill={color} />
    </Svg>
  );
}

export function TargetIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Outer ring */}
      <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Middle ring */}
      <Circle cx={12} cy={12} r={5} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Inner filled dot */}
      <Circle cx={12} cy={12} r={1.5} fill={color} />
    </Svg>
  );
}

export function MicroscopeIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Vertical stand */}
      <Line x1={12} y1={4} x2={12} y2={14} stroke={color} strokeWidth={1.5} />
      {/* Arm — angled */}
      <Line x1={12} y1={8} x2={17} y2={6} stroke={color} strokeWidth={1.5} />
      {/* Eyepiece */}
      <Circle cx={12} cy={4} r={2} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Objective / filled dot */}
      <Circle cx={12} cy={14} r={1.5} fill={color} />
      {/* Base line */}
      <Line x1={7} y1={20} x2={17} y2={20} stroke={color} strokeWidth={1.5} />
      {/* Stand to base */}
      <Line x1={12} y1={14} x2={12} y2={20} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function WarningIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Triangle outline */}
      <Path
        d="M12 3 L22 21 L2 21 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Exclamation body */}
      <Line x1={12} y1={10} x2={12} y2={15} stroke={color} strokeWidth={1.5} />
      {/* Exclamation dot */}
      <Circle cx={12} cy={18} r={1} fill={color} />
    </Svg>
  );
}

export function PersonIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Head */}
      <Circle cx={12} cy={7} r={4} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Shoulders / body arc */}
      <Path
        d="M4 21 Q4 14 12 14 Q20 14 20 21"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Neural dot at crown */}
      <Circle cx={12} cy={3} r={1} fill={color} />
    </Svg>
  );
}

// --- GROUP 3: SettingsScreen row icons ---

export function ShieldIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Shield shape */}
      <Path
        d="M12 3 L19 6 L19 12 Q19 17 12 21 Q5 17 5 12 L5 6 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Neural dot at top */}
      <Circle cx={12} cy={3} r={1} fill={color} />
    </Svg>
  );
}

// ChartBarIcon: alias for GoalChartIcon (replaces 📊 in SettingsScreen)
export const ChartBarIcon = GoalChartIcon;

export function RulerIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Diagonal ruler body */}
      <Path
        d="M3 21 L21 3"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Perpendicular tick marks along the ruler */}
      <Line x1={6} y1={15} x2={9} y2={18} stroke={color} strokeWidth={1.5} />
      <Line x1={10} y1={11} x2={13} y2={14} stroke={color} strokeWidth={1.5} />
      <Line x1={14} y1={7} x2={17} y2={10} stroke={color} strokeWidth={1.5} />
      {/* Neural dot at one end */}
      <Circle cx={3} cy={21} r={1} fill={color} />
    </Svg>
  );
}

export function ShareIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Vertical arrow shaft */}
      <Line x1={12} y1={3} x2={12} y2={15} stroke={color} strokeWidth={1.5} />
      {/* Arrow head */}
      <Line x1={8} y1={7} x2={12} y2={3} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={16} y1={7} x2={12} y2={3} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {/* Base platform */}
      <Line x1={5} y1={17} x2={5} y2={21} stroke={color} strokeWidth={1.5} />
      <Line x1={19} y1={17} x2={19} y2={21} stroke={color} strokeWidth={1.5} />
      <Line x1={5} y1={21} x2={19} y2={21} stroke={color} strokeWidth={1.5} />
      {/* Neural dots at arrowhead corners */}
      <Circle cx={8} cy={7} r={1} fill={color} />
      <Circle cx={16} cy={7} r={1} fill={color} />
    </Svg>
  );
}

export function TrashIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Lid top */}
      <Line x1={4} y1={7} x2={20} y2={7} stroke={color} strokeWidth={1.5} />
      {/* Lid handle */}
      <Path
        d="M9 7 L9 5 Q9 4 12 4 Q15 4 15 5 L15 7"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Body */}
      <Path
        d="M5 7 L6 20 Q6 21 7 21 L17 21 Q18 21 18 20 L19 7"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Interior vertical slots */}
      <Line x1={10} y1={10} x2={10} y2={18} stroke={color} strokeWidth={1.5} />
      <Line x1={14} y1={10} x2={14} y2={18} stroke={color} strokeWidth={1.5} />
      {/* Neural dot on lid */}
      <Circle cx={12} cy={7} r={1} fill={color} />
    </Svg>
  );
}

export function RefreshIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Top arc (clockwise arrow) */}
      <Path
        d="M20 12 A8 8 0 0 0 4 12"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Bottom arc (clockwise arrow) */}
      <Path
        d="M4 12 A8 8 0 0 0 20 12"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Arrow tip at top arc end */}
      <Path
        d="M20 12 L17 9"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M20 12 L23 9"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Neural dots at arrow tips */}
      <Circle cx={20} cy={12} r={1} fill={color} />
      <Circle cx={4} cy={12} r={1} fill={color} />
    </Svg>
  );
}

export function StarIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* 5-point star outline */}
      <Path
        d="M12 2 L15.1 8.3 L22 9.3 L17 14.1 L18.2 21 L12 17.8 L5.8 21 L7 14.1 L2 9.3 L8.9 8.3 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Neural dot at top point */}
      <Circle cx={12} cy={2} r={1} fill={color} />
    </Svg>
  );
}

// --- GROUP 4: Gap-closure additions (Phase 13 human UAT) ---

export function GearIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Inner gear hub */}
      <Circle cx={12} cy={12} r={3} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Outer gear ring */}
      <Circle cx={12} cy={12} r={7} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="3.5 2.5" />
      {/* Neural dots at cardinal teeth */}
      <Circle cx={12} cy={4.5} r={1} fill={color} />
      <Circle cx={19.5} cy={12} r={1} fill={color} />
      <Circle cx={12} cy={19.5} r={1} fill={color} />
      <Circle cx={4.5} cy={12} r={1} fill={color} />
    </Svg>
  );
}

export function InfoIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Outer circle */}
      <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.5} />
      {/* Info stem */}
      <Line x1={12} y1={11} x2={12} y2={17} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {/* Neural dot for the i-dot */}
      <Circle cx={12} cy={8} r={1.25} fill={color} />
    </Svg>
  );
}

export function LockIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Lock body */}
      <Path
        d="M5 11 L5 20 L19 20 L19 11 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Shackle arc */}
      <Path
        d="M8 11 L8 7 A4 4 0 0 1 16 7 L16 11"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Neural dot at shackle top */}
      <Circle cx={12} cy={6} r={1} fill={color} />
      {/* Keyhole dot */}
      <Circle cx={12} cy={15.5} r={1.5} fill={color} />
    </Svg>
  );
}
