// app/reports/components/MetricCard.tsx
'use client';

import { Card } from 'primereact/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  description: string;
  className?: string;
}

export default function MetricCard({ title, value, subtitle, description, className = '' }: MetricCardProps) {
  return (
    <Card className={`h-full shadow-1 border-1 surface-border ${className}`}>
      <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
        {value}
      </div>
      <p className="text-sm md:text-base text-600 m-0">{title}</p>
      <small className="text-500 text-xs md:text-sm">{description}</small>
    </Card>
  );
}