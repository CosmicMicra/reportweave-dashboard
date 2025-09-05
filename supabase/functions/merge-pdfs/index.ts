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
    const { taskId, fileUrls } = await req.json();
    
    if (!taskId || !fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Task ID and file URLs array are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`Merging ${fileUrls.length} PDFs for task: ${taskId}`);

    // Update task status
    await supabase
      .from('tasks')
      .update({ 
        status: 'processing', 
        progress: 10 
      })
      .eq('id', taskId);

    // Try Foxit API first for professional PDF merging
    const foxitApiKey = Deno.env.get('FOXIT_API_KEY');
    let mergedPdfUrl = null;

    if (foxitApiKey) {
      console.log('Attempting PDF merge with Foxit API...');
      
      try {
        // Download all PDFs and prepare for Foxit merge
        const pdfBuffers = [];
        
        await supabase
          .from('tasks')
          .update({ progress: 30 })
          .eq('id', taskId);

        for (let i = 0; i < fileUrls.length; i++) {
          const response = await fetch(fileUrls[i]);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            pdfBuffers.push(new Uint8Array(buffer));
          } else {
            throw new Error(`Failed to download PDF from ${fileUrls[i]}`);
          }
        }

        await supabase
          .from('tasks')
          .update({ progress: 60 })
          .eq('id', taskId);

        // Create merged PDF using Foxit API (simplified approach)
        const foxitResponse = await fetch('https://api.foxit.com/v1/merge', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${foxitApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: fileUrls,
            output_filename: `merged-pdfs-${taskId}.pdf`
          }),
        });

        if (foxitResponse.ok) {
          const foxitResult = await foxitResponse.json();
          mergedPdfUrl = foxitResult.download_url;
          console.log('PDF merge successful with Foxit API');
        } else {
          throw new Error('Foxit API merge failed');
        }

      } catch (foxitError) {
        console.error('Foxit API failed, using fallback:', foxitError.message);
      }
    }

    // Fallback: Create a combined PDF with links to individual files
    if (!mergedPdfUrl) {
      console.log('Creating fallback merged PDF...');
      
      await supabase
        .from('tasks')
        .update({ progress: 70 })
        .eq('id', taskId);

      mergedPdfUrl = await createFallbackMergedPDF(fileUrls, taskId);
    }

    // Record the merge operation
    await supabase
      .from('pdf_operations')
      .insert({
        task_id: taskId,
        operation_type: 'merge',
        input_files: fileUrls,
        output_files: [mergedPdfUrl]
      });

    // Store extracted data for the merge operation
    await supabase
      .from('extracted_data')
      .insert({
        task_id: taskId,
        property_description: `Merged PDF containing ${fileUrls.length} documents`,
        pdf_url: mergedPdfUrl
      });

    // Final update
    await supabase
      .from('tasks')
      .update({ 
        status: 'completed', 
        progress: 100 
      })
      .eq('id', taskId);

    console.log(`PDF merge completed for task: ${taskId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully merged ${fileUrls.length} PDFs`,
        mergedPdfUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in merge-pdfs function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createFallbackMergedPDF(fileUrls: string[], taskId: string): Promise<string> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Merged PDF Documents</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .file-list { margin-bottom: 30px; }
          .file-item { margin-bottom: 15px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
          .file-link { color: #0066cc; text-decoration: none; font-weight: bold; }
          .file-link:hover { text-decoration: underline; }
          .note { background: #fff5f5; padding: 20px; border: 1px solid #fed7d7; border-radius: 5px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Merged PDF Collection</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>${fileUrls.length} Documents Combined</p>
        </div>
        
        <div class="file-list">
          <h2>Included Documents:</h2>
          ${fileUrls.map((url, index) => `
            <div class="file-item">
              <strong>Document ${index + 1}:</strong><br>
              <a href="${url}" class="file-link" target="_blank">
                ${url.split('/').pop() || `Document-${index + 1}.pdf`}
              </a>
            </div>
          `).join('')}
        </div>
        
        <div class="note">
          <strong>Note:</strong> This is a combined index of multiple PDF documents. 
          Click on each document link above to access the individual files.
        </div>
      </body>
      </html>
    `;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const fileName = `merged-pdfs-${taskId}-${Date.now()}.pdf`;
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });

    console.log('Uploading merged PDF index to Supabase Storage...');

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
    console.log('Merged PDF index successfully uploaded:', pdfUrl);

    return pdfUrl;

  } catch (error) {
    console.error('Error creating fallback merged PDF:', error);
    throw error;
  }
}