import React, { useState, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useGreenhouse } from "@/contexts/GreenhouseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useTranslation } from "react-i18next";
import AgroLoader from "@/components/ui/agro-loader";

const generateHistoricalData = (hours: number, baseValue: number, variance: number) => {
  const data = [];
  const now = new Date();
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

const sensorNameKeys: Record<string, string> = {
  soil_moisture: "sensors.soilMoisture",
  humidity: "sensors.airHumidity",
  temperature: "sensors.temperature",
  co2: "sensors.co2Level",
  light: "sensors.lightIntensity",
};

const AnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { greenhouses } = useGreenhouse();
  const { t } = useTranslation();
  const [selectedSensorId, setSelectedSensorId] = useState(searchParams.get("sensor") || "temperature");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  const greenhouse = greenhouses.find((g) => String(g.id) === id);

  const chartData = useMemo(() => {
    const hours = timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
    const baseValues: Record<string, number> = {
      temperature: 25,
      humidity: 60,
      soil_moisture: 45,
      co2: 800,
      light: 5000,
    };
    const variances: Record<string, number> = {
      temperature: 10,
      humidity: 20,
      soil_moisture: 15,
      co2: 300,
      light: 3000,
    };
    return generateHistoricalData(hours, baseValues[selectedSensorId] || 50, variances[selectedSensorId] || 20);
  }, [selectedSensorId, timeRange]);

  if (!greenhouse) {
    return <AgroLoader text="Analitika yuklanmoqda" size="lg" />;
  }

  const sensorColor = sensorColors[selectedSensorId] || "#00f0ff";

  return (
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
                <span className="text-foreground">{t("analytics.title") || "Analitika"}</span>
              </h1>
              <p className="text-muted-foreground text-sm">{greenhouse.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as "24h" | "7d" | "30d")}>
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 soat</SelectItem>
                <SelectItem value="7d">7 kun</SelectItem>
                <SelectItem value="30d">30 kun</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sensor Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(sensorColors).map((sensorType) => (
            <Button
              key={sensorType}
              variant={selectedSensorId === sensorType ? "neon" : "outline"}
              size="sm"
              onClick={() => setSelectedSensorId(sensorType)}
            >
              {t(sensorNameKeys[sensorType]) || sensorType}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sensorColor }} />
              {t(sensorNameKeys[selectedSensorId]) || selectedSensorId}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={sensorColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={sensorColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
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
    </main>
  );
};

export default AnalyticsPage;