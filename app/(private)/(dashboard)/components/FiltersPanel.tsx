// app/products/components/FiltersPanel.tsx
import { Accordion, AccordionTab } from 'primereact/accordion';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';

interface FiltersPanelProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedSize: string;
  setSelectedSize: (value: string) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  uniqueTypes: string[];
  uniqueSizes: string[];
  maxPrice: number;
}

export default function FiltersPanel({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedSize,
  setSelectedSize,
  priceRange,
  setPriceRange,
  uniqueTypes,
  uniqueSizes,
  maxPrice
}: FiltersPanelProps) {
  return (
    <Accordion>
      <AccordionTab header="Filtros Avançados">
        <div className="grid">
          <div className="col-12 md:col-4 mb-3 md:mb-0">
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-search"></i>
              </span>
              <InputText
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="col-12 md:col-2 mb-3 md:mb-0">
            <Dropdown
              value={selectedType}
              options={['', ...uniqueTypes]}
              onChange={(e) => setSelectedType(e.value)}
              placeholder="Tipo"
              showClear
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-2 mb-3 md:mb-0">
            <Dropdown
              value={selectedSize}
              options={['', ...uniqueSizes]}
              onChange={(e) => setSelectedSize(e.value)}
              placeholder="Tamanho"
              showClear
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-4">
            <div className="flex flex-column gap-2">
              <label className="text-sm">
                Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onChange={(e) => setPriceRange(e.value as [number, number])}
                range
                min={0}
                max={maxPrice}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </AccordionTab>
    </Accordion>
  );
}