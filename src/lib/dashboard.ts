import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Task data interface
export interface TaskData {
  id: string;
  type: 'url' | 'file';
  source: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  results?: {
    price?: string;
    address?: string;
    bedrooms?: number;
    bathrooms?: number;
    squareFootage?: number;
    pdfUrl?: string;
    jsonUrl?: string;
    excelUrl?: string;
  };
}

// Global state for tasks (in production, this would be in a proper state management solution)
let tasks: TaskData[] = [];
let taskListeners: ((tasks: TaskData[]) => void)[] = [];

// Subscribe to task updates
export const subscribeToTasks = (listener: (tasks: TaskData[]) => void) => {
  taskListeners.push(listener);
  
  // Set up realtime subscription
  const channel = supabase
    .channel('task-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks'
    }, (payload) => {
      console.log('Task change:', payload);
      fetchTasks();
    })
    .subscribe();

  return () => {
    taskListeners = taskListeners.filter(l => l !== listener);
    supabase.removeChannel(channel);
  };
};

// Notify all listeners of task changes
const notifyListeners = () => {
  taskListeners.forEach(listener => listener([...tasks]));
};

// Main function to start processing
export const startProcessing = async (): Promise<void> => {
  try {
    // Get input values from the DOM (in a real app, this would be passed as parameters)
    const urlInput = document.querySelector('input[placeholder="Enter URL to extract data from"]') as HTMLInputElement;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const compressionSelect = document.querySelector('[data-testid="compression-select"]') as HTMLSelectElement;
    const formatSelect = document.querySelector('[data-testid="format-select"]') as HTMLSelectElement;

    let source: string;
    let type: 'url' | 'file';

    if (urlInput?.value) {
      source = urlInput.value;
      type = 'url';
    } else if (fileInput?.files?.[0]) {
      source = fileInput.files[0].name;
      type = 'file';
    } else {
      toast({
        title: "Error",
        description: "Please provide a URL or select a file to process.",
        variant: "destructive"
      });
      return;
    }

    // Insert task into database
    const { data: taskData, error } = await supabase
      .from('tasks')
      .insert({
        type,
        source,
        status: 'processing',
        progress: 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Call appropriate Edge Function
    if (type === 'url') {
      await supabase.functions.invoke('process-url', {
        body: { taskId: taskData.id, url: source }
      });
    } else {
      await supabase.functions.invoke('process-file', {
        body: { 
          taskId: taskData.id, 
          fileName: source,
          compressionLevel: compressionSelect?.value || 'medium',
          outputFormat: formatSelect?.value || 'pdf'
        }
      });
    }

    // Clear inputs
    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';

    toast({
      title: "Processing Started",
      description: `Started processing ${type}: ${source}`,
    });

  } catch (error) {
    console.error('Error starting processing:', error);
    toast({
      title: "Error",
      description: "Failed to start processing. Please try again.",
      variant: "destructive"
    });
  }
};

// Fetch tasks from database
export const fetchTasks = async () => {
  try {
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (tasksError) throw tasksError;

    const { data: extractedData, error: extractedError } = await supabase
      .from('extracted_data')
      .select('*');

    if (extractedError) throw extractedError;

    // Combine tasks with their extracted data
    const combinedTasks: TaskData[] = tasksData.map(task => {
      const results = extractedData.find(data => data.task_id === task.id);
      return {
        id: task.id,
        type: task.type as 'url' | 'file',
        source: task.source,
        status: task.status as 'processing' | 'completed' | 'failed',
        progress: task.progress,
        results: results ? {
          price: results.price,
          address: results.address,
          bedrooms: results.bedrooms,
          bathrooms: results.bathrooms,
          squareFootage: results.square_footage,
          pdfUrl: results.pdf_url,
          jsonUrl: results.json_url,
          excelUrl: results.excel_url
        } : undefined
      };
    });

    tasks = combinedTasks;
    notifyListeners();
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};

// Get current tasks
export const getTasks = (): TaskData[] => {
  return [...tasks];
};

// Get task statistics
export const getTaskStats = () => {
  const total = tasks.length;
  const processing = tasks.filter(t => t.status === 'processing').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const failed = tasks.filter(t => t.status === 'failed').length;
  
  return { total, processing, completed, failed };
};

// Legacy functions for compatibility - no longer needed with Supabase
export const addTaskCard = (taskData: TaskData) => {
  // Tasks are now managed in database
};

export const updateTaskProgress = (taskId: string, progress: number) => {
  // Progress is now updated by Edge Functions
};

export const markTaskComplete = (taskId: string, results: TaskData['results']) => {
  // Completion is now handled by Edge Functions
};

export const markTaskFailed = (taskId: string) => {
  // Failure status is now handled by Edge Functions
};