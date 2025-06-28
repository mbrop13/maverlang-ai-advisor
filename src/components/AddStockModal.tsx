
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddStockModalProps {
  onAddStock: (symbol: string) => void;
  isLoading?: boolean;
}

export const AddStockModal = ({ onAddStock, isLoading }: AddStockModalProps) => {
  const [symbol, setSymbol] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un símbolo válido",
        variant: "destructive"
      });
      return;
    }

    onAddStock(symbol.toUpperCase().trim());
    setSymbol('');
    setIsOpen(false);
    
    toast({
      title: "Stock agregado",
      description: `${symbol.toUpperCase()} ha sido agregado a la lista`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nueva Acción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="symbol">Símbolo de la Acción</Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Ej: AAPL, MSFT, GOOGL"
              className="uppercase"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Agregando...' : 'Agregar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
