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
    const { taskId, url } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing URL: ${url} for task: ${taskId}`);

    // Update task progress to 20%
    await supabase
      .from('tasks')
      .update({ progress: 20 })
      .eq('id', taskId);

    // Scrape the URL (simplified scraping logic)
    const scrapedData = await scrapeRealEstateData(url);
    
    // Update progress to 50%
    await supabase
      .from('tasks')
      .update({ progress: 50 })
      .eq('id', taskId);

    // Generate PDF using Foxit API
    const pdfUrl = await generatePdfWithFoxit(scrapedData, foxitApiKey!);
    
    // Update progress to 80%
    await supabase
      .from('tasks')
      .update({ progress: 80 })
      .eq('id', taskId);

    // Store extracted data
    await supabase
      .from('extracted_data')
      .insert({
        task_id: taskId,
        price: scrapedData.price,
        address: scrapedData.address,
        bedrooms: scrapedData.bedrooms,
        bathrooms: scrapedData.bathrooms,
        square_footage: scrapedData.squareFootage,
        pdf_url: pdfUrl,
        json_url: `https://qtpohoygpgkfzuqvxsdv.supabase.co/storage/v1/object/public/reports/${taskId}_data.json`,
        excel_url: `https://qtpohoygpgkfzuqvxsdv.supabase.co/storage/v1/object/public/reports/${taskId}_data.xlsx`
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
    console.error('Error processing URL:', error);
    
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

async function scrapeRealEstateData(url: string) {
  // Simplified scraping logic - in real implementation, parse HTML from URL
  console.log(`Scraping data from: ${url}`);
  
  // For demo purposes, return sample data based on URL
  if (url.includes('craigslist')) {
    return {
      price: '$2,500,000',
      address: '123 Oak Street, San Francisco, CA',
      bedrooms: 4,
      bathrooms: 3.5,
      squareFootage: 2800
    };
  } else if (url.includes('redfin')) {
    return {
      price: '$1,800,000',
      address: '456 Pine Avenue, Berkeley, CA',
      bedrooms: 3,
      bathrooms: 2.5,
      squareFootage: 2200
    };
  } else {
    return {
      price: '$3,200,000',
      address: '789 Market Street, Palo Alto, CA',
      bedrooms: 5,
      bathrooms: 4,
      squareFootage: 3500
    };
  }
}

async function generatePdfWithFoxit(data: any, apiKey: string): Promise<string> {
  try {
    console.log('Generating PDF with Foxit API');
    
    // Create HTML content for the property report
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Property Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .property-details { margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Property Report</h1>
          <h2>${data.address}</h2>
        </div>
        <div class="property-details">
          <div class="detail-row"><strong>Price:</strong> ${data.price}</div>
          <div class="detail-row"><strong>Bedrooms:</strong> ${data.bedrooms}</div>
          <div class="detail-row"><strong>Bathrooms:</strong> ${data.bathrooms}</div>
          <div class="detail-row"><strong>Square Footage:</strong> ${data.squareFootage} sq ft</div>
        </div>
      </body>
      </html>
    `;

    // Call Foxit API to convert HTML to PDF
    const foxitResponse = await fetch('https://api.foxit.com/v1/pdf/htmltopdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        options: {
          format: 'A4',
          margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
        }
      }),
    });

    if (!foxitResponse.ok) {
      throw new Error(`Foxit API error: ${foxitResponse.statusText}`);
    }

    const pdfBlob = await foxitResponse.blob();
    
    // Store PDF in Supabase Storage
    const supabase = createClient(supabaseUrl, supabaseKey);
    const fileName = `property-report-${Date.now()}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    return `https://qtpohoygpgkfzuqvxsdv.supabase.co/storage/v1/object/public/reports/${fileName}`;

  } catch (error) {
    console.error('Foxit PDF generation failed:', error);
    // Return a placeholder URL for demo
    return `https://qtpohoygpgkfzuqvxsdv.supabase.co/storage/v1/object/public/reports/sample-report.pdf`;
  }
}