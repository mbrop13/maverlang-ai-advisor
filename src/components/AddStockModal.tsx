
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddStockModalProps {
  onAddStock: (symbol: string) => void;
  isLoading: boolean;
}

export const AddStockModal = ({ onAddStock, isLoading }: AddStockModalProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState('');
  const { toast } = useToast();

  // Lista de acciones populares con sus nombres
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

  // Filtrar acciones basado en el término de búsqueda
  const filteredStocks = popularStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStock = () => {
    let symbolToAdd = selectedStock || searchTerm.toUpperCase();
    
    if (!symbolToAdd) {
      toast({
        title: "Error",
        description: "Por favor selecciona o ingresa un símbolo de acción",
        variant: "destructive"
      });
      return;
    }

    // Validar que el símbolo tenga formato válido
    if (!/^[A-Z]{1,5}$/.test(symbolToAdd)) {
      toast({
        title: "Símbolo inválido",
        description: "El símbolo debe tener entre 1 y 5 letras mayúsculas",
        variant: "destructive"
      });
      return;
    }

    onAddStock(symbolToAdd);
    setOpen(false);
    setSearchTerm('');
    setSelectedStock('');
    
    toast({
      title: "Acción agregada",
      description: `${symbolToAdd} ha sido agregado a la lista de seguimiento`,
    });
  };

  const selectStock = (symbol: string) => {
    setSelectedStock(symbol);
    setSearchTerm(symbol);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          Agregar Acción
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Agregar Nueva Acción
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Buscador */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar o ingresar símbolo</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Ej: AAPL, Apple, Microsoft..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Acciones filtradas */}
          <div className="space-y-2">
            <Label>Acciones populares</Label>
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-blue-50 ${
                      selectedStock === stock.symbol ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'
                    }`}
                    onClick={() => selectStock(stock.symbol)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{stock.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{stock.symbol}</p>
                        <p className="text-sm text-gray-600 truncate">{stock.name}</p>
                      </div>
                    </div>
                    {selectedStock === stock.symbol && (
                      <Badge className="bg-blue-600">
                        Seleccionado
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No se encontraron resultados</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">
                      Presiona "Agregar" para agregar "{searchTerm.toUpperCase()}" como símbolo personalizado
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

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
              onClick={handleAddStock}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!searchTerm && !selectedStock}
            >
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
