import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'total' | 'processing' | 'completed' | 'failed';
}

const variantStyles = {
  total: "border-luxury-platinum/30 bg-gradient-glass backdrop-blur-sm bg-white/80",
  processing: "border-processing/20 bg-gradient-to-br from-processing/5 to-processing/10 backdrop-blur-sm bg-white/90",
  completed: "border-success/20 bg-gradient-to-br from-success/5 to-success/10 backdrop-blur-sm bg-white/90",
  failed: "border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10 backdrop-blur-sm bg-white/90"
};

const iconStyles = {
  total: "text-primary",
  processing: "text-processing",
  completed: "text-success",
  failed: "text-destructive"
};

export function StatsCard({ title, value, icon: Icon, variant }: StatsCardProps) {
  return (
    <Card className={`transition-all duration-500 hover:shadow-luxury hover:scale-105 ${variantStyles[variant]} group`}>
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">{title}</p>
            <p className="text-4xl font-luxury font-bold text-foreground tracking-tight">{value.toLocaleString()}</p>
          </div>
          <div className={`p-4 rounded-2xl bg-gradient-glass border border-white/20 backdrop-blur-xs transition-all duration-300 group-hover:scale-110 ${iconStyles[variant]}`}>
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}