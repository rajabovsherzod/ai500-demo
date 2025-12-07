import React, { useState, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useGreenhouse } from "@/contexts/GreenhouseContext";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// Generate mock historical data
const generateHistoricalData = (hours: number, baseValue: number, variance: number) => {
  const data = [];
  const now = new Date();
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      fullTime: time.toISOString(),
      value: baseValue + (Math.random() - 0.5) * variance,
    });
  }
  return data;
};

const sensorColors: Record<string, string> = {
  temperature: "#ff6b6b",
  humidity: "#00f0ff",
  soil_moisture: "#00ff88",
  co2: "#ffaa00",
  light: "#bb88ff",
};

const AnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const sensorParam = searchParams.get("sensor");
  const { greenhouses } = useGreenhouse();

  const [selectedSensorId, setSelectedSensorId] = useState(sensorParam || "1");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  const greenhouse = greenhouses.find((g) => g.id === id);

  const selectedSensor = greenhouse?.sensors.find((s) => s.id === selectedSensorId);

  const chartData = useMemo(() => {
    if (!selectedSensor) return [];
    const hours = timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
    const baseValue =
      selectedSensor.type === "temperature"
        ? 24
        : selectedSensor.type === "humidity"
        ? 60
        : selectedSensor.type === "soil_moisture"
        ? 65
        : selectedSensor.type === "co2"
        ? 500
        : 1000;
    const variance =
      selectedSensor.type === "temperature"
        ? 8
        : selectedSensor.type === "humidity"
        ? 20
        : selectedSensor.type === "soil_moisture"
        ? 15
        : selectedSensor.type === "co2"
        ? 200
        : 400;
    return generateHistoricalData(hours, baseValue, variance);
  }, [selectedSensor, timeRange]);

  if (!greenhouse) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Greenhouse not found</h1>
          <Link to="/dashboard">
            <Button variant="neon">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sensorColor = selectedSensor
    ? sensorColors[selectedSensor.type]
    : "#00f0ff";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Link to={`/greenhouse/${id}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  <span className="text-foreground">{greenhouse.name}</span>{" "}
                  <span className="text-primary glow-text">Analytics</span>
                </h1>
                <p className="text-muted-foreground text-sm">
                  Historical sensor data and trends
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Select
                value={selectedSensorId}
                onValueChange={setSelectedSensorId}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select sensor" />
                </SelectTrigger>
                <SelectContent>
                  {greenhouse.sensors.map((sensor) => (
                    <SelectItem key={sensor.id} value={sensor.id}>
                      {sensor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex rounded-lg border border-primary/30 overflow-hidden">
                {(["24h", "7d", "30d"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      timeRange === range
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Value Card */}
          {selectedSensor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <Card variant="glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Current {selectedSensor.name}
                      </p>
                      <p
                        className="font-display text-4xl font-bold"
                        style={{
                          color: sensorColor,
                          textShadow: `0 0 20px ${sensorColor}50`,
                        }}
                      >
                        {selectedSensor.value.toFixed(1)} {selectedSensor.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-sm">Range</p>
                      <p className="text-foreground">
                        {selectedSensor.min} - {selectedSensor.max} {selectedSensor.unit}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {selectedSensor?.name} Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={sensorColor}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={sensorColor}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="time"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: `1px solid ${sensorColor}40`,
                          borderRadius: "8px",
                          boxShadow: `0 0 20px ${sensorColor}20`,
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [
                          `${value.toFixed(1)} ${selectedSensor?.unit}`,
                          selectedSensor?.name,
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={sensorColor}
                        strokeWidth={2}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sensor Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <h3 className="font-display text-lg font-semibold mb-4">Quick Access</h3>
            <div className="flex flex-wrap gap-2">
              {greenhouse.sensors.map((sensor) => (
                <Button
                  key={sensor.id}
                  variant={selectedSensorId === sensor.id ? "neon" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSensorId(sensor.id)}
                >
                  {sensor.name}
                </Button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
