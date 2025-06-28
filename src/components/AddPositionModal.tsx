
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddPositionModalProps {
  onAddPosition: (position: {
    symbol: string;
    shares: number;
    avgPrice: number;
  }) => void;
  isLoading?: boolean;
}

export const AddPositionModal = ({ onAddPosition, isLoading }: AddPositionModalProps) => {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol.trim() || !shares || !avgPrice) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(avgPrice);

    if (sharesNum <= 0 || priceNum <= 0) {
      toast({
        title: "Error",
        description: "Las acciones y el precio deben ser mayores a 0",
        variant: "destructive"
      });
      return;
    }

    onAddPosition({
      symbol: symbol.toUpperCase().trim(),
      shares: sharesNum,
      avgPrice: priceNum
    });

    setSymbol('');
    setShares('');
    setAvgPrice('');
    setIsOpen(false);
    
    toast({
      title: "Posición agregada",
      description: `${symbol.toUpperCase()} ha sido agregado al portafolio`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar Posición
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nueva Posición</DialogTitle>
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
          <div>
            <Label htmlFor="shares">Cantidad de Acciones</Label>
            <Input
              id="shares"
              type="number"
              step="0.01"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="Ej: 100"
            />
          </div>
          <div>
            <Label htmlFor="avgPrice">Precio Promedio de Compra ($)</Label>
            <Input
              id="avgPrice"
              type="number"
              step="0.01"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              placeholder="Ej: 150.25"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Agregando...' : 'Agregar Posición'}
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
