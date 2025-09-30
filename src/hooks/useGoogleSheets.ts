import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import sheetDBService, { AllSheetData, SheetMember, SheetMonthlyData } from '../services/googleSheetsService';

export interface UseGoogleSheetsReturn {
  // State
  isLoading: boolean;
  isConnected: boolean;
  lastSyncTime: Date | null;
  
  // Data
  sheetsData: AllSheetData | null;
  
  // Methods
  fetchFromSheets: () => Promise<void>;
  pushToSheets: (data: { members?: any[]; monthlyData?: any[] }) => Promise<void>;
  testConnection: () => Promise<boolean>;
  syncBidirectional: () => Promise<void>;
}

export const useGoogleSheets = (): UseGoogleSheetsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem('lastSyncTime');
    return saved ? new Date(saved) : null;
  });
  const [sheetsData, setSheetsData] = useState<AllSheetData | null>(() => {
    const saved = localStorage.getItem('sheetsData');
    return saved ? JSON.parse(saved) : null;
  });

  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const connected = await sheetDBService.testConnection();
      setIsConnected(connected);
      
      if (connected) {
        toast.success('✅ Google Sheets connected successfully!');
      } else {
        toast.error('❌ Failed to connect to Google Sheets');
      }
      
      return connected;
    } catch (error) {
      console.error('Connection test error:', error);
      setIsConnected(false);
      toast.error('❌ Google Sheets connection failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFromSheets = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      toast.loading('📥 Fetching data from Google Sheets...', { id: 'fetch-sheets' });
      
      const data = await sheetDBService.getAllData();
      setSheetsData(data);
      const now = new Date();
      setLastSyncTime(now);
      setIsConnected(true);
      
      // Save to localStorage
      localStorage.setItem('sheetsData', JSON.stringify(data));
      localStorage.setItem('lastSyncTime', now.toISOString());
      
      toast.success('✅ Data fetched from Google Sheets successfully!', { id: 'fetch-sheets' });
    } catch (error) {
      console.error('Fetch from sheets error:', error);
      setIsConnected(false);
      toast.error('❌ Failed to fetch data from Google Sheets', { id: 'fetch-sheets' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pushToSheets = useCallback(async (data: { members?: any[]; monthlyData?: any[] }): Promise<void> => {
    try {
      setIsLoading(true);
      toast.loading('📤 Pushing data to Google Sheets...', { id: 'push-sheets' });
      
      const updateData: { members?: SheetMember[]; monthlyData?: SheetMonthlyData[] } = {};
      
      if (data.members) {
        updateData.members = sheetDBService.convertMemberToSheetFormat(data.members);
      }
      
      if (data.monthlyData) {
        updateData.monthlyData = sheetDBService.convertMonthlyToSheetFormat(data.monthlyData);
      }
      
      await sheetDBService.updateAllData(updateData);
      setLastSyncTime(new Date());
      setIsConnected(true);
      
      toast.success('✅ Data pushed to Google Sheets successfully!', { id: 'push-sheets' });
    } catch (error) {
      console.error('Push to sheets error:', error);
      setIsConnected(false);
      toast.error('❌ Failed to push data to Google Sheets', { id: 'push-sheets' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncBidirectional = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      toast.loading('🔄 Syncing with Google Sheets...', { id: 'sync-sheets' });
      
      // First fetch the latest data from sheets
      const data = await sheetDBService.getAllData();
      setSheetsData(data);
      const now = new Date();
      setLastSyncTime(now);
      setIsConnected(true);
      
      // Save to localStorage
      localStorage.setItem('sheetsData', JSON.stringify(data));
      localStorage.setItem('lastSyncTime', now.toISOString());
      
      toast.success('🔄 Synced with Google Sheets successfully!', { id: 'sync-sheets' });
    } catch (error) {
      console.error('Bidirectional sync error:', error);
      setIsConnected(false);
      toast.error('❌ Failed to sync with Google Sheets', { id: 'sync-sheets' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    isConnected,
    lastSyncTime,
    sheetsData,
    
    // Methods
    fetchFromSheets,
    pushToSheets,
    testConnection,
    syncBidirectional,
  };
};