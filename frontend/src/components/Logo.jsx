import { Shield } from 'lucide-react';

/**
 * Company logo mark for TDC Matchmaker.
 * Uses a shield icon to convey trust and professionalism.
 */
export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: { container: 'h-10 w-10', icon: 20 },
    md: { container: 'h-12 w-12', icon: 24 },
    lg: { container: 'h-14 w-14', icon: 28 },
  };

  const { container, icon } = sizes[size] || sizes.md;

  return (
    <div
      className={`${container} flex items-center justify-center rounded-xl bg-indigo-600 shadow-sm`}
    >
      <Shield className="text-white" size={icon} strokeWidth={2} />
    </div>
  );
}
