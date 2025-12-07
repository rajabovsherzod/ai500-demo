import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGreenhouse } from "@/contexts/GreenhouseContext";
import Navbar from "@/components/layout/Navbar";
import GreenhouseCard from "@/components/greenhouse/GreenhouseCard";
import { Plus, Leaf, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const DashboardPage: React.FC = () => {
  const { greenhouses, addGreenhouse } = useGreenhouse();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGreenhouseName, setNewGreenhouseName] = useState("");

  const handleAddGreenhouse = () => {
    if (!newGreenhouseName.trim()) {
      toast.error("Please enter a greenhouse name");
      return;
    }

    addGreenhouse(newGreenhouseName);
    toast.success(`${newGreenhouseName} has been created!`);
    setNewGreenhouseName("");
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">
                <span className="text-foreground">Your</span>{" "}
                <span className="text-primary glow-text">Greenhouses</span>
              </h1>
              <p className="text-muted-foreground">
                Manage and monitor all your connected greenhouses
              </p>
            </div>
            <Button
              variant="neon"
              className="mt-4 md:mt-0"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Greenhouse
            </Button>
          </div>

          {/* Greenhouse Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {greenhouses.map((greenhouse, index) => (
              <motion.div
                key={greenhouse.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GreenhouseCard greenhouse={greenhouse} />
              </motion.div>
            ))}

            {/* Add New Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: greenhouses.length * 0.1 }}
            >
              <Card
                variant="glow"
                className="h-full min-h-[280px] flex items-center justify-center cursor-pointer hover:border-primary/60 group"
                onClick={() => setIsDialogOpen(true)}
              >
                <CardContent className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-primary/40 group-hover:border-primary/60"
                  >
                    <Plus className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="font-display text-lg font-semibold text-muted-foreground group-hover:text-foreground">
                    Add New Greenhouse
                  </h3>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Add Greenhouse Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                New Greenhouse
              </DialogTitle>
              <DialogDescription>
                Create a new greenhouse to start monitoring
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Greenhouse name (e.g., Main Greenhouse)"
                value={newGreenhouseName}
                onChange={(e) => setNewGreenhouseName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGreenhouse()}
              />
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="neon" onClick={handleAddGreenhouse}>
                  Create Greenhouse
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default DashboardPage;
