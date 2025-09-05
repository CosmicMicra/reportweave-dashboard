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
    const { taskId, urls } = await req.json();
    
    if (!taskId || !urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Task ID and URLs array are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`Processing multiple URLs for task: ${taskId}`, urls);

    // Update task status
    await supabase
      .from('tasks')
      .update({ 
        status: 'processing', 
        progress: 10,
        properties_count: urls.length,
        source_urls: urls
      })
      .eq('id', taskId);

    // Process each URL and collect all property data
    const allPropertyData = [];
    let progressIncrement = 60 / urls.length; // Reserve 30% for PDF generation

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`Processing URL ${i + 1}/${urls.length}: ${url}`);
      
      try {
        // Call the existing process-url function for each URL
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-url`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            taskId: `${taskId}-property-${i + 1}`, 
            url: url,
            skipPdfGeneration: true // We'll generate a combined PDF instead
          }),
        });

        if (response.ok) {
          const propertyData = await response.json();
          allPropertyData.push({ 
            url, 
            data: propertyData,
            propertyIndex: i + 1
          });
        } else {
          console.error(`Failed to process URL ${url}:`, await response.text());
          allPropertyData.push({ 
            url, 
            error: 'Failed to process property',
            propertyIndex: i + 1
          });
        }

        // Update progress
        const currentProgress = 10 + ((i + 1) * progressIncrement);
        await supabase
          .from('tasks')
          .update({ progress: Math.round(currentProgress) })
          .eq('id', taskId);

      } catch (error) {
        console.error(`Error processing URL ${url}:`, error);
        allPropertyData.push({ 
          url, 
          error: error.message,
          propertyIndex: i + 1
        });
      }
    }

    console.log(`Collected data for ${allPropertyData.length} properties, generating combined PDF...`);

    // Generate combined PDF
    await supabase
      .from('tasks')
      .update({ progress: 70 })
      .eq('id', taskId);

    const combinedPdfUrl = await generateCombinedPDF(allPropertyData, taskId);

    // Store combined extracted data
    const combinedExtractedData = {
      task_id: taskId,
      property_description: `Combined report for ${urls.length} properties`,
      pdf_url: combinedPdfUrl,
      // Aggregate data from all properties
      ...aggregatePropertyData(allPropertyData)
    };

    await supabase
      .from('extracted_data')
      .insert(combinedExtractedData);

    // Final update
    await supabase
      .from('tasks')
      .update({ 
        status: 'completed', 
        progress: 100 
      })
      .eq('id', taskId);

    console.log(`Multi-property processing completed for task: ${taskId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${urls.length} properties`,
        pdfUrl: combinedPdfUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-multiple-urls function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateCombinedPDF(propertyDataArray: any[], taskId: string): Promise<string> {
  try {
    // Create comprehensive HTML content for all properties
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Combined Property Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .property-section { margin-bottom: 60px; page-break-before: auto; }
          .property-header { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
          .property-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .detail-group { margin-bottom: 15px; }
          .label { font-weight: bold; color: #333; }
          .value { margin-left: 10px; }
          .separator { border-top: 1px solid #ddd; margin: 40px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Combined Property Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>${propertyDataArray.length} Properties Analyzed</p>
        </div>
        
        ${propertyDataArray.map((property, index) => `
          <div class="property-section">
            <div class="property-header">
              <h2>Property ${index + 1} of ${propertyDataArray.length}</h2>
              <p><strong>Source URL:</strong> ${property.url}</p>
            </div>
            
            ${property.error ? `
              <div style="color: red; padding: 20px; background: #fff5f5; border: 1px solid #fed7d7;">
                <strong>Error:</strong> ${property.error}
              </div>
            ` : `
              <div class="property-details">
                <div class="detail-group">
                  <span class="label">Address:</span>
                  <span class="value">${property.data?.address || 'N/A'}</span>
                </div>
                <div class="detail-group">
                  <span class="label">Price:</span>
                  <span class="value">${property.data?.price || 'N/A'}</span>
                </div>
                <div class="detail-group">
                  <span class="label">Bedrooms:</span>
                  <span class="value">${property.data?.bedrooms || 'N/A'}</span>
                </div>
                <div class="detail-group">
                  <span class="label">Bathrooms:</span>
                  <span class="value">${property.data?.bathrooms || 'N/A'}</span>
                </div>
                <div class="detail-group">
                  <span class="label">Square Footage:</span>
                  <span class="value">${property.data?.square_footage || 'N/A'}</span>
                </div>
                <div class="detail-group">
                  <span class="label">Year Built:</span>
                  <span class="value">${property.data?.year_built || 'N/A'}</span>
                </div>
              </div>
              
              ${property.data?.property_description ? `
                <div class="detail-group" style="margin-top: 20px;">
                  <span class="label">Description:</span>
                  <div class="value" style="margin-top: 10px;">${property.data.property_description}</div>
                </div>
              ` : ''}
            `}
            
            ${index < propertyDataArray.length - 1 ? '<div class="separator"></div>' : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `;

    // Upload to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const fileName = `combined-property-report-${taskId}-${Date.now()}.pdf`;
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });

    console.log('Uploading combined PDF to Supabase Storage...');

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
    console.log('Combined PDF successfully uploaded:', pdfUrl);

    return pdfUrl;

  } catch (error) {
    console.error('Error generating combined PDF:', error);
    throw error;
  }
}

function aggregatePropertyData(propertyDataArray: any[]): any {
  const validProperties = propertyDataArray.filter(p => !p.error && p.data);
  
  if (validProperties.length === 0) {
    return {};
  }

  // Calculate averages and aggregates
  const totalProperties = validProperties.length;
  const prices = validProperties.map(p => parseFloat(p.data.price?.replace(/[^0-9.]/g, '') || '0')).filter(p => p > 0);
  const sqFootages = validProperties.map(p => parseInt(p.data.square_footage) || 0).filter(sf => sf > 0);
  
  return {
    properties_count: totalProperties,
    average_price: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
    average_sqft: sqFootages.length > 0 ? Math.round(sqFootages.reduce((a, b) => a + b, 0) / sqFootages.length) : null,
    price_range: prices.length > 0 ? `$${Math.min(...prices).toLocaleString()} - $${Math.max(...prices).toLocaleString()}` : null,
    sqft_range: sqFootages.length > 0 ? `${Math.min(...sqFootages).toLocaleString()} - ${Math.max(...sqFootages).toLocaleString()} sq ft` : null
  };
}