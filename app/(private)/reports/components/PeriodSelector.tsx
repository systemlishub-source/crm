import { Button } from "primereact/button";
import { Card } from "primereact/card";

interface PeriodSelectorProps {
  selectedPeriod: string;
  setSelectedPeriod: (period: '7' | '30' | '365' | 'all') => void;
  periodText: string;
}

export default function PeriodSelector({ selectedPeriod, setSelectedPeriod, periodText }: PeriodSelectorProps) {
  const periodButtons = [
    { label: '7 Dias', value: '7' as const },
    { label: '30 Dias', value: '30' as const },
    { label: '1 Ano', value: '365' as const },
    { label: 'Tudo', value: 'all' as const }
  ];

  return (
    <Card className="p-3">
      <div className="flex flex-wrap gap-2">
        {periodButtons.map(button => (
          <Button
            key={button.value}
            label={button.label}
            severity={selectedPeriod === button.value ? undefined : "secondary"}
            outlined={selectedPeriod !== button.value}
            onClick={() => setSelectedPeriod(button.value)}
            size="small"
            className="text-xs sm:text-sm"
          />
        ))}
      </div>
      <small className="text-500 mt-2 block">
        Período selecionado: <strong>{periodText}</strong>
      </small>
    </Card>
  );
}