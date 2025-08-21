// SheetDB API Service
// Connected to your SheetDB API
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/jkhg2q6w3ubsa';

export interface SheetDBResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SheetMember {
  name: string;
  okx: number | null;
  bitget: number | null;
  mexc: number | null;
  bingx: number | null;
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
  lastUpdated: string;
}

class SheetDBService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = SHEETDB_API_URL;
  }

  // ==================== GET METHODS ====================
  
  async getAllData(): Promise<AllSheetData> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // SheetDB returns array directly, process it to match our interface
      const members: SheetMember[] = data
        .filter((row: any) => row.name && row.name.trim() !== '')
        .map((row: any) => ({
          name: row.name || '',
          okx: this.parseNumber(row.okx),
          bitget: this.parseNumber(row.bitget),
          mexc: this.parseNumber(row.mexc),
          bingx: this.parseNumber(row.bingx),
          total: this.calculateTotal(row.okx, row.bitget, row.mexc, row.bingx)
        }));

      // For now, return empty monthly data as it's in a different sheet structure
      const monthlyData: SheetMonthlyData[] = [];

      return {
        members,
        monthlyData,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching all data from SheetDB:', error);
      throw error;
    }
  }

  async getMembers(): Promise<SheetMember[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return data
        .filter((row: any) => row.name && row.name.trim() !== '')
        .map((row: any) => ({
          name: row.name || '',
          okx: this.parseNumber(row.okx),
          bitget: this.parseNumber(row.bitget),
          mexc: this.parseNumber(row.mexc),
          bingx: this.parseNumber(row.bingx),
          total: this.calculateTotal(row.okx, row.bitget, row.mexc, row.bingx)
        }));
    } catch (error) {
      console.error('Error fetching members from SheetDB:', error);
      throw error;
    }
  }

  async getMonthlyData(): Promise<SheetMonthlyData[]> {
    try {
      // For now, return empty array as monthly data might be in a different sheet
      // You can extend this to fetch from a different SheetDB endpoint if needed
      return [];
    } catch (error) {
      console.error('Error fetching monthly data from SheetDB:', error);
      throw error;
    }
  }

  // ==================== POST METHODS ====================

  async updateMembers(members: SheetMember[]): Promise<void> {
    try {
      // First, delete all existing data
      await fetch(this.baseUrl + '/all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Then insert new data
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          members.map(member => ({
            name: member.name,
            okx: member.okx || '',
            bitget: member.bitget || '',
            mexc: member.mexc || '',
            bingx: member.bingx || '',
            total: member.total || 0
          }))
        ),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating members in SheetDB:', error);
      throw error;
    }
  }

  async updateMonthlyData(monthlyData: SheetMonthlyData[]): Promise<void> {
    try {
      // Monthly data update - for now just log as it might be in a different sheet
      console.log('Monthly data update not implemented for SheetDB yet:', monthlyData);
    } catch (error) {
      console.error('Error updating monthly data in SheetDB:', error);
      throw error;
    }
  }

  async updateAllData(data: { members?: SheetMember[]; monthlyData?: SheetMonthlyData[] }): Promise<void> {
    try {
      if (data.members) {
        await this.updateMembers(data.members);
      }
      
      if (data.monthlyData) {
        await this.updateMonthlyData(data.monthlyData);
      }
    } catch (error) {
      console.error('Error updating all data in SheetDB:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Test connection to SheetDB
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection to:', this.baseUrl);
      
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        console.error('HTTP error! status:', response.status);
        return false;
      }

      const result = await response.json();
      console.log('Response data:', result);
      
      if (Array.isArray(result)) {
        console.log('✅ SheetDB connection successful');
        return true;
      } else {
        console.error('❌ SheetDB returned unexpected format:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ SheetDB connection test failed:', error);
      return false;
    }
  }

  /**
   * Helper function to parse numbers
   */
  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return value;
    
    const str = value.toString().trim().toLowerCase();
    if (str === 'x' || str === '~' || str === '-') return null;
    
    // Remove currency symbols and spaces
    const cleaned = str.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  /**
   * Helper function to calculate total
   */
  private calculateTotal(okx: any, bitget: any, mexc: any, bingx: any): number {
    const values = [okx, bitget, mexc, bingx].map(v => this.parseNumber(v) || 0);
    return values.reduce((sum, val) => sum + val, 0);
  }

  /**
   * Convert dashboard member data to Sheet format
   */
  convertMemberToSheetFormat(members: any[]): SheetMember[] {
    return members.map(member => ({
      name: member.name,
      okx: member.okx,
      bitget: member.bitget,
      mexc: member.mexc,
      bingx: member.bingx,
      total: member.total
    }));
  }

  /**
   * Convert dashboard monthly data to Sheet format
   */
  convertMonthlyToSheetFormat(monthlyData: any[]): SheetMonthlyData[] {
    return monthlyData.map(data => ({
      month: data.month,
      profit: data.profit,
      members: 0 // Not used in your sheet structure
    }));
  }
}

// Export singleton instance
export const sheetDBService = new SheetDBService();
export default sheetDBService;