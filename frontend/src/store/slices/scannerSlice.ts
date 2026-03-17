import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ScanResult, CodeAnalysisRequest, SupportedLanguage } from '../../types';
import { apiService } from '../../services/api';

interface ScannerState {
  code: string;
  language: SupportedLanguage;
  filename: string;
  isScanning: boolean;
  currentResult: ScanResult | null;
  scanHistory: ScanResult[];
  error: string | null;
  selectedVulnerability: string | null;
}

const initialState: ScannerState = {
  code: `# Example Python code with a potential vulnerability
import sqlite3

def get_user(user_id):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Potential SQL Injection vulnerability!
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
    
    return cursor.fetchone()

user_input = input("Enter user ID: ")
user = get_user(user_input)
print(user)
`,
  language: 'python',
  filename: '',
  isScanning: false,
  currentResult: null,
  scanHistory: [],
  error: null,
  selectedVulnerability: null,
};

// Async thunk for scanning code
export const scanCode = createAsyncThunk(
  'scanner/scanCode',
  async (request: CodeAnalysisRequest, { rejectWithValue }) => {
    try {
      const result = await apiService.analyzeCode(request);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Scan failed');
    }
  }
);

const scannerSlice = createSlice({
  name: 'scanner',
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.language = action.payload;
    },
    setFilename: (state, action: PayloadAction<string>) => {
      state.filename = action.payload;
    },
    clearResult: (state) => {
      state.currentResult = null;
      state.error = null;
    },
    selectVulnerability: (state, action: PayloadAction<string | null>) => {
      state.selectedVulnerability = action.payload;
    },
    clearHistory: (state) => {
      state.scanHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(scanCode.pending, (state) => {
        state.isScanning = true;
        state.error = null;
      })
      .addCase(scanCode.fulfilled, (state, action) => {
        state.isScanning = false;
        state.currentResult = action.payload;
        state.scanHistory.unshift(action.payload);
        // Keep only last 50 scans
        if (state.scanHistory.length > 50) {
          state.scanHistory = state.scanHistory.slice(0, 50);
        }
      })
      .addCase(scanCode.rejected, (state, action) => {
        state.isScanning = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCode,
  setLanguage,
  setFilename,
  clearResult,
  selectVulnerability,
  clearHistory,
} = scannerSlice.actions;

export default scannerSlice.reducer;
