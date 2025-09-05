import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, ExternalLink, FileText, MapPin, DollarSign } from "lucide-react";

interface TaskResult {
  price?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  downloads?: {
    pdf?: string;
    json?: string;
    excel?: string;
  };
}

interface TaskCardProps {
  id: string;
  type: 'url' | 'file';
  source: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  results?: TaskResult;
}

const statusVariants = {
  processing: { badge: "bg-processing text-processing-foreground", text: "Processing" },
  completed: { badge: "bg-success text-success-foreground", text: "Completed" },
  failed: { badge: "bg-destructive text-destructive-foreground", text: "Failed" }
};

export function TaskCard({ id, type, source, status, progress, results }: TaskCardProps) {
  const statusConfig = statusVariants[status];
  
  return (
    <Card className="transition-all duration-300 hover:shadow-elevated border-border/50 animate-slide-up">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {type === 'url' ? (
                  <ExternalLink className="h-4 w-4 text-accent flex-shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-accent flex-shrink-0" />
                )}
                <p className="text-sm font-medium text-foreground truncate">
                  {type === 'url' ? 'URL Extract' : 'File Process'}
                </p>
              </div>
              <p className="text-sm text-muted-foreground truncate" title={source}>
                {source}
              </p>
            </div>
            <Badge className={statusConfig.badge}>
              {statusConfig.text}
            </Badge>
          </div>

          {/* Progress Bar */}
          {status === 'processing' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Results */}
          {status === 'completed' && results && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-success/5 rounded-lg border border-success/20">
                {results.price && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="text-sm font-medium text-foreground">{results.price}</p>
                    </div>
                  </div>
                )}
                
                {results.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium text-foreground truncate" title={results.address}>
                        {results.address}
                      </p>
                    </div>
                  </div>
                )}
                
                {(results.bedrooms || results.bathrooms || results.sqft) && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Details</p>
                    <div className="flex gap-4 text-sm text-foreground">
                      {results.bedrooms && <span>{results.bedrooms} bed</span>}
                      {results.bathrooms && <span>{results.bathrooms} bath</span>}
                      {results.sqft && <span>{results.sqft.toLocaleString()} sqft</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Download Buttons */}
              {results.downloads && (
                <div className="flex flex-wrap gap-2">
                  {results.downloads.pdf && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                      onClick={() => window.open(results.downloads!.pdf, '_blank')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                  )}
                  {results.downloads.json && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                      onClick={() => window.open(results.downloads!.json, '_blank')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      JSON
                    </Button>
                  )}
                  {results.downloads.excel && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                      onClick={() => window.open(results.downloads!.excel, '_blank')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Excel
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {status === 'failed' && (
            <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive">
                Failed to process this item. Please try again or contact support.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}