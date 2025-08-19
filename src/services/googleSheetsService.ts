// Google Sheets API Service using Google Apps Script
// Replace YOUR_SCRIPT_ID with your actual Google Apps Script deployment ID
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

export interface GoogleSheetsResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SheetMember {
  name: string;
  okx: number;
  bitget: number;
  mexc: number;
  bingx: number;
  total: number;
}

export interface SheetMonthlyData {
  month: string;
  profit: number;
  members: number;
}

export interface AllSheetData {
  members: SheetMember[];
  monthlyData: SheetMonthlyData[];
  config: Array<{ [key: string]: any }>;
  lastUpdated: string;
}

class GoogleSheetsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = GOOGLE_APPS_SCRIPT_URL;
  }

  // ==================== GET METHODS ====================
  
  async getAllData(): Promise<AllSheetData> {
    try {
      const response = await fetch(`${this.baseUrl}?action=getAllData`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GoogleSheetsResponse<AllSheetData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data from Google Sheets');
      }

      return result.data!;
    } catch (error) {
      console.error('Error fetching all data from Google Sheets:', error);
      throw error;
    }
  }

  async getMembers(): Promise<SheetMember[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=getMembers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GoogleSheetsResponse<SheetMember[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch members from Google Sheets');
      }

      return result.data!;
    } catch (error) {
      console.error('Error fetching members from Google Sheets:', error);
      throw error;
    }
  }

  async getMonthlyData(): Promise<SheetMonthlyData[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=getMonthlyData`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GoogleSheetsResponse<SheetMonthlyData[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch monthly data from Google Sheets');
      }

      return result.data!;
    } catch (error) {
      console.error('Error fetching monthly data from Google Sheets:', error);
      throw error;
    }
  }

  // ==================== POST METHODS ====================

  async updateMembers(members: SheetMember[]): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateMembers',
          members: members
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GoogleSheetsResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update members in Google Sheets');
      }
    } catch (error) {
      console.error('Error updating members in Google Sheets:', error);
      throw error;
    }
  }

  async updateMonthlyData(monthlyData: SheetMonthlyData[]): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateMonthlyData',
          monthlyData: monthlyData
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GoogleSheetsResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update monthly data in Google Sheets');
      }
    } catch (error) {
      console.error('Error updating monthly data in Google Sheets:', error);
      throw error;
    }
  }

  async updateAllData(data: { members?: SheetMember[]; monthlyData?: SheetMonthlyData[] }): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateAllData',
          ...data
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GoogleSheetsResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update data in Google Sheets');
      }
    } catch (error) {
      console.error('Error updating all data in Google Sheets:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Test connection to Google Sheets
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getAllData();
      return true;
    } catch (error) {
      console.error('Google Sheets connection test failed:', error);
      return false;
    }
  }

  /**
   * Convert dashboard member data to Google Sheets format
   */
  convertMemberToSheetFormat(members: any[]): SheetMember[] {
    return members.map(member => ({
      name: member.name,
      okx: parseFloat(member.okx?.toString() || '0'),
      bitget: parseFloat(member.bitget?.toString() || '0'),
      mexc: parseFloat(member.mexc?.toString() || '0'),
      bingx: parseFloat(member.bingx?.toString() || '0'),
      total: parseFloat(member.total?.toString() || '0')
    }));
  }

  /**
   * Convert dashboard monthly data to Google Sheets format
   */
  convertMonthlyToSheetFormat(monthlyData: any[]): SheetMonthlyData[] {
    return monthlyData.map(data => ({
      month: data.month,
      profit: parseFloat(data.profit?.toString() || '0'),
      members: parseInt(data.members?.toString() || '0')
    }));
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;