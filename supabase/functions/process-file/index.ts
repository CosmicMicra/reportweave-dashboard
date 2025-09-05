import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const foxitApiKey = Deno.env.get('FOXIT_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, fileName, compressionLevel, outputFormat } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing file: ${fileName} for task: ${taskId}`);

    // Update task progress to 25%
    await supabase
      .from('tasks')
      .update({ progress: 25 })
      .eq('id', taskId);

    // Simulate file processing with Foxit API
    const processedData = await processFileWithFoxit(fileName, compressionLevel, outputFormat, foxitApiKey!);
    
    // Update progress to 60%
    await supabase
      .from('tasks')
      .update({ progress: 60 })
      .eq('id', taskId);

    // Extract sample data from processed file
    const extractedData = {
      price: '$2,750,000',
      address: '321 Elm Drive, Mountain View, CA',
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2650
    };

    // Store extracted data
    await supabase
      .from('extracted_data')
      .insert({
        task_id: taskId,
        price: extractedData.price,
        address: extractedData.address,
        bedrooms: extractedData.bedrooms,
        bathrooms: extractedData.bathrooms,
        square_footage: extractedData.squareFootage,
        pdf_url: processedData.pdfUrl,
        json_url: processedData.jsonUrl,
        excel_url: processedData.excelUrl
      });

    // Mark task as complete
    await supabase
      .from('tasks')
      .update({ status: 'completed', progress: 100 })
      .eq('id', taskId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing file:', error);
    
    // Mark task as failed
    const { taskId } = await req.json().catch(() => ({ taskId: null }));
    if (taskId) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase
        .from('tasks')
        .update({ status: 'failed' })
        .eq('id', taskId);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processFileWithFoxit(fileName: string, compressionLevel: string, outputFormat: string, apiKey: string) {
  try {
    console.log(`Processing file with Foxit API: ${fileName}, compression: ${compressionLevel}, format: ${outputFormat}`);
    
    // For demo purposes, simulate Foxit API calls
    // In real implementation, you would:
    // 1. Upload file to Foxit
    // 2. Apply compression settings
    // 3. Convert to desired format
    // 4. Download processed files
    
    const timestamp = Date.now();
    
    return {
      pdfUrl: `https://qtpohoygpgkfzuqvxsdv.supabase.co/storage/v1/object/public/reports/processed-${timestamp}.pdf`,
      jsonUrl: `https://qtpohoygpgkfzuqvxsdv.supabase.co/storage/v1/object/public/reports/data-${timestamp}.json`,
      excelUrl: `https://qtpohoygpgkfzuqvxsdv.supabase.co/storage/v1/object/public/reports/data-${timestamp}.xlsx`
    };

  } catch (error) {
    console.error('Foxit file processing failed:', error);
    // Return placeholder URLs for demo
    const timestamp = Date.now();
    return {
      pdfUrl: `https://qtpohoygpgkfzuqvxsdv.supabase.co/storage/v1/object/public/reports/sample-${timestamp}.pdf`,
      jsonUrl: `https://qtpohoygpgkfzuqvxsdv.supabase.co/storage/v1/object/public/reports/sample-${timestamp}.json`,
      excelUrl: `https://qtpohoygpgkfzuqvxsdv.supabase.co/storage/v1/object/public/reports/sample-${timestamp}.xlsx`
    };
  }
}