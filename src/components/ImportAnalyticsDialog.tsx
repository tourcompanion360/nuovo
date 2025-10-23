import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileUp, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Eye,
  Users,
  Clock,
  BarChart3,
  Loader2
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { formatDuration, formatNumber, getDisplayLabel } from '@/utils/analyticsTerminology';

interface ImportAnalyticsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[], projectName: string) => Promise<void>;
  clientName: string;
  clientId: string;
}

interface ParsedData {
  date: string;
  resource_code: string;
  page_views: number;  // renamed from pv
  visitors: number;    // renamed from uv
  total_time: number;  // renamed from duration
  avg_time: number;    // renamed from avg_duration
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: ParsedData[];
  summary: {
    totalRows: number;
    totalViews: number;
    totalVisitors: number;
    avgDuration: number;
    dateRange: { start: string; end: string };
    resourceCodes: string[];
  };
}

const ImportAnalyticsDialog: React.FC<ImportAnalyticsDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  clientName,
  clientId
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setProjectName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateFile(file);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        errors: ['Failed to validate file. Please check the format.'],
        warnings: [],
        data: [],
        summary: {
          totalRows: 0,
          totalViews: 0,
          totalVisitors: 0,
          avgDuration: 0,
          dateRange: { start: '', end: '' },
          resourceCodes: []
        }
      });
    } finally {
      setIsValidating(false);
    }
  };

  const validateFile = async (file: File): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let parsedData: any[] = [];

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
      return { isValid: false, errors, warnings, data: [], summary: getEmptySummary() };
    }

    // Check file type
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(fileExtension)) {
      errors.push('Invalid file type. Please upload CSV or Excel files only.');
      return { isValid: false, errors, warnings, data: [], summary: getEmptySummary() };
    }

    try {
      if (fileExtension === '.csv') {
        // Parse CSV with Papa Parse
        const text = await file.text();
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim().toLowerCase().replace(/"/g, ''),
          transform: (value) => value.trim().replace(/"/g, '')
        });

        if (result.errors.length > 0) {
          errors.push(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
        }

        parsedData = result.data;
      } else {
        // Parse Excel
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (parsedData.length > 0) {
          const headers = parsedData[0] as string[];
          const dataRows = parsedData.slice(1);
          parsedData = dataRows.map((row: any[]) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header?.trim().toLowerCase().replace(/"/g, '') || `col_${index}`] = row[index] || '';
            });
            return obj;
          });
        }
      }

      // Validate required columns
      const requiredColumns = ['date', 'resource_code', 'pv', 'uv', 'duration', 'avg_duration'];
      const availableColumns = Object.keys(parsedData[0] || {});
      const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
      
      if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Validate and transform data
      const validatedData: ParsedData[] = [];
      const resourceCodes = new Set<string>();
      const dates: string[] = [];

      parsedData.forEach((row, index) => {
        const rowErrors: string[] = [];

        // Validate date
        const date = row.date || row.Date;
        if (!date) {
          rowErrors.push(`Row ${index + 1}: Missing date`);
        } else if (!isValidDate(date)) {
          rowErrors.push(`Row ${index + 1}: Invalid date format (${date})`);
        } else {
          dates.push(date);
        }

        // Validate resource_code
        const resourceCode = row.resource_code || row.resourceCode;
        if (!resourceCode) {
          rowErrors.push(`Row ${index + 1}: Missing resource_code`);
        } else {
          resourceCodes.add(resourceCode);
        }

        // Validate numeric fields
        const pv = parseInt(row.pv || row.PV || '0');
        const uv = parseInt(row.uv || row.UV || '0');
        const duration = parseInt(row.duration || row.Duration || '0');
        const avgDuration = parseInt(row.avg_duration || row.avgDuration || '0');

        if (isNaN(pv) || pv < 0) rowErrors.push(`Row ${index + 1}: Invalid PV value`);
        if (isNaN(uv) || uv < 0) rowErrors.push(`Row ${index + 1}: Invalid UV value`);
        if (isNaN(duration) || duration < 0) rowErrors.push(`Row ${index + 1}: Invalid duration value`);
        if (isNaN(avgDuration) || avgDuration < 0) rowErrors.push(`Row ${index + 1}: Invalid avg_duration value`);

        if (rowErrors.length === 0) {
          validatedData.push({
            date,
            resource_code: resourceCode,
            page_views: pv,      // map to new column name
            visitors: uv,        // map to new column name
            total_time: duration, // map to new column name
            avg_time: avgDuration // map to new column name
          });
        } else {
          errors.push(...rowErrors);
        }
      });

      // Generate summary
      const summary = {
        totalRows: validatedData.length,
        totalViews: validatedData.reduce((sum, row) => sum + row.page_views, 0),
        totalVisitors: validatedData.reduce((sum, row) => sum + row.visitors, 0),
        avgDuration: validatedData.length > 0 
          ? Math.round(validatedData.reduce((sum, row) => sum + row.avg_time, 0) / validatedData.length)
          : 0,
        dateRange: {
          start: dates.length > 0 ? Math.min(...dates.map(d => new Date(d).getTime())).toString() : '',
          end: dates.length > 0 ? Math.max(...dates.map(d => new Date(d).getTime())).toString() : ''
        },
        resourceCodes: Array.from(resourceCodes)
      };

      // Add warnings
      if (validatedData.length === 0) {
        warnings.push('No valid data rows found');
      }
      if (resourceCodes.size > 1) {
        warnings.push(`Multiple resource codes found: ${Array.from(resourceCodes).join(', ')}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: validatedData,
        summary
      };

    } catch (error) {
      errors.push(`File parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings, data: [], summary: getEmptySummary() };
    }
  };

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const getEmptySummary = () => ({
    totalRows: 0,
    totalViews: 0,
    totalVisitors: 0,
    avgDuration: 0,
    dateRange: { start: '', end: '' },
    resourceCodes: []
  });

  const handleImport = async () => {
    if (!validationResult?.isValid || !projectName.trim()) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      await onImport(validationResult.data, projectName.trim());

      clearInterval(progressInterval);
      setImportProgress(100);

      // Close dialog after successful import
      setTimeout(() => {
        handleClose();
      }, 1000);

    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setProjectName('');
    setValidationResult(null);
    setImportProgress(0);
    onClose();
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    return new Date(parseInt(timestamp)).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Import Analytics Data
          </DialogTitle>
          <DialogDescription>
            Import analytics data for <strong>{clientName}</strong>. The data will be associated with this client only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file-input">Select File</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="flex-1"
                disabled={isValidating || isImporting}
              />
              {selectedFile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setValidationResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isValidating || isImporting}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Supported formats: CSV, Excel (.xlsx, .xls). Max size: 10MB
            </p>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter a name for this analytics dataset"
              disabled={isValidating || isImporting}
            />
            <p className="text-sm text-muted-foreground">
              This name will help you identify this dataset later
            </p>
          </div>

          {/* Validation Status */}
          {isValidating && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-blue-600">Validating file...</span>
            </div>
          )}

          {validationResult && (
            <div className="space-y-4">
              {/* Validation Errors */}
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Validation Errors:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Validation Warnings */}
              {validationResult.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Warnings:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Summary */}
              {validationResult.isValid && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">File validation successful!</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{validationResult.summary.totalRows}</div>
                      <div className="text-sm text-gray-600">Data Rows</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{formatNumber(validationResult.summary.totalViews)}</div>
                      <div className="text-sm text-gray-600">{getDisplayLabel('page_views')}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{formatNumber(validationResult.summary.totalVisitors)}</div>
                      <div className="text-sm text-gray-600">{getDisplayLabel('visitors')}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{formatDuration(validationResult.summary.avgDuration)}</div>
                      <div className="text-sm text-gray-600">{getDisplayLabel('avg_time')}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="font-medium">Data Range:</span>
                      <span className="text-sm text-gray-600">
                        {formatDate(validationResult.summary.dateRange.start)} - {formatDate(validationResult.summary.dateRange.end)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{getDisplayLabel('resource_code')}s:</span>
                      <div className="flex gap-1">
                        {validationResult.summary.resourceCodes.map((code, index) => (
                          <Badge key={index} variant="secondary">{code}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Importing data...</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!validationResult?.isValid || !projectName.trim() || isImporting}
            className="flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4" />
                Import Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportAnalyticsDialog;

