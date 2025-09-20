// app/reports/components/employees/EmployeeCardsGrid.tsx
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ScrollPanel } from 'primereact/scrollpanel';
import EmployeeCard from './EmployeeCard';
import { EmployeeData } from '../types';

interface EmployeeCardsGridProps {
  employees: EmployeeData[];
}

export default function EmployeeCardsGrid({ employees }: EmployeeCardsGridProps) {
  const maxRevenue = employees.length ? Math.max(...employees.map(emp => emp.totalRevenue)) : 0;

  return (
    <Card className="border-1 surface-border shadow-1 hover:shadow-2 transition-all transition-duration-300">
      <div className="flex align-items-center justify-content-between mb-4">
        <h3 className="text-lg font-semibold m-0 text-900">Performance Individual</h3>
        <Tag value={`${employees.length} funcionários`} severity="success" className="text-xs" />
      </div>
      
      <ScrollPanel 
        style={{ 
          width: '100%', 
          height: '500px', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}
        className="shadow-1"
      >
        <div className="grid">
          {employees.map((employee, index) => (
            <EmployeeCard
              key={employee.employeeId}
              employee={employee}
              index={index}
              maxRevenue={maxRevenue}
            />
          ))}
        </div>
      </ScrollPanel>

      {/* Indicador de scroll */}
      <div className="flex justify-content-center mt-3">
        <small className="text-500">
          <i className="pi pi-info-circle mr-2"></i>
          Role para ver mais funcionários
        </small>
      </div>
    </Card>
  );
}