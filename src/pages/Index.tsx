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
    <div className="min-h-screen bg-gradient-luxury">
      {/* Luxury Header */}
      <header className="border-b border-luxury-platinum/20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-accent shadow-luxury">
              <div className="w-8 h-8 bg-primary rounded-lg transform rotate-45"></div>
            </div>
            <div>
              <h1 className="text-3xl font-luxury font-bold bg-gradient-to-r from-primary to-luxury-bronze bg-clip-text text-transparent">
                ReportWeave
              </h1>
              <p className="text-muted-foreground font-medium tracking-wide">
                Real estate data extraction and compilation tool
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-12 space-y-12">
        {/* Luxury Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

        {/* Luxury Tasks List */}
        {tasks.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-luxury font-semibold text-foreground">Active Operations</h2>
            <div id="tasksList" className="space-y-6">
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

        {/* Luxury Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-16">
            <div className="p-6 rounded-3xl bg-gradient-glass backdrop-blur-sm w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-white/20">
              <Home className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-luxury font-medium text-foreground mb-4">Ready to Begin</h3>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Start by adding a property URL or uploading files to begin your luxury data extraction experience.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
