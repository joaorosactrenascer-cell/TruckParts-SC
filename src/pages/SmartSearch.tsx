import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown, Truck, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SearchResult {
  id: string;
  name: string;
  sku: string;
  price: number;
  supplier: string;
  category: string;
  image_url?: string;
  compatibility: string[];
  relevance_score: number;
  match_type: 'exact' | 'partial' | 'vehicle' | 'category';
}

interface SearchFilters {
  vehicle_type?: string;
  brand?: string;
  model?: string;
  year?: number;
  category?: string;
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
}

const VEHICLE_TYPES = ['Caminhão', 'Carreta', 'Van', 'Ônibus', 'Pickup'];
const VEHICLE_BRANDS = ['Volvo', 'Scania', 'Mercedes-Benz', 'MAN', 'Iveco', 'DAF', 'VW', 'Ford', 'Toyota'];
const CATEGORIES = ['Motor', 'Freios', 'Suspensão', 'Elétrica', 'Transmissão', 'Carroceria', 'Filtros', 'Direção'];

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('smart-search', {
        body: {
          query: searchQuery,
          limit: 5,
          filters
        }
      });

      if (!error && data) {
        const uniqueNames = Array.from(new Set(data.results.map((r: SearchResult) => r.name)));
        setSuggestions(uniqueNames.slice(0, 5));
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const performSearch = async () => {
    if (query.trim().length < 2) return;

    setLoading(true);
    setShowSuggestions(false);

    try {
      const { data, error } = await supabase.functions.invoke('smart-search', {
        body: {
          query,
          filters,
          limit: 50
        }
      });

      if (!error && data) {
        setResults(data.results);
      } else {
        console.error('Search error:', error);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch();
  };

  const clearFilters = () => {
    setFilters({});
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'bg-green-100 text-green-800';
      case 'vehicle': return 'bg-blue-100 text-blue-800';
      case 'category': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'Correspondência Exata';
      case 'vehicle': return 'Compatível com Veículo';
      case 'category': return 'Mesma Categoria';
      default: return 'Parcial';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Busca Inteligente de Peças
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre a peça perfeita para seu veículo. Busque por nome, código, marca, modelo ou ano.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Ex: farol volvo fh 2018 ou filtro de ar"
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <Search className="h-4 w-4 text-gray-400 mr-3" />
                          <span>{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-4 rounded-lg font-medium transition-colors ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filtros
              </button>

              <button
                onClick={performSearch}
                disabled={loading || query.trim().length < 2}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="max-w-4xl mx-auto mb-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filtros Avançados</h3>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpar Filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Veículo
                </label>
                <select
                  value={filters.vehicle_type || ''}
                  onChange={(e) => updateFilter('vehicle_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {VEHICLE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <select
                  value={filters.brand || ''}
                  onChange={(e) => updateFilter('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  {VEHICLE_BRANDS.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano
                </label>
                <input
                  type="number"
                  value={filters.year || ''}
                  onChange={(e) => updateFilter('year', parseInt(e.target.value))}
                  placeholder="Ex: 2018"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faixa de Preço
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.price_min || ''}
                    onChange={(e) => updateFilter('price_min', parseFloat(e.target.value))}
                    placeholder="Mín"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="self-center">-</span>
                  <input
                    type="number"
                    value={filters.price_max || ''}
                    onChange={(e) => updateFilter('price_max', parseFloat(e.target.value))}
                    placeholder="Máx"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* In Stock */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="in_stock"
                  checked={filters.in_stock || false}
                  onChange={(e) => updateFilter('in_stock', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="in_stock" className="ml-2 text-sm font-medium text-gray-700">
                  Apenas produtos em estoque
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 text-center">
              <p className="text-gray-600">
                Encontrados <span className="font-semibold text-gray-900">{results.length}</span> resultados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <div key={result.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Match Type Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchTypeColor(result.match_type)}`}>
                        {getMatchTypeLabel(result.match_type)}
                      </span>
                    </div>

                    {/* Product Image */}
                    {result.image_url ? (
                      <div className="mb-4">
                        <img
                          src={result.image_url}
                          alt={result.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="mb-4 w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {result.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">SKU: {result.sku}</span>
                        <span className={`text-sm font-medium ${
                          result.relevance_score >= 85 ? 'text-green-600' :
                          result.relevance_score >= 70 ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {Math.round(result.relevance_score)}% relevante
                        </span>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">Fornecedor:</span> {result.supplier}</p>
                        <p><span className="font-medium">Categoria:</span> {result.category}</p>
                      </div>

                      {/* Compatibility */}
                      {result.compatibility.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium text-gray-700 mb-1">Compatível com:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.compatibility.map((comp, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                <Truck className="h-3 w-3 mr-1" />
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-2xl font-bold text-gray-900">
                          R$ {result.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Tente usar termos diferentes ou ajustar os filtros
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
