// Google Apps Script for Sheet ID: 13Q_wFU_WokC887IqqcwivfF1ScbBhxptYPn-OabOtNc
// Copy this entire code into your Google Apps Script Code.gs file

const SHEET_ID = '13Q_wFU_WokC887IqqcwivfF1ScbBhxptYPn-OabOtNc';
const MEMBER_RANGE = 'G1:K21';  // Your member data range
const MONTHLY_RANGE = 'U1:V5';  // Your monthly data range

// CORS headers for all responses
function setCorsHeaders(response) {
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
}

// Handle GET requests
function doGet(e) {
  try {
    const action = e.parameter.action || 'getAllData';
    
    switch (action) {
      case 'getAllData':
        return setCorsHeaders(getAllData());
      case 'getMembers':
        return setCorsHeaders(getMembers());
      case 'getMonthlyData':
        return setCorsHeaders(getMonthlyData());
      case 'testConnection':
        return setCorsHeaders({ success: true, message: 'Connection successful', timestamp: new Date().toISOString() });
      default:
        return setCorsHeaders({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('doGet error:', error);
    return setCorsHeaders({ success: false, error: error.toString() });
  }
}

// Handle POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch (action) {
      case 'updateMembers':
        return setCorsHeaders(updateMembers(data.members));
      case 'updateMonthlyData':
        return setCorsHeaders(updateMonthlyData(data.monthlyData));
      case 'updateAllData':
        return setCorsHeaders(updateAllData(data));
      default:
        return setCorsHeaders({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('doPost error:', error);
    return setCorsHeaders({ success: false, error: error.toString() });
  }
}

// Get all data from both sheets
function getAllData() {
  try {
    const members = getMembers().data;
    const monthlyData = getMonthlyData().data;
    
    return {
      success: true,
      data: {
        members: members,
        monthlyData: monthlyData,
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('getAllData error:', error);
    return { success: false, error: error.toString() };
  }
}

// Get members data
function getMembers() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const range = sheet.getRange(MEMBER_RANGE);
    const values = range.getValues();
    
    // Skip header row and process data
    const members = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] && row[0].toString().trim() !== '') { // Check if name exists
        members.push({
          name: row[0].toString().trim(),
          okx: parseNumber(row[1]),
          bitget: parseNumber(row[2]),
          mexc: parseNumber(row[3]),
          bingx: parseNumber(row[4]),
          total: calculateTotal(row[1], row[2], row[3], row[4])
        });
      }
    }
    
    return { success: true, data: members };
  } catch (error) {
    console.error('getMembers error:', error);
    return { success: false, error: error.toString() };
  }
}

// Get monthly data
function getMonthlyData() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const range = sheet.getRange(MONTHLY_RANGE);
    const values = range.getValues();
    
    // Skip header row and process data
    const monthlyData = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] && row[0].toString().trim() !== '') { // Check if month exists
        monthlyData.push({
          month: row[0].toString().trim(),
          profit: parseNumber(row[1]) || 0,
          members: 0 // Not used in your structure
        });
      }
    }
    
    return { success: true, data: monthlyData };
  } catch (error) {
    console.error('getMonthlyData error:', error);
    return { success: false, error: error.toString() };
  }
}

// Update members data
function updateMembers(members) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Prepare data for writing (skip header row)
    const dataToWrite = members.map(member => [
      member.name,
      member.okx || '',
      member.bitget || '',
      member.mexc || '',
      member.bingx || ''
    ]);
    
    // Clear existing data (except header)
    const startRow = 2; // Skip header
    const numRows = Math.max(dataToWrite.length, 19); // Ensure we clear all existing data
    const clearRange = sheet.getRange(`G${startRow}:K${startRow + numRows - 1}`);
    clearRange.clear();
    
    // Write new data
    if (dataToWrite.length > 0) {
      const writeRange = sheet.getRange(`G${startRow}:K${startRow + dataToWrite.length - 1}`);
      writeRange.setValues(dataToWrite);
    }
    
    return { success: true, message: 'Members updated successfully' };
  } catch (error) {
    console.error('updateMembers error:', error);
    return { success: false, error: error.toString() };
  }
}

// Update monthly data
function updateMonthlyData(monthlyData) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Prepare data for writing (skip header row)
    const dataToWrite = monthlyData.map(data => [
      data.month,
      data.profit || 0
    ]);
    
    // Clear existing data (except header)
    const startRow = 2; // Skip header
    const numRows = Math.max(dataToWrite.length, 4); // Ensure we clear all existing data
    const clearRange = sheet.getRange(`U${startRow}:V${startRow + numRows - 1}`);
    clearRange.clear();
    
    // Write new data
    if (dataToWrite.length > 0) {
      const writeRange = sheet.getRange(`U${startRow}:V${startRow + dataToWrite.length - 1}`);
      writeRange.setValues(dataToWrite);
    }
    
    return { success: true, message: 'Monthly data updated successfully' };
  } catch (error) {
    console.error('updateMonthlyData error:', error);
    return { success: false, error: error.toString() };
  }
}

// Update all data
function updateAllData(data) {
  try {
    let results = { success: true, messages: [] };
    
    if (data.members) {
      const membersResult = updateMembers(data.members);
      if (!membersResult.success) {
        results.success = false;
        results.messages.push('Members update failed: ' + membersResult.error);
      } else {
        results.messages.push('Members updated successfully');
      }
    }
    
    if (data.monthlyData) {
      const monthlyResult = updateMonthlyData(data.monthlyData);
      if (!monthlyResult.success) {
        results.success = false;
        results.messages.push('Monthly data update failed: ' + monthlyResult.error);
      } else {
        results.messages.push('Monthly data updated successfully');
      }
    }
    
    return results;
  } catch (error) {
    console.error('updateAllData error:', error);
    return { success: false, error: error.toString() };
  }
}

// Helper function to parse numbers
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  
  const str = value.toString().trim().toLowerCase();
  if (str === 'x' || str === '~' || str === '-') return null;
  
  // Remove currency symbols and spaces
  const cleaned = str.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Helper function to calculate total
function calculateTotal(okx, bitget, mexc, bingx) {
  const values = [okx, bitget, mexc, bingx].map(v => parseNumber(v) || 0);
  return values.reduce((sum, val) => sum + val, 0);
}

// Handle OPTIONS requests for CORS
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
}