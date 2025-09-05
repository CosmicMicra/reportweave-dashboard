import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, ExternalLink, Building, MapPin, School, Car, DollarSign, Calendar, User, Phone, Mail } from 'lucide-react';

// Comprehensive task result interface
interface TaskResult {
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
}

interface TaskCardProps {
  id: string;
  type: 'url' | 'file';
  source: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  results?: TaskResult;
}

export function TaskCard({ id, type, source, status, progress, results }: TaskCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = (url?: string, filename?: string) => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || '';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {type === 'url' ? 'URL Processing' : 'File Processing'}
          </CardTitle>
          <Badge className={getStatusColor()}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground break-all">
          <strong>Source:</strong> {source}
        </div>
        {results?.mlsNumber && (
          <div className="text-sm text-muted-foreground">
            <strong>MLS #:</strong> {results.mlsNumber}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {status === 'processing' && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {status === 'completed' && results && (
          <div className="space-y-4">
            {/* Property Images */}
            {results.propertyImages && results.propertyImages.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Property Images</h4>
                <div className="grid grid-cols-3 gap-2">
                  {results.propertyImages.slice(0, 3).map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`Property ${index + 1}`}
                      className="w-full h-16 object-cover rounded-md"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Primary Property Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600 text-lg">{results.price}</span>
                </div>
                {results.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{results.address}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex gap-4 text-sm">
                  <span><strong>{results.bedrooms}</strong> bed</span>
                  <span><strong>{results.bathrooms}</strong> bath</span>
                </div>
                <div className="text-sm">
                  <span><strong>{results.sqft?.toLocaleString()}</strong> sq ft</span>
                  {results.pricePerSqFt && (
                    <span className="ml-2 text-gray-500">({results.pricePerSqFt}/sq ft)</span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Agent Information */}
            {results.agentName && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Agent Information
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                  <div><strong>{results.agentName}</strong></div>
                  {results.agentBrokerage && <div className="text-gray-600">{results.agentBrokerage}</div>}
                  <div className="flex gap-4 mt-2">
                    {results.agentPhone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{results.agentPhone}</span>
                      </div>
                    )}
                    {results.agentEmail && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{results.agentEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                {results.yearBuilt && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>Built {results.yearBuilt}</span>
                  </div>
                )}
                {results.lotSize && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📐</span>
                    <span>{results.lotSize}</span>
                  </div>
                )}
                {results.parkingInfo && (
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span>{results.parkingInfo}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {results.daysOnMarket && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{results.daysOnMarket} days on market</span>
                  </div>
                )}
                {results.propertyTax && (
                  <div className="text-gray-600">
                    <strong>Property Tax:</strong> {results.propertyTax}
                  </div>
                )}
                {results.hoaFees && results.hoaFees !== 'None' && (
                  <div className="text-gray-600">
                    <strong>HOA:</strong> {results.hoaFees}
                  </div>
                )}
              </div>
            </div>

            {/* Schools */}
            {results.schoolDistrict && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Schools
                </h4>
                <div className="text-sm text-gray-600">
                  <div><strong>District:</strong> {results.schoolDistrict}</div>
                  {results.elementarySchool && <div><strong>Elementary:</strong> {results.elementarySchool}</div>}
                  {results.middleSchool && <div><strong>Middle:</strong> {results.middleSchool}</div>}
                  {results.highSchool && <div><strong>High:</strong> {results.highSchool}</div>}
                </div>
              </div>
            )}

            {/* Walkability Scores */}
            {(results.walkScore || results.transitScore || results.bikeScore) && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Walkability & Transit</h4>
                <div className="flex gap-4 text-sm">
                  {results.walkScore && (
                    <Badge variant="outline">Walk: {results.walkScore}/100</Badge>
                  )}
                  {results.transitScore && (
                    <Badge variant="outline">Transit: {results.transitScore}/100</Badge>
                  )}
                  {results.bikeScore && (
                    <Badge variant="outline">Bike: {results.bikeScore}/100</Badge>
                  )}
                </div>
              </div>
            )}

            {/* Key Features */}
            {results.features && results.features.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Key Features</h4>
                <div className="flex flex-wrap gap-1">
                  {results.features.slice(0, 6).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {results.downloads?.pdf && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(results.downloads?.pdf, `property-report-${id}.pdf`)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF Report
                </Button>
              )}
              
              {results.virtualTourUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(results.virtualTourUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Virtual Tour
                </Button>
              )}

              {results.downloads?.json && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(results.downloads?.json, `data-${id}.json`)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  JSON
                </Button>
              )}

              {results.downloads?.excel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(results.downloads?.excel, `data-${id}.xlsx`)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Excel
                </Button>
              )}
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Processing Failed</p>
            <p className="text-red-600 text-sm mt-1">
              There was an error processing this {type}. Please try again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}