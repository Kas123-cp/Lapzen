'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ProductFiltersProps {
    filters: {
        brand: string;
        priceRange: [number, number];
        conditions: string[];
        processor: string;
        ram: string;
    };
    onFilterChange: (filterType: string, value: any) => void;
    onResetFilters: () => void;
    maxPrice: number;
}

const conditionOptions = ['New', 'Used', 'Refurbished'];


export function ProductFilters({ filters, onFilterChange, onResetFilters, maxPrice }: ProductFiltersProps) {
    
    const handleConditionChange = (condition: string) => {
        const newConditions = filters.conditions.includes(condition)
            ? filters.conditions.filter(c => c !== condition)
            : [...filters.conditions, condition];
        onFilterChange('conditions', newConditions);
    }
    
    return (
        <div className="lg:sticky lg:top-24">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-headline font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={onResetFilters}>Reset</Button>
            </div>
            <Accordion type="multiple" defaultValue={['price', 'brand', 'condition', 'processor', 'ram']} className="w-full">
                <AccordionItem value="price">
                    <AccordionTrigger className="font-semibold">Price</AccordionTrigger>
                    <AccordionContent className="px-1">
                        <div className="space-y-4">
                            <Slider
                                value={[filters.priceRange[1]]}
                                max={maxPrice}
                                step={1000}
                                onValueChange={(value) => onFilterChange('priceRange', [0, value[0]])}
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>PKR 0</span>
                                <span>PKR {filters.priceRange[1].toLocaleString()}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="brand">
                    <AccordionTrigger className="font-semibold">Brand</AccordionTrigger>
                    <AccordionContent className="px-1">
                       <Input
                            placeholder="e.g. Dell"
                            value={filters.brand}
                            onChange={(e) => onFilterChange('brand', e.target.value)}
                       />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="condition">
                    <AccordionTrigger className="font-semibold">Condition</AccordionTrigger>
                    <AccordionContent className="space-y-2 px-1">
                        {conditionOptions.map(condition => (
                           <div key={condition} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`condition-${condition}`} 
                                    checked={filters.conditions.includes(condition)}
                                    onCheckedChange={() => handleConditionChange(condition)}
                                />
                                <Label htmlFor={`condition-${condition}`} className="font-normal cursor-pointer">{condition}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="processor">
                    <AccordionTrigger className="font-semibold">Processor</AccordionTrigger>
                    <AccordionContent className="px-1">
                       <Input
                            placeholder="e.g. Core i7"
                            value={filters.processor}
                            onChange={(e) => onFilterChange('processor', e.target.value)}
                       />
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="ram">
                    <AccordionTrigger className="font-semibold">RAM</AccordionTrigger>
                    <AccordionContent className="px-1">
                        <Input
                            placeholder="e.g. 16GB"
                            value={filters.ram}
                            onChange={(e) => onFilterChange('ram', e.target.value)}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
