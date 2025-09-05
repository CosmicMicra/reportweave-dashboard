import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, FileText, Download, Plus, X, Files, Scissors, Merge } from "lucide-react";

interface InputSectionProps {
  onStartProcessing: () => void;
}

export function InputSection({ onStartProcessing }: InputSectionProps) {
  const [inputMethod, setInputMethod] = useState<'url' | 'file' | 'multi-url' | 'pdf-tools'>('url');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      if (inputMethod === 'pdf-tools') {
        setPdfFiles(prev => [...prev, ...files.filter(f => f.type === 'application/pdf')]);
      } else {
        setSelectedFiles(files);
      }
    }
  };

  const addUrl = () => {
    setUrls(prev => [...prev, '']);
  };

  const removeUrl = (index: number) => {
    setUrls(prev => prev.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, value: string) => {
    setUrls(prev => prev.map((url, i) => i === index ? value : url));
  };

  const removePdfFile = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-foreground">Data Input</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Single URL
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="multi-url" className="flex items-center gap-2">
              <Files className="h-4 w-4" />
              Multi-Property
            </TabsTrigger>
            <TabsTrigger value="pdf-tools" className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              PDF Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urlInput" className="text-sm font-medium text-foreground">
                Property URL
              </Label>
              <Input 
                id="urlInput"
                placeholder="https://example.com/property-listing"
                className="transition-all duration-300 focus:ring-accent"
              />
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-foreground">Upload Files</Label>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center transition-all duration-300 hover:border-accent/50 bg-muted/30"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground font-medium mb-2">Drop files here or click to browse</p>
                <p className="text-sm text-muted-foreground mb-4">Supports PDF, DOC, DOCX, TXT files</p>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('fileInput')?.click()}
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  Choose Files
                </Button>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Selected Files:</Label>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <FileText className="h-4 w-4 text-accent" />
                      <span className="text-sm text-foreground">{file.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="multi-url" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Client wants to view multiple properties - merge them here</h3>
                <Button onClick={addUrl} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add URL
                </Button>
              </div>
              
              {urls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="url"
                    placeholder={`Property URL ${index + 1}`}
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    className="flex-1"
                  />
                  {urls.length > 1 && (
                    <Button 
                      onClick={() => removeUrl(index)} 
                      variant="outline" 
                      size="sm"
                      className="px-3"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <p className="text-sm text-muted-foreground">
                Add multiple property URLs to generate a combined report for your client
              </p>
            </div>
          </TabsContent>

          <TabsContent value="pdf-tools" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Want to exclude a property from the eyes of the client? Split the PDF</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Merge className="h-5 w-5" />
                    <span className="font-medium">Merge PDFs</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Combine multiple property reports into one document
                  </p>
                  <div
                    className="border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-border transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <p className="text-sm">Drop PDF files here</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Scissors className="h-5 w-5" />
                    <span className="font-medium">Split PDF</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Extract specific pages or remove properties from reports
                  </p>
                  <div
                    className="border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-border transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <p className="text-sm">Drop PDF file here</p>
                  </div>
                </Card>
              </div>

              {pdfFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected PDF Files:</h4>
                  {pdfFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button 
                        onClick={() => removePdfFile(index)} 
                        variant="ghost" 
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Shared Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="compressionLevel" className="text-sm font-medium text-foreground">
                Compression Level
              </Label>
              <Select>
                <SelectTrigger id="compressionLevel">
                  <SelectValue placeholder="Select compression" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="outputFormat" className="text-sm font-medium text-foreground">
                Output Format
              </Label>
              <Select>
                <SelectTrigger id="outputFormat">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                  <SelectItem value="excel">Excel Sheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            id="startButton"
            onClick={onStartProcessing}
            className="w-full bg-gradient-accent hover:shadow-elevated transition-all duration-300 text-accent-foreground font-medium"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            {inputMethod === 'multi-url' ? 'Generate Combined Report' : 
             inputMethod === 'pdf-tools' ? 'Process PDFs' : 
             inputMethod === 'url' ? 'Extract Property Data' : 'Process Files'}
          </Button>
        </Tabs>
      </CardContent>
    </Card>
  );
}