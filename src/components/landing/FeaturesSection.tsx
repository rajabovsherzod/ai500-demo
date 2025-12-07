import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Cpu, Wifi, LayoutGrid } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-time Analytics",
    description: "Monitor all IoT sensors with live data streaming. Temperature, humidity, soil moisture, and CO₂ levels at your fingertips.",
    color: "primary",
  },
  {
    icon: Cpu,
    title: "AI Climate Control",
    description: "Intelligent algorithms automatically maintain optimal growing conditions. Let AgroAi handle the complexity.",
    color: "neon-green",
  },
  {
    icon: Wifi,
    title: "Remote Management",
    description: "Control pumps, lights, and fans from anywhere. Full device management via MQTT and WebSocket protocols.",
    color: "neon-amber",
  },
  {
    icon: LayoutGrid,
    title: "Multi-Greenhouse",
    description: "Manage unlimited greenhouses from a single dashboard. Switch between facilities instantly.",
    color: "accent",
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Powerful</span>{" "}
            <span className="text-primary glow-text">Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to automate your greenhouse operations with precision and intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="glow" className="h-full group hover:scale-[1.02] transition-transform">
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-14 h-14 rounded-xl bg-${feature.color}/20 flex items-center justify-center mb-4 border border-${feature.color}/40 group-hover:shadow-[0_0_20px_hsl(var(--${feature.color})/0.4)]`}
                    style={{
                      backgroundColor: `hsl(var(--${feature.color}) / 0.2)`,
                      borderColor: `hsl(var(--${feature.color}) / 0.4)`,
                    }}
                  >
                    <feature.icon
                      className="w-7 h-7"
                      style={{ color: `hsl(var(--${feature.color}))` }}
                    />
                  </motion.div>
                  <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
