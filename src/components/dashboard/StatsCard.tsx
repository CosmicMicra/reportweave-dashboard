import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'total' | 'processing' | 'completed' | 'failed';
}

const variantStyles = {
  total: "border-re-charcoal/20 bg-gradient-to-br from-background to-muted",
  processing: "border-processing/30 bg-gradient-to-br from-processing/5 to-processing/10",
  completed: "border-success/30 bg-gradient-to-br from-success/5 to-success/10",
  failed: "border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10"
};

const iconStyles = {
  total: "text-re-charcoal",
  processing: "text-processing",
  completed: "text-success",
  failed: "text-destructive"
};

export function StatsCard({ title, value, icon: Icon, variant }: StatsCardProps) {
  return (
    <Card className={`transition-all duration-300 hover:shadow-elevated ${variantStyles[variant]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-background/50 ${iconStyles[variant]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}