import { useState, useEffect } from "react";
import { Home, BarChart3, Loader, CheckCircle, XCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { InputSection } from "@/components/dashboard/InputSection";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { 
  startProcessing, 
  subscribeToTasks, 
  getTasks, 
  getTaskStats,
  type TaskData 
} from "@/lib/dashboard";

const Index = () => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [stats, setStats] = useState({ total: 0, processing: 0, completed: 0, failed: 0 });

  useEffect(() => {
    // Subscribe to task updates
    const unsubscribe = subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
      setStats(getTaskStats());
    });

    // Initialize with existing tasks
    setTasks(getTasks());
    setStats(getTaskStats());

    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-accent">
              <Home className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                🏠 Real Estate Data Extractor
              </h1>
              <p className="text-muted-foreground">
                Professional property data compilation and reporting
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Tasks"
            value={stats.total}
            icon={BarChart3}
            variant="total"
          />
          <StatsCard
            title="Processing"
            value={stats.processing}
            icon={Loader}
            variant="processing"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            variant="completed"
          />
          <StatsCard
            title="Failed"
            value={stats.failed}
            icon={XCircle}
            variant="failed"
          />
        </div>

        {/* Input Section */}
        <InputSection onStartProcessing={startProcessing} />

        {/* Tasks List */}
        {tasks.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Processing Tasks</h2>
            <div id="tasksList" className="space-y-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  type={task.type}
                  source={task.source}
                  status={task.status}
                  progress={task.progress}
                  results={task.results}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-muted w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
            <p className="text-muted-foreground">
              Start by adding a property URL or uploading files to begin extraction.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
