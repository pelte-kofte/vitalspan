import type { LivingSphereRendererContract } from '../../domain/livingSphere';

export function livingSphereAccessibilityProps(
  contract: LivingSphereRendererContract,
  interactive: boolean,
): { role: 'image' | 'button'; label: string; hint?: string } {
  return interactive
    ? {
      role: 'button',
      label: contract.accessibility.text,
      hint: 'Opens the detailed Living Sphere evidence view.',
    }
    : { role: 'image', label: contract.accessibility.text };
}
