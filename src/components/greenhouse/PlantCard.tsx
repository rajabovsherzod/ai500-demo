import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Plant } from "@/types/plant";

// O'simlik turi uchun emoji va rang
const plantConfig: Record<string, { emoji: string; color: string; bgColor: string }> = {
  tomato: { emoji: "🍅", color: "text-red-500", bgColor: "bg-red-500/10" },
  cucumber: { emoji: "🥒", color: "text-green-500", bgColor: "bg-green-500/10" },
  pepper: { emoji: "🌶️", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  eggplant: { emoji: "🍆", color: "text-purple-500", bgColor: "bg-purple-500/10" },
  lettuce: { emoji: "🥬", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  carrot: { emoji: "🥕", color: "text-orange-400", bgColor: "bg-orange-400/10" },
  onion: { emoji: "🧅", color: "text-amber-500", bgColor: "bg-amber-500/10" },
  garlic: { emoji: "🧄", color: "text-slate-400", bgColor: "bg-slate-400/10" },
  potato: { emoji: "🥔", color: "text-amber-600", bgColor: "bg-amber-600/10" },
  strawberry: { emoji: "🍓", color: "text-pink-500", bgColor: "bg-pink-500/10" },
  default: { emoji: "🌱", color: "text-primary", bgColor: "bg-primary/10" },
};

interface PlantCardProps {
  plant: Plant;
  onEdit: (plant: Plant) => void;
  onDelete: (plant: Plant) => void;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const config = plantConfig[plant.type] || plantConfig.default;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card variant="glass" className="relative overflow-hidden group">
        {/* Background glow */}
        <div className={`absolute inset-0 ${config.bgColor} opacity-30`} />
        
        <CardContent className="p-4 relative">
          <div className="flex items-start justify-between">
            {/* Icon & Info */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center text-2xl`}>
                {config.emoji}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{plant.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(`plants.types.${plant.type}`, { defaultValue: plant.type })}
                </p>
                {plant.variety && (
                  <p className="text-xs text-muted-foreground/70">{plant.variety}</p>
                )}
              </div>
            </div>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(plant)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  {t("common.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(plant)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlantCard;