import React, { useMemo, useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

interface Props {
  intensity?: 'low' | 'medium' | 'high';
  tone?: 'calm' | 'alert' | 'vital';
}

const TONE_COLORS: Record<string, string> = {
  calm: Colors.viz.cyan,
  alert: Colors.viz.amber,
  vital: Colors.viz.bioGreen,
};

const INTENSITY_CONFIG = {
  low: { nodeCount: 16, maxOpacity: 0.22, minOpacity: 0.10, linkDistance: 160 },
  medium: { nodeCount: 22, maxOpacity: 0.30, minOpacity: 0.15, linkDistance: 170 },
  high: { nodeCount: 28, maxOpacity: 0.40, minOpacity: 0.20, linkDistance: 185 },
};

// Deterministic pseudo-random so positions are stable across renders
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223 >>> 0;
    return s / 0xffffffff;
  };
}

function buildNodes(count: number) {
  const rand = lcg(137);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 20 + rand() * (W - 40),
    y: 20 + rand() * (H * 0.9 - 40),
    r: 1.2 + rand() * 1.8,
    baseOpacity: 0.35 + rand() * 0.55,
    groupA: rand() > 0.5,
  }));
}

function buildLinks(
  nodes: ReturnType<typeof buildNodes>,
  linkDistance: number,
) {
  const links: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < linkDistance) {
        links.push({
          x1: nodes[i].x,
          y1: nodes[i].y,
          x2: nodes[j].x,
          y2: nodes[j].y,
          opacity: (1 - dist / linkDistance) * 0.55,
        });
      }
    }
  }
  return links;
}

// Pre-build at module level — stable across all instances with same intensity
const NODES_CACHE: Record<string, ReturnType<typeof buildNodes>> = {};
const LINKS_CACHE: Record<string, ReturnType<typeof buildLinks>> = {};

export default function NeuralGrid({ intensity = 'low', tone = 'calm' }: Props) {
  const cfg = INTENSITY_CONFIG[intensity];
  const color = TONE_COLORS[tone] ?? Colors.viz.cyan;

  const nodes = useMemo(() => {
    if (!NODES_CACHE[intensity]) NODES_CACHE[intensity] = buildNodes(cfg.nodeCount);
    return NODES_CACHE[intensity];
  }, [intensity, cfg.nodeCount]);

  const links = useMemo(() => {
    if (!LINKS_CACHE[intensity]) LINKS_CACHE[intensity] = buildLinks(nodes, cfg.linkDistance);
    return LINKS_CACHE[intensity];
  }, [intensity, nodes, cfg.linkDistance]);

  // Two staggered breathing phases create the illusion of independent node pulsing
  const breathA = useSharedValue(cfg.minOpacity);
  const breathB = useSharedValue(cfg.minOpacity);

  useEffect(() => {
    breathA.value = withRepeat(
      withSequence(
        withTiming(cfg.maxOpacity, {
          duration: 3600,
          easing: Easing.bezier(0.37, 0, 0.63, 1),
        }),
        withTiming(cfg.minOpacity, {
          duration: 3600,
          easing: Easing.bezier(0.37, 0, 0.63, 1),
        }),
      ),
      -1,
      false,
    );
    // Group B starts halfway into the cycle for a staggered effect
    breathB.value = withDelay(
      1800,
      withRepeat(
        withSequence(
          withTiming(cfg.maxOpacity, {
            duration: 4200,
            easing: Easing.bezier(0.37, 0, 0.63, 1),
          }),
          withTiming(cfg.minOpacity, {
            duration: 4200,
            easing: Easing.bezier(0.37, 0, 0.63, 1),
          }),
        ),
        -1,
        false,
      ),
    );
  }, [cfg.maxOpacity, cfg.minOpacity]);

  const styleA = useAnimatedStyle(() => ({ opacity: breathA.value }));
  const styleB = useAnimatedStyle(() => ({ opacity: breathB.value }));

  const nodesA = useMemo(() => nodes.filter(n => n.groupA), [nodes]);
  const nodesB = useMemo(() => nodes.filter(n => !n.groupA), [nodes]);

  return (
    <>
      {/* Static links — rendered once, no animation needed */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styleA]}
        pointerEvents="none"
      >
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          {links.map((l, i) => (
            <Line
              key={`l${i}`}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={color}
              strokeWidth={0.4}
              strokeOpacity={l.opacity}
            />
          ))}
          {nodesA.map(n => (
            <Circle
              key={`a${n.id}`}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={color}
              fillOpacity={n.baseOpacity}
            />
          ))}
        </Svg>
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFill, styleB]}
        pointerEvents="none"
      >
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          {nodesB.map(n => (
            <Circle
              key={`b${n.id}`}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={color}
              fillOpacity={n.baseOpacity}
            />
          ))}
        </Svg>
      </Animated.View>
    </>
  );
}
