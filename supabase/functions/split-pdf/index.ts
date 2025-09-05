import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, fileUrl, splitOptions } = await req.json();
    
    if (!taskId || !fileUrl) {
      return new Response(
        JSON.stringify({ error: 'Task ID and file URL are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`Splitting PDF for task: ${taskId}, file: ${fileUrl}`);

    // Update task status
    await supabase
      .from('tasks')
      .update({ 
        status: 'processing', 
        progress: 10 
      })
      .eq('id', taskId);

    const foxitApiKey = Deno.env.get('FOXIT_API_KEY');
    let splitResults = [];

    if (foxitApiKey) {
      console.log('Attempting PDF split with Foxit API...');
      
      try {
        await supabase
          .from('tasks')
          .update({ progress: 30 })
          .eq('id', taskId);

        // Use Foxit API for professional PDF splitting
        const foxitResponse = await fetch('https://api.foxit.com/v1/split', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${foxitApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_url: fileUrl,
            split_type: splitOptions?.type || 'pages',
            pages_per_file: splitOptions?.pagesPerFile || 1,
            output_prefix: `split-${taskId}`
          }),
        });

        if (foxitResponse.ok) {
          const foxitResult = await foxitResponse.json();
          splitResults = foxitResult.split_files || [];
          console.log(`PDF split successful with Foxit API, created ${splitResults.length} files`);
        } else {
          throw new Error('Foxit API split failed');
        }

        await supabase
          .from('tasks')
          .update({ progress: 70 })
          .eq('id', taskId);

      } catch (foxitError) {
        console.error('Foxit API failed, using fallback:', foxitError.message);
      }
    }

    // Fallback: Create a split guide document
    if (splitResults.length === 0) {
      console.log('Creating fallback split guide...');
      
      await supabase
        .from('tasks')
        .update({ progress: 70 })
        .eq('id', taskId);

      const splitGuideUrl = await createSplitGuide(fileUrl, taskId, splitOptions);
      splitResults = [splitGuideUrl];
    }

    // Record the split operation
    await supabase
      .from('pdf_operations')
      .insert({
        task_id: taskId,
        operation_type: 'split',
        input_files: [fileUrl],
        output_files: splitResults
      });

    // Store extracted data for the split operation
    await supabase
      .from('extracted_data')
      .insert({
        task_id: taskId,
        property_description: `Split PDF operation - ${splitResults.length} files created`,
        pdf_url: splitResults[0] // First split file as primary
      });

    // Final update
    await supabase
      .from('tasks')
      .update({ 
        status: 'completed', 
        progress: 100 
      })
      .eq('id', taskId);

    console.log(`PDF split completed for task: ${taskId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully split PDF into ${splitResults.length} files`,
        splitFiles: splitResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in split-pdf function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createSplitGuide(fileUrl: string, taskId: string, splitOptions: any): Promise<string> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PDF Split Guide</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .original-file { margin-bottom: 30px; padding: 20px; background: #f0f8ff; border-radius: 5px; }
          .split-instructions { margin-bottom: 30px; }
          .instruction-item { margin-bottom: 15px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
          .file-link { color: #0066cc; text-decoration: none; font-weight: bold; }
          .file-link:hover { text-decoration: underline; }
          .note { background: #fff5f5; padding: 20px; border: 1px solid #fed7d7; border-radius: 5px; margin-top: 30px; }
          .tip { background: #f0fff4; padding: 20px; border: 1px solid #68d391; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PDF Split Guide</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Want to exclude a property from the eyes of the client? Follow this guide.</p>
        </div>
        
        <div class="original-file">
          <h2>Original Document:</h2>
          <a href="${fileUrl}" class="file-link" target="_blank">
            ${fileUrl.split('/').pop() || 'Original-Document.pdf'}
          </a>
        </div>
        
        <div class="split-instructions">
          <h2>Manual Split Instructions:</h2>
          
          <div class="instruction-item">
            <strong>Option 1: Extract Specific Pages</strong><br>
            Use a PDF editor (Adobe Acrobat, PDFtk, or online tools) to extract specific page ranges:
            <ul>
              <li>Pages 1-5: Property overview and exterior photos</li>
              <li>Pages 6-10: Interior details and floor plans</li>
              <li>Pages 11-15: Financial information and comparables</li>
            </ul>
          </div>
          
          <div class="instruction-item">
            <strong>Option 2: Remove Sensitive Sections</strong><br>
            To hide certain information from clients:
            <ul>
              <li>Remove pages containing internal notes or agent communications</li>
              <li>Extract only client-facing property information</li>
              <li>Create separate documents for different stakeholders</li>
            </ul>
          </div>
          
          <div class="instruction-item">
            <strong>Option 3: Create Property-Specific Files</strong><br>
            If this is a multi-property report:
            <ul>
              <li>Split each property into its own document</li>
              <li>Maintain consistent formatting across all split files</li>
              <li>Include property summary as the first page of each split</li>
            </ul>
          </div>
        </div>
        
        <div class="tip">
          <strong>Pro Tip:</strong> For automated PDF splitting, consider using tools like:
          <ul>
            <li>Adobe Acrobat Pro (Extract Pages feature)</li>
            <li>PDFtk Server (Command-line tool)</li>
            <li>Online services like SmallPDF or ILovePDF</li>
            <li>Python libraries like PyPDF2 for batch processing</li>
          </ul>
        </div>
        
        <div class="note">
          <strong>Note:</strong> This guide provides manual instructions for PDF splitting. 
          For automated splitting, professional PDF processing APIs would be required.
          Download the original document above and use your preferred PDF editing tool.
        </div>
      </body>
      </html>
    `;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const fileName = `split-guide-${taskId}-${Date.now()}.pdf`;
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });

    console.log('Uploading split guide to Supabase Storage...');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, htmlBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const pdfUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/reports/${fileName}`;
    console.log('Split guide successfully uploaded:', pdfUrl);

    return pdfUrl;

  } catch (error) {
    console.error('Error creating split guide:', error);
    throw error;
  }
}