import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GreenhouseCard from "@/components/greenhouse/GreenhouseCard";
import { Plus, Leaf, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import AgroLoader from "@/components/ui/agro-loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useGreenhouses, useCreateGreenhouse } from "@/hooks/use-greenhouse-query";

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGreenhouseName, setNewGreenhouseName] = useState("");

  const { data: apiGreenhouses = [], isLoading, isError } = useGreenhouses();
  const { mutate: createGreenhouse, isPending: isCreating } = useCreateGreenhouse();

  const handleAddGreenhouse = () => {
    if (!newGreenhouseName.trim()) {
      toast.error(t("dashboard.nameRequired") || "Nom kiritish majburiy!");
      return;
    }

    createGreenhouse(
      { name: newGreenhouseName },
      {
        onSuccess: (newGreenhouse) => {
          toast.success(`${newGreenhouse.name} ${t("dashboard.created") || "muvaffaqiyatli yaratildi!"}`);
          setNewGreenhouseName("");
          setIsDialogOpen(false);
        },
      }
    );
  };

  // Loading
  if (isLoading) {
    return <AgroLoader text="Issiqxonalar yuklanmoqda" size="lg" />;
  }

  return (
    <main className="container mx-auto px-4 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              <span className="text-foreground">{t("dashboard.title") || "Mening"}</span>{" "}
              <span className="text-primary glow-text">{t("dashboard.titleHighlight") || "Issiqxonalarim"}</span>
            </h1>
            <p className="text-muted-foreground">
              {t("dashboard.subtitle") || "Issiqxonalaringizni boshqaring va kuzatib boring"}
            </p>
          </div>
          <Button
            variant="neon"
            className="mt-4 md:mt-0"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            {t("dashboard.addGreenhouse") || "Yangi qo'shish"}
          </Button>
        </div>

        {isError && (
          <div className="text-center text-red-500 py-10 border border-red-500/20 rounded-lg bg-red-500/5">
            <p>Server bilan bog'lanishda xatolik yuz berdi.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Qayta yuklash
            </Button>
          </div>
        )}

        {!isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apiGreenhouses.map((greenhouse, index) => (
              <motion.div
                key={greenhouse.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GreenhouseCard greenhouse={greenhouse} />
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: apiGreenhouses.length * 0.1 }}
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
                    {t("dashboard.addNew") || "Yangi issiqxona"}
                  </h3>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              {t("dashboard.newGreenhouse") || "Yangi Issiqxona"}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard.createDescription") || "Yangi issiqxonangizga nom bering."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder={t("dashboard.namePlaceholder") || "Masalan: Pomidor sektori"}
              value={newGreenhouseName}
              onChange={(e) => setNewGreenhouseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddGreenhouse()}
              disabled={isCreating}
            />
            <div className="flex gap-2 justify-end">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                disabled={isCreating}
              >
                {t("dashboard.cancel") || "Bekor qilish"}
              </Button>
              <Button 
                variant="neon"
                size="sm"
                onClick={handleAddGreenhouse}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Yaratilmoqda...
                  </>
                ) : (
                  t("dashboard.create") || "Yaratish"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default DashboardPage;