// app/reports/components/products/LoadingSkeleton.tsx
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

export default function LoadingSkeleton() {
  return (
    <div className="grid">
      {/* Seletor de período */}
      <div className="col-12 mb-3 md:mb-4">
        <Card className="p-2 md:p-3">
          <div className="flex flex-wrap gap-1 md:gap-2">
            {['7', '30', '365', 'all'].map(value => (
              <Skeleton key={value} width="70px" height="32px" className="text-xs" />
            ))}
          </div>
          <Skeleton width="150px" height="16px" className="mt-2 text-xs" />
        </Card>
      </div>
      
      {/* Métricas */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="col-6 sm:col-6 md:col-3 mb-2 md:mb-3">
          <Card className="h-full p-2 md:p-3">
            <Skeleton width="50%" height="1.5rem" className="mb-1 md:mb-2 text-xs" />
            <Skeleton width="70%" height="0.9rem" className="mb-1 text-xs" />
            <Skeleton width="50%" height="0.8rem" className="text-xs" />
          </Card>
        </div>
      ))}
      
      {/* Gráficos principais */}
      <div className="col-12 lg:col-8 mb-2 md:mb-3">
        <Card className="h-full p-2 md:p-3">
          <Skeleton width="40%" height="1.2rem" className="mb-2 md:mb-3 text-xs" />
          <Skeleton width="100%" height="150px" className="text-xs" />
        </Card>
      </div>
      
      <div className="col-12 lg:col-4 mb-2 md:mb-3">
        <Card className="h-full p-2 md:p-3">
          <Skeleton width="50%" height="1.2rem" className="mb-2 md:mb-3 text-xs" />
          <Skeleton width="100%" height="150px" className="text-xs" />
        </Card>
      </div>
      
      {/* Tabelas */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="col-12 md:col-6 mb-2 md:mb-3">
          <Card className="h-full p-2 md:p-3">
            <Skeleton width="40%" height="1.2rem" className="mb-2 text-xs" />
            <Skeleton width="100%" height="100px" className="text-xs" />
          </Card>
        </div>
      ))}
    </div>
  );
}