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

export interface IncomeData {
  month: string;
  myProfit: number;
  vendorProfit: number;
}

export interface AllSheetData {
  members: SheetMember[];
  monthlyData: SheetMonthlyData[];
  incomeData: IncomeData[];
  totalInEligibleAccounts: number;
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
        .filter((row: any) => row.Name && row.Name.trim() !== '')
        .map((row: any) => ({
          name: row.Name || '',
          okx: this.parseNumber(row.OKX),
          bitget: this.parseNumber(row.Bitget),
          mexc: this.parseNumber(row.MEXC),
          bingx: this.parseNumber(row.BingX),
          total: this.calculateTotal(row.OKX, row.Bitget, row.MEXC, row.BingX)
        }));

      // Get income data from the same sheet
      const incomeData = await this.getIncomeData();
      const monthlyData: SheetMonthlyData[] = [];
      
      // Get total in-eligible accounts from G20:H20 range
      console.log('Raw data structure for debugging:', data.slice(0, 5)); // Log first 5 rows
      const totalInEligibleAccounts = await this.getTotalInEligibleAccounts(data);

      return {
        members,
        monthlyData,
        incomeData,
        totalInEligibleAccounts,
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
        .filter((row: any) => row.Name && row.Name.trim() !== '')
        .map((row: any) => ({
          name: row.Name || '',
          okx: this.parseNumber(row.OKX),
          bitget: this.parseNumber(row.Bitget),
          mexc: this.parseNumber(row.MEXC),
          bingx: this.parseNumber(row.BingX),
          total: this.calculateTotal(row.OKX, row.Bitget, row.MEXC, row.BingX)
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
            Name: member.name,
            OKX: member.okx || '',
            Bitget: member.bitget || '',
            MEXC: member.mexc || '',
            BingX: member.bingx || '',
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

  async getIncomeData(): Promise<IncomeData[]> {
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
      console.log('Raw sheet data for income parsing:', data);
      
      const incomeData: IncomeData[] = [];
      
      // Find rows with months in "My Income" column and extract corresponding profit values
      // First, collect all rows with month data 
      const monthRows: { [key: string]: { myProfit: number; vendorProfit: number } } = {};
      
      // Look for vendor income section marker
      let vendorIncomeStartIndex = -1;
      data.forEach((row: any, index: number) => {
        if (row["My Income"] && row["My Income"].toString().includes("Vendor Income")) {
          vendorIncomeStartIndex = index;
          console.log('Found Vendor Income section at index:', index);
        }
      });
      
      // Process all rows to extract month and profit data
      data.forEach((row: any, index: number) => {
        const myIncomeValue = row["My Income"];
        
        // Check if this row contains a month (has "2025" in it)
        if (myIncomeValue && myIncomeValue.toString().includes("2025")) {
          const month = myIncomeValue.toString().trim();
          console.log(`Found month: ${month} at index ${index}`);
          
          // Initialize month entry if not exists
          if (!monthRows[month]) {
            monthRows[month] = { myProfit: 0, vendorProfit: 0 };
          }
          
          // Find the corresponding profit value - could be in various columns
          let profitValue = 0;
          
          // Check columns for profit data - try different column names
          const possibleProfitColumns = ['Profit', 'Amount', row[Object.keys(row)[Object.keys(row).length - 2]]]; // Last column before "My Income"
          
          for (const col of Object.keys(row)) {
            if (col !== 'My Income' && col !== 'Name' && col !== 'OKX' && col !== 'Bitget' && col !== 'MEXC' && col !== 'BingX' && col !== '') {
              const value = this.parseNumber(row[col]);
              if (value && value > 0) {
                profitValue = value;
                console.log(`Found profit value ${profitValue} in column ${col} for month ${month}`);
                break;
              }
            }
          }
          
          // If we still haven't found a profit value, check if the next row has profit data
          if (profitValue === 0 && index + 1 < data.length) {
            const nextRow = data[index + 1];
            for (const col of Object.keys(nextRow)) {
              if (col !== 'My Income' && col !== 'Name' && col !== 'OKX' && col !== 'Bitget' && col !== 'MEXC' && col !== 'BingX' && col !== '') {
                const value = this.parseNumber(nextRow[col]);
                if (value && value > 0) {
                  profitValue = value;
                  console.log(`Found profit value ${profitValue} in next row column ${col} for month ${month}`);
                  break;
                }
              }
            }
          }
          
          // Determine if this is vendor income or my income based on position relative to vendor section
          if (vendorIncomeStartIndex !== -1 && index > vendorIncomeStartIndex) {
            monthRows[month].vendorProfit = profitValue;
            console.log(`Assigned ${profitValue} as vendor profit for ${month}`);
          } else {
            monthRows[month].myProfit = profitValue;
            console.log(`Assigned ${profitValue} as my profit for ${month}`);
          }
        }
      });
      
      // Convert to IncomeData array
      for (const [month, profits] of Object.entries(monthRows)) {
        incomeData.push({
          month,
          myProfit: profits.myProfit,
          vendorProfit: profits.vendorProfit
        });
      }
      
      console.log('Final parsed income data:', incomeData);
      
      // If we found data, return it, otherwise use fallback
      if (incomeData.length > 0) {
        return incomeData;
      }
      
      // Fallback data
      const fallbackData = [
        { month: 'May 2025', myProfit: 96, vendorProfit: 0 },
        { month: 'June 2025', myProfit: 200, vendorProfit: 123 },
        { month: 'July 2025', myProfit: 189, vendorProfit: 216 },
        { month: 'August 2025', myProfit: 60, vendorProfit: 105 }
      ];
      
      console.log('Using fallback income data:', fallbackData);
      return fallbackData;
      
    } catch (error) {
      console.error('Error fetching income data from SheetDB:', error);
      
      // Return fallback data
      return [
        { month: 'May 2025', myProfit: 96, vendorProfit: 0 },
        { month: 'June 2025', myProfit: 200, vendorProfit: 123 },
        { month: 'July 2025', myProfit: 189, vendorProfit: 216 },
        { month: 'August 2025', myProfit: 60, vendorProfit: 105 }
      ];
    }
  }

  /**
   * Get Total In-Eligible Accounts from G20:H20 range
   */
  private async getTotalInEligibleAccounts(data: any[]): Promise<number> {
    try {
      // Find the row that contains "Total In-Eligible Accounts" in the "My Income" column
      const totalRowIndex = data.findIndex(row => 
        row["My Income"] && row["My Income"].toString().includes("Total In-Eligible Accounts")
      );
      
      if (totalRowIndex !== -1 && totalRowIndex + 1 < data.length) {
        // Get the value from the next row in the same "My Income" column
        const nextRow = data[totalRowIndex + 1];
        const value = this.parseNumber(nextRow["My Income"]);
        
        console.log(`Found Total In-Eligible Accounts at row ${totalRowIndex}, next row value:`, nextRow["My Income"], 'parsed as:', value);
        
        if (value && value > 0) {
          return value;
        }
      }
      
      // Fallback
      console.log('Could not find Total In-Eligible Accounts in sheet data. Using fallback value.');
      return 50;
    } catch (error) {
      console.error('Error getting total in-eligible accounts:', error);
      return 50;
    }
  }
}

// Export singleton instance
export const sheetDBService = new SheetDBService();
export default sheetDBService;