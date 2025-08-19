import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Settings,
  ExternalLink 
} from 'lucide-react';
import { UseGoogleSheetsReturn } from '@/hooks/useGoogleSheets';
import { cn } from '@/lib/utils';

interface GoogleSheetsSyncProps {
  googleSheets: UseGoogleSheetsReturn;
  onFetchData?: () => void;
  onPushData?: () => void;
  dashboardData?: {
    members: any[];
    monthlyData: any[];
  };
}

export const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({
  googleSheets,
  onFetchData,
  onPushData,
  dashboardData
}) => {
  const {
    isLoading,
    isConnected,
    lastSyncTime,
    sheetsData,
    fetchFromSheets,
    pushToSheets,
    testConnection,
    syncBidirectional
  } = googleSheets;

  const handleFetchFromSheets = async () => {
    try {
      await fetchFromSheets();
      onFetchData?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handlePushToSheets = async () => {
    if (!dashboardData) {
      console.warn('No dashboard data available to push');
      return;
    }
    
    try {
      await pushToSheets(dashboardData);
      onPushData?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleSync = async () => {
    try {
      await syncBidirectional();
      onFetchData?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Google Sheets Integration
            </CardTitle>
            <CardDescription>
              Sync your dashboard data with Google Sheets in real-time
            </CardDescription>
          </div>
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {isConnected ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Connection Status</p>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Last Sync</p>
            <p className="text-sm text-muted-foreground">
              {lastSyncTime ? lastSyncTime.toLocaleString() : 'Never'}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Data Status</p>
            <p className="text-sm text-muted-foreground">
              {sheetsData ? `${sheetsData.members?.length || 0} members` : 'No data'}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={testConnection}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
          
          <Button
            onClick={handleFetchFromSheets}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Pull from Sheets
          </Button>
          
          <Button
            onClick={handlePushToSheets}
            disabled={isLoading || !dashboardData}
            variant="outline"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Push to Sheets
          </Button>
          
          <Button
            onClick={handleSync}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              isLoading && "animate-spin"
            )} />
            Sync Now
          </Button>
        </div>

        {/* Setup Instructions */}
        {!isConnected && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Update the <code>YOUR_SCRIPT_ID</code> in <code>googleSheetsService.ts</code></li>
              <li>Make sure your Google Sheet has the correct structure</li>
              <li>Ensure your Google Apps Script is deployed as a web app</li>
              <li>Click "Test Connection" to verify the setup</li>
            </ol>
            <Button
              variant="link"
              size="sm"
              className="mt-2 p-0 h-auto"
              onClick={() => window.open('https://script.google.com/home', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open Google Apps Script
            </Button>
          </div>
        )}

        {/* Data Preview */}
        {sheetsData && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Latest Sheet Data:</h4>
            <div className="text-sm text-muted-foreground">
              <p>Members: {sheetsData.members?.length || 0}</p>
              <p>Monthly Records: {sheetsData.monthlyData?.length || 0}</p>
              <p>Last Updated: {sheetsData.lastUpdated ? new Date(sheetsData.lastUpdated).toLocaleString() : 'Unknown'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};