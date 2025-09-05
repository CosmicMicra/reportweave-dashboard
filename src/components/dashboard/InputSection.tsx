import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Link, FileText, Download } from "lucide-react";

interface InputSectionProps {
  onStartProcessing: () => void;
}

export function InputSection({ onStartProcessing }: InputSectionProps) {
  const [inputMethod, setInputMethod] = useState<'url' | 'file'>('url');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-foreground">Data Input</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Method Toggle */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              inputMethod === 'url' 
                ? 'border-accent shadow-elevated bg-accent/5' 
                : 'border-border hover:border-accent/50'
            }`}
            onClick={() => setInputMethod('url')}
          >
            <CardContent className="p-4 text-center">
              <Link className="h-8 w-8 mx-auto mb-2 text-accent" />
              <p className="font-medium text-foreground">URL Input</p>
              <p className="text-sm text-muted-foreground">Extract from website</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              inputMethod === 'file' 
                ? 'border-accent shadow-elevated bg-accent/5' 
                : 'border-border hover:border-accent/50'
            }`}
            onClick={() => setInputMethod('file')}
          >
            <CardContent className="p-4 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-accent" />
              <p className="font-medium text-foreground">File Upload</p>
              <p className="text-sm text-muted-foreground">Process documents</p>
            </CardContent>
          </Card>
        </div>

        {/* Input Interface */}
        {inputMethod === 'url' ? (
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
        ) : (
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
        )}

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
          {inputMethod === 'url' ? 'Extract Property Data' : 'Process Files'}
        </Button>
      </CardContent>
    </Card>
  );
}