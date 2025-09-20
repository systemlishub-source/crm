// app/reports/components/ChartContainer.tsx
'use client';

import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'polarArea' | 'radar';
  data: any;
  options: any;
  height: string;
  className?: string;
  children?: ReactNode;
}

export default function ChartContainer({ 
  title, 
  type, 
  data, 
  options, 
  height, 
  className = '',
  children 
}: ChartContainerProps) {
  return (
    <Card className={`shadow-1 border-1 surface-border ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-900">{title}</h3>
      <div className={height}>
        <Chart type={type} data={data} options={options} />
      </div>
      {children}
    </Card>
  );
}