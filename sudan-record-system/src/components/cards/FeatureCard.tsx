import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

/** Static feature highlight card for the dashboard footer grid. */
export function FeatureCard({ icon, title, description, onClick }: FeatureCardProps) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`card-base flex flex-col items-center gap-2 p-5 text-center transition ${
        onClick ? 'cursor-pointer hover:border-brand-200 hover:shadow-card-lg' : ''
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-charcoal">{title}</h3>
      <p className="text-xs leading-relaxed text-slate-500">{description}</p>
    </Wrapper>
  );
}
