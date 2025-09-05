import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Comprehensive task data interface
export interface TaskData {
  id: string;
  type: 'url' | 'file' | 'multi-url' | 'pdf-tools';
  source: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  properties_count?: number;
  source_urls?: string[];
  results?: {
    price?: string;
    address?: string;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    // Agent information
    agentName?: string;
    agentPhone?: string;
    agentEmail?: string;
    agentLicense?: string;
    agentBrokerage?: string;
    // Property details
    propertyDescription?: string;
    yearBuilt?: number;
    lotSize?: string;
    parkingInfo?: string;
    propertyType?: string;
    mlsNumber?: string;
    listingDate?: string;
    // School information
    schoolDistrict?: string;
    elementarySchool?: string;
    middleSchool?: string;
    highSchool?: string;
    // Neighborhood scores
    walkScore?: number;
    transitScore?: number;
    bikeScore?: number;
    // Financial information
    propertyTax?: string;
    hoaFees?: string;
    insuranceCost?: string;
    // Market data
    daysOnMarket?: number;
    pricePerSqFt?: string;
    lastSoldDate?: string;
    lastSoldPrice?: string;
    // URLs and media
    virtualTourUrl?: string;
    mapLocationUrl?: string;
    propertyImages?: string[];
    features?: string[];
    nearbyAmenities?: string[];
    downloads?: {
      pdf?: string;
      json?: string;
      excel?: string;
    };
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
    // Detect which tab is active
    const activeTab = document.querySelector('[data-state="active"]')?.getAttribute('data-value') || 'url';
    
    let source: string;
    let type: 'url' | 'file' | 'multi-url' | 'pdf-tools';
    let additionalData: any = {};

    if (activeTab === 'url') {
      const urlInput = document.querySelector('#urlInput') as HTMLInputElement;
      if (urlInput?.value) {
        source = urlInput.value;
        type = 'url';
      } else {
        toast({
          title: "Error",
          description: "Please provide a URL",
          variant: "destructive"
        });
        return;
      }
    } else if (activeTab === 'file') {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        source = fileInput.files[0].name;
        type = 'file';
      } else {
        toast({
          title: "Error",
          description: "Please select a file",
          variant: "destructive"
        });
        return;
      }
    } else if (activeTab === 'multi-url') {
      // Get all URL inputs in the multi-url tab
      const urlInputs = document.querySelectorAll('input[placeholder*="Property URL"]') as NodeListOf<HTMLInputElement>;
      const urls = Array.from(urlInputs)
        .map(input => input.value.trim())
        .filter(url => url.length > 0);
      
      console.log('Multi-URL inputs found:', urlInputs.length, 'URLs with values:', urls);
      
      if (urls.length === 0) {
        toast({
          title: "Error",
          description: "Please provide at least one property URL in the multi-property section",
          variant: "destructive"
        });
        return;
      }
      
      source = `${urls.length} properties`;
      type = 'multi-url';
      additionalData.urls = urls;
    } else if (activeTab === 'pdf-tools') {
      // Check for PDF files in the PDF tools section
      const pdfFileInputs = document.querySelectorAll('input[type="file"][accept*="pdf"]') as NodeListOf<HTMLInputElement>;
      let pdfFiles: File[] = [];
      
      // Get PDF files from file inputs or check if any were dropped
      pdfFileInputs.forEach(input => {
        if (input.files) {
          pdfFiles.push(...Array.from(input.files).filter(f => f.type === 'application/pdf'));
        }
      });

      // Check for files in the component's state (this might need a different approach)
      const fileListElements = document.querySelectorAll('[data-pdf-file]');
      
      if (pdfFiles.length === 0 && fileListElements.length === 0) {
        toast({
          title: "Error",
          description: "Please select PDF files for merge/split operations",
          variant: "destructive"
        });
        return;
      }
      
      source = `${pdfFiles.length} PDF files`;
      type = 'pdf-tools';
      additionalData.pdfFiles = pdfFiles;
    } else {
      toast({
        title: "Error",
        description: "Please select a valid input method",
        variant: "destructive"
      });
      return;
    }

    // Insert task into database
    const taskInsert: any = {
      type,
      source,
      status: 'processing',
      progress: 0
    };

    // Add additional fields for multi-url tasks
    if (type === 'multi-url' && additionalData.urls) {
      taskInsert.properties_count = additionalData.urls.length;
      taskInsert.source_urls = additionalData.urls;
    }

    const { data: taskData, error } = await supabase
      .from('tasks')
      .insert(taskInsert)
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
    } else if (type === 'multi-url') {
      await supabase.functions.invoke('process-multiple-urls', {
        body: { 
          taskId: taskData.id, 
          urls: additionalData.urls 
        }
      });
    } else if (type === 'file') {
      await supabase.functions.invoke('process-file', {
        body: { 
          taskId: taskData.id, 
          fileName: source
        }
      });
    } else if (type === 'pdf-tools') {
      // For now, show a coming soon message - full implementation requires file upload handling
      if (additionalData.pdfFiles && additionalData.pdfFiles.length > 1) {
        // Multiple files = merge operation
        await supabase.functions.invoke('merge-pdfs', {
          body: { 
            taskId: taskData.id, 
            fileUrls: [] // Would need to upload files first
          }
        });
      } else if (additionalData.pdfFiles && additionalData.pdfFiles.length === 1) {
        // Single file = split operation
        await supabase.functions.invoke('split-pdf', {
          body: { 
            taskId: taskData.id, 
            fileUrl: '', // Would need to upload file first
            splitOptions: { type: 'pages', pagesPerFile: 1 }
          }
        });
      } else {
        toast({
          title: "Coming Soon",
          description: "PDF tools functionality requires file upload implementation",
          variant: "default"
        });
        return;
      }
    }

    // Clear inputs based on type
    if (type === 'url') {
      const urlInput = document.querySelector('#urlInput') as HTMLInputElement;
      if (urlInput) urlInput.value = '';
    } else if (type === 'file') {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }

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

    // Combine tasks with their comprehensive extracted data
    const combinedTasks: TaskData[] = tasksData.map(task => {
      const results = extractedData.find(data => data.task_id === task.id);
      return {
        id: task.id,
        type: task.type as 'url' | 'file' | 'multi-url' | 'pdf-tools',
        source: task.source,
        status: task.status as 'processing' | 'completed' | 'failed',
        progress: task.progress,
        properties_count: task.properties_count,
        source_urls: task.source_urls,
        results: results ? {
          price: results.price,
          address: results.address,
          bedrooms: results.bedrooms,
          bathrooms: results.bathrooms,
          sqft: results.square_footage,
          // Agent information
          agentName: results.agent_name,
          agentPhone: results.agent_phone,
          agentEmail: results.agent_email,
          agentLicense: results.agent_license,
          agentBrokerage: results.agent_brokerage,
          // Property details
          propertyDescription: results.property_description,
          yearBuilt: results.year_built,
          lotSize: results.lot_size,
          parkingInfo: results.parking_info,
          propertyType: results.property_type,
          mlsNumber: results.mls_number,
          listingDate: results.listing_date,
          // School information
          schoolDistrict: results.school_district,
          elementarySchool: results.elementary_school,
          middleSchool: results.middle_school,
          highSchool: results.high_school,
          // Neighborhood scores
          walkScore: results.walk_score,
          transitScore: results.transit_score,
          bikeScore: results.bike_score,
          // Financial information
          propertyTax: results.property_tax,
          hoaFees: results.hoa_fees,
          insuranceCost: results.insurance_cost,
          // Market data
          daysOnMarket: results.days_on_market,
          pricePerSqFt: results.price_per_sqft,
          lastSoldDate: results.last_sold_date,
          lastSoldPrice: results.last_sold_price,
          // URLs and media
          virtualTourUrl: results.virtual_tour_url,
          mapLocationUrl: results.map_location_url,
          propertyImages: results.property_images,
          features: results.features,
          nearbyAmenities: results.nearby_amenities,
          downloads: {
            pdf: results.pdf_url,
            json: results.json_url,
            excel: results.excel_url
          }
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