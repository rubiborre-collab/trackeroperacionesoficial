'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface SetupStats {
  setup: string;
  winrate: number;
  pnl: number;
  trades: number;
  payoff: number;
  avg_win: number;
  avg_loss: number;
}

interface RDistribution {
  r_range: string;
  count: number;
  percentage: number;
}

interface SymbolStats {
  symbol: string;
  pnl: number;
  trades: number;
  winrate: number;
  avg_trade: number;
}

export default function AnalysisPage() {
  const [setupStats, setSetupStats] = useState<SetupStats[]>([]);
  const [rDistribution, setRDistribution] = useState<RDistribution[]>([]);
  const [topSymbols, setTopSymbols] = useState<SymbolStats[]>([]);
  const [timeframe, setTimeframe] = useState('3m');

  useEffect(() => {

    // Start with empty data - will be populated as user adds trades
    setSetupStats([]);
    setRDistribution([]);
    setTopSymbols([]);
  }, []);

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  const totalTrades = setupStats.reduce((sum, setup) => sum + setup.trades, 0);
  const totalPnL = setupStats.reduce((sum, setup) => sum + setup.pnl, 0);
  const overallWinrate = setupStats.reduce((sum, setup, _, arr) => sum + setup.winrate / arr.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Trading</h1>
          <p className="text-gray-500 mt-2">
            Estadísticas detalladas de tus setups y performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Mes</SelectItem>
              <SelectItem value="3m">3 Meses</SelectItem>
              <SelectItem value="6m">6 Meses</SelectItem>
              <SelectItem value="1y">1 Año</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operaciones</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 3 meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PnL Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalPnL)}
            </div>
            <p className="text-xs text-muted-foreground">
              Todos los setups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Winrate Global</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPercent(overallWinrate)}
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio ponderado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mejor Setup</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {setupStats.length > 0 ? setupStats[0].setup : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {setupStats.length > 0 ? formatPercent(setupStats[0].winrate) : '0%'} winrate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="setups" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setups">Análisis de Setups</TabsTrigger>
          <TabsTrigger value="distribution">Distribución R</TabsTrigger>
          <TabsTrigger value="symbols">Top Símbolos</TabsTrigger>
        </TabsList>

        <TabsContent value="setups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Setup</CardTitle>
              <CardDescription>
                Análisis detallado de cada estrategia de entrada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {setupStats.map((setup, index) => (
                  <div key={setup.setup} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{setup.setup}</h3>
                        <p className="text-sm text-gray-500">{setup.trades} operaciones</p>
                      </div>
                      <Badge 
                        variant={setup.pnl >= 0 ? 'default' : 'destructive'}
                        className={setup.pnl >= 0 ? 'bg-green-100 text-green-800' : ''}
                      >
                        {formatCurrency(setup.pnl)}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-gray-500">Winrate</p>
                        <p className="font-semibold">{formatPercent(setup.winrate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payoff</p>
                        <p className="font-semibold">{setup.payoff.toFixed(2)}x</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ganancia Media</p>
                        <p className="font-semibold text-green-600">{formatCurrency(setup.avg_win)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pérdida Media</p>
                        <p className="font-semibold text-red-600">{formatCurrency(setup.avg_loss)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Winrate por Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={setupStats}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="setup" 
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Winrate']}
                    labelFormatter={(label) => `Setup: ${label}`}
                  />
                  <Bar 
                    dataKey="winrate" 
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de R Múltiples</CardTitle>
              <CardDescription>
                Análisis de los múltiplos de riesgo alcanzados en tus operaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={rDistribution}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="r_range" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'count' ? `${value} operaciones` : `${value}%`,
                          name === 'count' ? 'Cantidad' : 'Porcentaje'
                        ]}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={rDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ r_range, percentage }) => `${r_range}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {rDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-4">Detalle de Distribución</h4>
                <div className="grid gap-3">
                  {rDistribution.map((item, index) => (
                    <div key={item.r_range} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{item.r_range}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.count} operaciones</p>
                        <p className="text-sm text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symbols" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Símbolos por Performance</CardTitle>
              <CardDescription>
                Análisis de rendimiento por activo operado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSymbols.map((symbol, index) => (
                  <div key={symbol.symbol} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{symbol.symbol}</h3>
                          <p className="text-sm text-gray-500">{symbol.trades} operaciones</p>
                        </div>
                      </div>
                      <Badge 
                        variant={symbol.pnl >= 0 ? 'default' : 'destructive'}
                        className={symbol.pnl >= 0 ? 'bg-green-100 text-green-800' : ''}
                      >
                        {formatCurrency(symbol.pnl)}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-500">Winrate</p>
                        <p className="font-semibold">{formatPercent(symbol.winrate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">PnL Promedio</p>
                        <p className={`font-semibold ${symbol.avg_trade >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(symbol.avg_trade)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Operaciones</p>
                        <p className="font-semibold">{symbol.trades}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PnL por Símbolo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSymbols}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="symbol" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `€${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'PnL']}
                    labelFormatter={(label) => `Símbolo: ${label}`}
                  />
                  <Bar 
                    dataKey="pnl" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}