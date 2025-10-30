// Auth Types
export interface AuthData {
  user: {
    id: string;
    name: string;
    mobile: string;
    role: 'admin' | 'teacher' | 'student';
    email?: string;
  };
  token: string;
  isAuthenticated: boolean;
}

export interface SignupData {
  name: string;
  mobile: string;
  email?: string;
  role: 'teacher' | 'student';
}

export interface OTPVerifyData {
  mobile: string;
  otp: string;
}

// Teacher Types
export interface Teacher {
  id: string;
  name: string;
  email: string;
  mobile: string;
  phone?: string;
  status: 'active' | 'inactive';
  totalStudents: number;
  totalTrades: number;
  totalCapital?: number;
  profitLoss?: number;
  winRate?: number;
  specialization?: string;
  joinedDate: string;
}

// Student Types
export interface Student {
  id: string;
  name: string;
  email: string;
  mobile: string;
  teacherId: string;
  teacherName?: string;
  status: 'active' | 'inactive';
  initialCapital?: number;
  currentCapital?: number;
  profitLoss?: number;
  riskPercentage?: number;
  strategy?: string;
  joinedDate: string;
}

// Trade Types
export interface Trade {
  id: string;
  teacherId: string;
  teacherName?: string;
  studentId?: string;
  studentName?: string;
  stock: string;
  quantity: number;
  price?: number;
  type: 'BUY' | 'SELL';
  exchange: 'NSE' | 'BSE';
  status: 'pending' | 'executed' | 'completed' | 'failed' | 'cancelled';
  executedAt?: string;
  createdAt: string;
  timestamp?: string;
  pnl?: number;
}

// Broker Types
export interface BrokerConfig {
  userId: string;
  brokerProvider: string;
  apiKey: string;
  apiSecret: string;
  accessToken?: string;
  isConnected: boolean;
  lastChecked?: string;
}

// Connection Request Types
export interface ConnectionRequest {
  id: string;
  studentId: string;
  teacherId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

