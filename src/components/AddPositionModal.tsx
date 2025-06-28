
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, PieChart, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddPositionModalProps {
  onAddPosition: (position: { symbol: string; shares: number; avgPrice: number }) => void;
  isLoading: boolean;
}

export const AddPositionModal = ({ onAddPosition, isLoading }: AddPositionModalProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState('');
  const [shares, setShares] = useState<number>(0);
  const [avgPrice, setAvgPrice] = useState<number>(0);
  const { toast } = useToast();

  // Lista de acciones populares
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'AMD', name: 'Advanced Micro Devices' },
    { symbol: 'INTC', name: 'Intel Corp.' },
    { symbol: 'CRM', name: 'Salesforce Inc.' },
    { symbol: 'ORCL', name: 'Oracle Corp.' },
    { symbol: 'IBM', name: 'IBM Corp.' },
    { symbol: 'CSCO', name: 'Cisco Systems Inc.' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
    { symbol: 'DIS', name: 'Walt Disney Co.' },
    { symbol: 'UBER', name: 'Uber Technologies Inc.' },
    { symbol: 'SPOT', name: 'Spotify Technology SA' },
    { symbol: 'COIN', name: 'Coinbase Global Inc.' }
  ];

  const filteredStocks = popularStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPosition = () => {
    const symbolToAdd = selectedStock || searchTerm.toUpperCase();
    
    if (!symbolToAdd || shares <= 0 || avgPrice <= 0) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa todos los campos correctamente",
        variant: "destructive"
      });
      return;
    }

    // Validar símbolo
    if (!/^[A-Z]{1,5}$/.test(symbolToAdd)) {
      toast({
        title: "Símbolo inválido",
        description: "El símbolo debe tener entre 1 y 5 letras mayúsculas",
        variant: "destructive"
      });
      return;
    }

    onAddPosition({
      symbol: symbolToAdd,
      shares: shares,
      avgPrice: avgPrice
    });

    // Resetear formulario
    setOpen(false);
    setSearchTerm('');
    setSelectedStock('');
    setShares(0);
    setAvgPrice(0);
    
    toast({
      title: "Posición agregada",
      description: `${shares} acciones de ${symbolToAdd} agregadas al portafolio`,
    });
  };

  const selectStock = (symbol: string) => {
    setSelectedStock(symbol);
    setSearchTerm(symbol);
  };

  const totalInvestment = shares * avgPrice;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          Agregar Posición
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-600" />
            Agregar Nueva Posición
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Buscador de acciones */}
          <div className="space-y-2">
            <Label htmlFor="search">Seleccionar acción</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Buscar acción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de acciones */}
          <div className="max-h-32 overflow-y-auto space-y-1 border rounded-lg p-2">
            {filteredStocks.slice(0, 5).map((stock) => (
              <div
                key={stock.symbol}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all hover:bg-green-50 ${
                  selectedStock === stock.symbol ? 'bg-green-100 border border-green-300' : 'bg-gray-50'
                }`}
                onClick={() => selectStock(stock.symbol)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{stock.symbol.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{stock.symbol}</p>
                    <p className="text-xs text-gray-600 truncate">{stock.name}</p>
                  </div>
                </div>
                {selectedStock === stock.symbol && (
                  <Badge className="bg-green-600 text-xs">Seleccionado</Badge>
                )}
              </div>
            ))}
          </div>

          {/* Campos de inversión */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shares">Número de acciones</Label>
              <Input
                id="shares"
                type="number"
                placeholder="0"
                value={shares || ''}
                onChange={(e) => setShares(Number(e.target.value))}
                min="1"
                step="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avgPrice">Precio promedio ($)</Label>
              <Input
                id="avgPrice"
                type="number"
                placeholder="0.00"
                value={avgPrice || ''}
                onChange={(e) => setAvgPrice(Number(e.target.value))}
                min="0.01"
                step="0.01"
              />
            </div>
          </div>

          {/* Resumen de inversión */}
          {shares > 0 && avgPrice > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">Resumen de la Inversión</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Símbolo:</strong> {selectedStock || searchTerm.toUpperCase()}</p>
                <p><strong>Acciones:</strong> {shares.toLocaleString()}</p>
                <p><strong>Precio promedio:</strong> ${avgPrice.toFixed(2)}</p>
                <p><strong>Inversión total:</strong> ${totalInvestment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddPosition}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!searchTerm || shares <= 0 || avgPrice <= 0}
            >
              Agregar Posición
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
