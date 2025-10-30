import { Teacher, Student, Trade, ActivityLog } from '@/types';

/**
 * Generate comprehensive dummy data for SyncKaro Admin
 * This data will be loaded into localStorage on app initialization
 */

// Teacher names and specializations
const teacherNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Neha Singh', 'Vikram Mehta',
  'Anjali Gupta', 'Sanjay Reddy', 'Kavita Joshi', 'Arjun Nair', 'Pooja Desai',
  'Rahul Verma', 'Deepika Rao', 'Karan Shah', 'Sneha Iyer', 'Rohan Kapoor',
  'Madhuri Kulkarni', 'Aditya Malhotra', 'Shruti Pandey', 'Varun Bhatia', 'Ritika Agarwal',
  'Nikhil Saxena', 'Divya Menon', 'Suresh Pillai', 'Ankita Khanna'
];

const specializations = [
  'Intraday Trading', 'Swing Trading', 'Options Trading', 'Futures Trading',
  'Technical Analysis', 'Fundamental Analysis', 'Scalping', 'Position Trading'
];

const studentFirstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Advik', 'Pratham', 'Reyansh', 'Kiaan', 'Aadhya', 'Ananya', 'Pari', 'Anika',
  'Navya', 'Angel', 'Diya', 'Myra', 'Sara', 'Ira', 'Anvi', 'Riya', 'Prisha', 'Aarohi',
  'Shanaya', 'Saanvi', 'Kavya', 'Aarya', 'Pihu', 'Avni', 'Aahana', 'Zara', 'Mishka', 'Nisha'
];

const lastNames = [
  'Kumar', 'Sharma', 'Patel', 'Singh', 'Gupta', 'Reddy', 'Joshi', 'Nair', 'Verma', 'Rao',
  'Shah', 'Iyer', 'Mehta', 'Desai', 'Kulkarni', 'Pandey', 'Agarwal', 'Saxena', 'Menon', 'Khanna'
];

const stocks = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK',
  'LT', 'AXISBANK', 'ASIANPAINT', 'MARUTI', 'TITAN', 'SUNPHARMA', 'ULTRACEMCO', 'NESTLEIND', 'BAJFINANCE', 'WIPRO'
];

const exchanges = ['NSE', 'BSE'] as const;
const tradeTypes = ['BUY', 'SELL'] as const;
const statuses = ['active', 'inactive'] as const;

// Helper functions
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate Teachers
export function generateTeachers(): Teacher[] {
  return teacherNames.map((name, index) => {
    const email = name.toLowerCase().replace(' ', '.') + '@synckaro.com';
    const phone = `${randomInt(6, 9)}${randomInt(100000000, 999999999)}`;
    const joinedDate = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
    const totalTrades = randomInt(50, 500);
    const winRate = randomFloat(45, 75);
    
    return {
      id: `teacher-${index + 1}`,
      name,
      email,
      phone,
      status: randomElement(statuses),
      joinedDate: joinedDate.toISOString(),
      totalStudents: randomInt(5, 30),
      totalTrades,
      specialization: randomElement(specializations),
      winRate,
      avgProfit: randomFloat(1000, 50000),
      totalPnL: randomFloat(-10000, 100000),
    };
  });
}

// Generate Students
export function generateStudents(teachers: Teacher[]): Student[] {
  const students: Student[] = [];
  let studentId = 1;

  teachers.forEach((teacher) => {
    const studentCount = teacher.totalStudents;
    
    for (let i = 0; i < studentCount; i++) {
      const firstName = randomElement(studentFirstNames);
      const lastName = randomElement(lastNames);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentId}@gmail.com`;
      const phone = `${randomInt(6, 9)}${randomInt(100000000, 999999999)}`;
      const initialCapital = randomInt(10, 100) * 5000; // 50k to 500k
      const currentCapital = initialCapital + randomFloat(-initialCapital * 0.3, initialCapital * 0.5);
      
      students.push({
        id: `student-${studentId}`,
        teacherId: teacher.id,
        name,
        email,
        phone,
        status: randomElement(statuses),
        initialCapital,
        currentCapital,
        broker: randomElement(['Zerodha', 'Upstox', 'Angel One', 'ICICI Direct', '5Paisa']),
        riskPercentage: randomInt(1, 5),
        strategy: randomElement(['Conservative', 'Moderate', 'Aggressive']),
        joinedDate: randomDate(new Date(teacher.joinedDate), new Date()).toISOString(),
      });
      
      studentId++;
    }
  });

  return students;
}

// Generate Trades
export function generateTrades(teachers: Teacher[], students: Student[]): Trade[] {
  const trades: Trade[] = [];
  let tradeId = 1;

  teachers.forEach((teacher) => {
    const teacherStudents = students.filter(s => s.teacherId === teacher.id);
    const tradeCount = Math.floor(teacher.totalTrades / 2); // Teacher's own trades
    
    // Generate teacher's trades
    for (let i = 0; i < tradeCount; i++) {
      const stock = randomElement(stocks);
      const quantity = randomInt(1, 20) * 10;
      const price = randomFloat(100, 5000);
      const type = randomElement(tradeTypes);
      const timestamp = randomDate(new Date(teacher.joinedDate), new Date());
      
      trades.push({
        id: `trade-${tradeId}`,
        teacherId: teacher.id,
        studentId: null,
        stock,
        quantity,
        price,
        type,
        exchange: randomElement(exchanges),
        timestamp: timestamp.toISOString(),
        status: 'completed',
        pnl: randomFloat(-5000, 15000),
      });
      
      tradeId++;
    }

    // Generate students' copied trades (fewer than teacher)
    teacherStudents.forEach((student) => {
      const studentTradeCount = randomInt(5, 20);
      
      for (let i = 0; i < studentTradeCount; i++) {
        const stock = randomElement(stocks);
        const quantity = randomInt(1, 10) * 5;
        const price = randomFloat(100, 5000);
        const type = randomElement(tradeTypes);
        const timestamp = randomDate(new Date(student.joinedDate), new Date());
        
        trades.push({
          id: `trade-${tradeId}`,
          teacherId: teacher.id,
          studentId: student.id,
          stock,
          quantity,
          price,
          type,
          exchange: randomElement(exchanges),
          timestamp: timestamp.toISOString(),
          status: 'completed',
          pnl: randomFloat(-2000, 8000),
        });
        
        tradeId++;
      }
    });
  });

  return trades;
}

// Generate Activity Logs
export function generateActivityLogs(teachers: Teacher[], students: Student[], trades: Trade[]): ActivityLog[] {
  const logs: ActivityLog[] = [];
  let logId = 1;

  teachers.forEach((teacher) => {
    // Teacher joined log
    logs.push({
      id: `log-${logId++}`,
      teacherId: teacher.id,
      action: 'profile_created',
      timestamp: teacher.joinedDate,
      details: `${teacher.name} joined the platform`,
    });

    // Student addition logs
    const teacherStudents = students.filter(s => s.teacherId === teacher.id);
    teacherStudents.forEach((student) => {
      logs.push({
        id: `log-${logId++}`,
        teacherId: teacher.id,
        action: 'student_added',
        timestamp: student.joinedDate,
        details: `Added student: ${student.name}`,
      });
    });

    // Trade logs (sample - not all trades)
    const teacherTrades = trades.filter(t => t.teacherId === teacher.id).slice(0, 20);
    teacherTrades.forEach((trade) => {
      logs.push({
        id: `log-${logId++}`,
        teacherId: teacher.id,
        action: 'trade_executed',
        timestamp: trade.timestamp,
        details: `${trade.type} ${trade.quantity} ${trade.stock} @ ₹${trade.price.toFixed(2)} on ${trade.exchange}`,
      });
    });

    // Random profile updates
    for (let i = 0; i < randomInt(1, 3); i++) {
      logs.push({
        id: `log-${logId++}`,
        teacherId: teacher.id,
        action: 'profile_updated',
        timestamp: randomDate(new Date(teacher.joinedDate), new Date()).toISOString(),
        details: 'Updated profile information',
      });
    }
  });

  // Sort by timestamp (newest first)
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Main function to generate all seed data
export function generateAllSeedData() {
  const teachers = generateTeachers();
  const students = generateStudents(teachers);
  const trades = generateTrades(teachers, students);
  const activityLogs = generateActivityLogs(teachers, students, trades);

  return {
    teachers,
    students,
    trades,
    activityLogs,
    generatedAt: new Date().toISOString(),
  };
}

