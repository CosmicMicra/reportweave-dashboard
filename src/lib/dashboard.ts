// Dashboard utility functions for API integration

interface TaskData {
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
    sqft?: number;
    downloads?: {
      pdf?: string;
      json?: string;
      excel?: string;
    };
  };
}

// Global state for tasks
let tasks: TaskData[] = [];
let taskListeners: Array<(tasks: TaskData[]) => void> = [];

// Subscribe to task updates
export function subscribeToTasks(listener: (tasks: TaskData[]) => void) {
  taskListeners.push(listener);
  return () => {
    taskListeners = taskListeners.filter(l => l !== listener);
  };
}

// Notify all listeners
function notifyListeners() {
  taskListeners.forEach(listener => listener([...tasks]));
}

// Required API integration functions
export function startProcessing() {
  const urlInput = document.getElementById('urlInput') as HTMLInputElement;
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const compressionLevel = document.getElementById('compressionLevel') as HTMLSelectElement;
  const outputFormat = document.getElementById('outputFormat') as HTMLSelectElement;
  
  console.log('Starting processing with:', {
    url: urlInput?.value,
    files: fileInput?.files,
    compression: compressionLevel?.value,
    format: outputFormat?.value
  });
  
  // Create demo task for URL input
  if (urlInput?.value) {
    const taskData: TaskData = {
      id: `task-${Date.now()}`,
      type: 'url',
      source: urlInput.value,
      status: 'processing',
      progress: 0
    };
    addTaskCard(taskData);
    
    // Simulate processing
    simulateProgress(taskData.id);
  }
  
  // Create demo tasks for file input
  if (fileInput?.files) {
    Array.from(fileInput.files).forEach((file, index) => {
      const taskData: TaskData = {
        id: `task-${Date.now()}-${index}`,
        type: 'file',
        source: file.name,
        status: 'processing',
        progress: 0
      };
      addTaskCard(taskData);
      
      // Simulate processing with delay
      setTimeout(() => simulateProgress(taskData.id), index * 1000);
    });
  }
}

export function addTaskCard(taskData: TaskData) {
  tasks.push(taskData);
  notifyListeners();
}

export function updateTaskProgress(taskId: string, progress: number) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.progress = progress;
    notifyListeners();
  }
}

export function markTaskComplete(taskId: string, results: TaskData['results']) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'completed';
    task.progress = 100;
    task.results = results;
    notifyListeners();
  }
}

export function markTaskFailed(taskId: string) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'failed';
    task.progress = 0;
    notifyListeners();
  }
}

export function getTasks() {
  return [...tasks];
}

export function getTaskStats() {
  const total = tasks.length;
  const processing = tasks.filter(t => t.status === 'processing').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const failed = tasks.filter(t => t.status === 'failed').length;
  
  return { total, processing, completed, failed };
}

// Demo simulation function
function simulateProgress(taskId: string) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5; // Random progress between 5-20%
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      // Simulate completion with sample data
      const sampleResults = {
        price: '$' + (Math.floor(Math.random() * 900000) + 100000).toLocaleString(),
        address: `${Math.floor(Math.random() * 9999) + 1} ${['Main St', 'Oak Ave', 'Pine Rd', 'Elm Dr'][Math.floor(Math.random() * 4)]}`,
        bedrooms: Math.floor(Math.random() * 4) + 2,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        sqft: Math.floor(Math.random() * 2000) + 1000,
        downloads: {
          pdf: '#pdf-download',
          json: '#json-download',
          excel: '#excel-download'
        }
      };
      
      markTaskComplete(taskId, sampleResults);
    } else {
      updateTaskProgress(taskId, Math.floor(progress));
    }
  }, 500 + Math.random() * 1000); // Random interval between 500-1500ms
}

// Export the task type for components
export type { TaskData };