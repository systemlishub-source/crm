// app/orders/components/NotesSection/NotesSection.tsx
'use client';
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";

interface NotesSectionProps {
    notes: string;
    onNotesChange: (notes: string) => void;
    loading?: boolean;
}

export default function NotesSection({
    notes,
    onNotesChange,
    loading = false
}: NotesSectionProps) {
    return (
        <Card title="Observações" className="mb-4">
            <InputText
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Observações da venda (opcional)"
                className="w-full"
                disabled={loading}
            />
        </Card>
    );
}