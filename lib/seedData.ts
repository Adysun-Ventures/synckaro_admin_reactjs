import { ActivityLog, Student, Teacher, Trade } from '@/types';

const TEACHER_NAMES = [
  'Rajesh Kumar',
  'Priya Sharma',
  'Amit Patel',
  'Neha Singh',
  'Vikram Mehta',
  'Anjali Gupta',
  'Sanjay Reddy',
  'Kavita Joshi',
  'Arjun Nair',
  'Pooja Desai',
  'Rahul Verma',
  'Deepika Rao',
];

const TEACHER_SPECIALISATIONS = [
  'Intraday Trading',
  'Swing Trading',
  'Options Strategies',
  'Futures & Hedging',
  'Technical Analysis',
  'Fundamental Insights',
  'Momentum Trading',
  'Position Building',
];

const TEACHER_STATUSES: Teacher['status'][] = ['active', 'live', 'open', 'inactive', 'test', 'close'];

const STUDENT_FIRST_NAMES = [
  'Aarav',
  'Vivaan',
  'Aditya',
  'Vihaan',
  'Arjun',
  'Sai',
  'Arnav',
  'Ayaan',
  'Krishna',
  'Ishaan',
  'Shaurya',
  'Atharv',
  'Advik',
  'Pratham',
  'Reyansh',
  'Kiaan',
  'Ananya',
  'Pari',
  'Navya',
  'Aanya',
];

const STUDENT_LAST_NAMES = [
  'Kumar',
  'Sharma',
  'Patel',
  'Singh',
  'Gupta',
  'Reddy',
  'Joshi',
  'Nair',
  'Verma',
  'Rao',
  'Shah',
  'Iyer',
  'Mehta',
  'Desai',
  'Kulkarni',
  'Pandey',
  'Agarwal',
  'Saxena',
  'Menon',
  'Khanna',
];

const STRATEGIES = ['Conservative', 'Moderate', 'Aggressive', 'Momentum', 'Swing'];
const BROKERS = ['Zerodha', 'Upstox', 'Angel One', 'ICICI Direct', '5Paisa'];

const STOCKS = [
  'RELIANCE',
  'TCS',
  'HDFCBANK',
  'INFY',
  'ICICIBANK',
  'HINDUNILVR',
  'ITC',
  'SBIN',
  'BHARTIARTL',
  'KOTAKBANK',
  'LT',
  'AXISBANK',
  'ASIANPAINT',
  'MARUTI',
  'TITAN',
  'SUNPHARMA',
  'ULTRACEMCO',
  'NESTLEIND',
  'BAJFINANCE',
  'WIPRO',
];

const EXCHANGES: Array<Trade['exchange']> = ['NSE', 'BSE'];
const TRADE_STATUSES: Trade['status'][] = ['executed', 'completed', 'pending', 'failed', 'cancelled'];

const BASE_TEACHER_JOIN = new Date('2023-01-09T09:30:00.000Z');
const BASE_STUDENT_JOIN = new Date('2024-01-04T09:15:00.000Z');
const BASE_TRADE_TIME = new Date('2024-02-12T10:00:00.000Z');

type StudentMap = Record<string, Student[]>;
type TradeMap = Record<string, Trade[]>;

const DAY = 24 * 60 * 60 * 1000;

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');

const teacherMobile = (index: number) => (9100000000 + index * 137).toString();
const studentMobile = (index: number) => (9200000000 + index * 97).toString();

function createTeachers(): Teacher[] {
  return TEACHER_NAMES.map((name, index) => {
    const joinedDate = new Date(BASE_TEACHER_JOIN.getTime() + index * 18 * DAY);
    return {
      id: `teacher-${index + 1}`,
      name,
      email: `${toSlug(name)}@synckaro.com`,
      mobile: teacherMobile(index),
      phone: `+91-${teacherMobile(index).slice(0, 5)}-${teacherMobile(index).slice(5)}`,
      status: TEACHER_STATUSES[index % TEACHER_STATUSES.length],
      totalStudents: 0,
      totalTrades: 0,
      totalCapital: 0,
      profitLoss: 0,
      winRate: 0,
      specialization: TEACHER_SPECIALISATIONS[index % TEACHER_SPECIALISATIONS.length],
      joinedDate: joinedDate.toISOString(),
    };
  });
}

function createStudents(teachers: Teacher[]) {
  const students: Student[] = [];
  const studentsByTeacher: StudentMap = {};
  let studentCounter = 1;

  teachers.forEach((teacher, teacherIndex) => {
    const allocation = 6 + (teacherIndex % 4);
    const teacherStudents: Student[] = [];

    for (let idx = 0; idx < allocation; idx++) {
      const first = STUDENT_FIRST_NAMES[(studentCounter + idx + teacherIndex) % STUDENT_FIRST_NAMES.length];
      const last = STUDENT_LAST_NAMES[(teacherIndex + idx) % STUDENT_LAST_NAMES.length];
      const initialCapital = 80000 + ((teacherIndex * 3 + idx * 5) % 10) * 15000;
      const performanceOffset = ((teacherIndex + idx) % 5) - 2; // -2 to +2
      const currentCapital = Math.max(
        45000,
        initialCapital + performanceOffset * 12000,
      );
      const joinDate = new Date(BASE_STUDENT_JOIN.getTime() + (studentCounter + idx) * 7 * DAY);
      const status: Student['status'] = idx % 7 === 0 ? 'inactive' : 'active';

      const student: Student = {
        id: `student-${studentCounter}`,
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${studentCounter}@synckaro.com`,
        mobile: studentMobile(studentCounter),
        teacherId: teacher.id,
        teacherName: teacher.name,
        status,
        initialCapital,
        currentCapital,
        profitLoss: Number((currentCapital - initialCapital).toFixed(2)),
        riskPercentage: 2 + ((teacherIndex + idx) % 4),
        strategy: STRATEGIES[(teacherIndex + idx) % STRATEGIES.length],
        joinedDate: joinDate.toISOString(),
      };

      students.push(student);
      teacherStudents.push(student);
      studentCounter++;
    }

    studentsByTeacher[teacher.id] = teacherStudents;
  });

  return { students, studentsByTeacher };
}

function createTrades(teachers: Teacher[], studentsByTeacher: StudentMap) {
  const trades: Trade[] = [];
  const tradesByTeacher: TradeMap = {};
  let tradeCounter = 1;

  teachers.forEach((teacher, teacherIndex) => {
    const teacherStudents = studentsByTeacher[teacher.id];
    const tradeCount = 16 + (teacherIndex % 4) * 4;
    const teacherTrades: Trade[] = [];

    for (let idx = 0; idx < tradeCount; idx++) {
      const stock = STOCKS[(teacherIndex * 3 + idx) % STOCKS.length];
      const quantity = 20 + ((teacherIndex + idx) % 6) * 10;
      const basePrice = 210 + (teacherIndex * 17 + idx * 11) % 480;
      const price = Number((basePrice + (idx % 3) * 12.5).toFixed(2));
      const timestamp = new Date(BASE_TRADE_TIME.getTime() + (teacherIndex * 5 + idx) * 2 * DAY + idx * 3600000);
      const student = teacherStudents[idx % teacherStudents.length];
      const pnlSeed = (idx % 3 === 0 ? 1 : idx % 3 === 1 ? -1 : 0.6) * (420 + teacherIndex * 35 + idx * 20);
      const pnl = Number((pnlSeed / 10).toFixed(2));

      const trade: Trade = {
        id: `trade-${tradeCounter}`,
        teacherId: teacher.id,
        teacherName: teacher.name,
        studentId: student?.id,
        studentName: student?.name,
        stock,
        quantity,
        price,
        type: idx % 2 === 0 ? 'BUY' : 'SELL',
        exchange: EXCHANGES[(teacherIndex + idx) % EXCHANGES.length],
        status: TRADE_STATUSES[(teacherIndex + idx) % TRADE_STATUSES.length],
        executedAt: timestamp.toISOString(),
        createdAt: timestamp.toISOString(),
        timestamp: timestamp.toISOString(),
        pnl,
      };

      trades.push(trade);
      teacherTrades.push(trade);
      tradeCounter++;
    }

    tradesByTeacher[teacher.id] = teacherTrades;
  });

  return { trades, tradesByTeacher };
}

function generateActivityLogs(
  teachers: Teacher[],
  studentsByTeacher: StudentMap,
  tradesByTeacher: TradeMap,
): ActivityLog[] {
  const logs: ActivityLog[] = [];
  let logCounter = 1;

  teachers.forEach((teacher) => {
    logs.push({
      id: `log-${logCounter++}`,
      teacherId: teacher.id,
      action: 'profile_created',
      timestamp: teacher.joinedDate,
      details: `${teacher.name} joined SyncKaro`,
    });

    logs.push({
      id: `log-${logCounter++}`,
      teacherId: teacher.id,
      action: 'profile_updated',
      timestamp: new Date(new Date(teacher.joinedDate).getTime() + 5 * DAY).toISOString(),
      details: `${teacher.name} updated portfolio benchmarks`,
    });

    studentsByTeacher[teacher.id]
      .slice(0, 3)
      .forEach((student, index) => {
        const time = new Date(new Date(student.joinedDate).getTime() + index * 3600000);
        logs.push({
          id: `log-${logCounter++}`,
          teacherId: teacher.id,
          action: 'student_added',
          timestamp: time.toISOString(),
          details: `Added student ${student.name}`,
        });
      });

    (tradesByTeacher[teacher.id] ?? [])
      .slice(0, 6)
      .forEach((trade) => {
        logs.push({
          id: `log-${logCounter++}`,
          teacherId: teacher.id,
          action: 'trade_executed',
          timestamp: trade.timestamp ?? trade.createdAt,
          details: `${trade.type} ${trade.quantity} ${trade.stock} @ ₹${(trade.price ?? 0).toFixed(2)} (${trade.status})`,
        });
      });
  });

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateAllSeedData() {
  const teachers = createTeachers();
  const { students, studentsByTeacher } = createStudents(teachers);
  const { trades, tradesByTeacher } = createTrades(teachers, studentsByTeacher);
  const activityLogs = generateActivityLogs(teachers, studentsByTeacher, tradesByTeacher);

  teachers.forEach((teacher) => {
    const teacherStudents = studentsByTeacher[teacher.id] ?? [];
    const teacherTrades = tradesByTeacher[teacher.id] ?? [];

    const totalCapital = teacherStudents.reduce(
      (sum, student) => sum + (student.currentCapital ?? 0),
      0,
    );
    const totalPnL = teacherTrades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0);
    const wins = teacherTrades.filter((trade) => (trade.pnl ?? 0) > 0).length;

    teacher.totalStudents = teacherStudents.length;
    teacher.totalCapital = Number(totalCapital.toFixed(2));
    teacher.profitLoss = Number(totalPnL.toFixed(2));
    teacher.totalTrades = teacherTrades.length;
    teacher.winRate = teacherTrades.length ? Math.round((wins / teacherTrades.length) * 100) : 0;
  });

  const stats = {
    totalTeachers: teachers.length,
    totalStudents: students.length,
    totalTrades: trades.length,
    totalCapital: Number(
      teachers.reduce((sum, teacher) => sum + (teacher.totalCapital ?? 0), 0).toFixed(2),
    ),
    totalProfitLoss: Number(
      teachers.reduce((sum, teacher) => sum + (teacher.profitLoss ?? 0), 0).toFixed(2),
    ),
    averageWinRate: Number(
      (
        teachers.reduce((sum, teacher) => sum + (teacher.winRate ?? 0), 0) /
        (teachers.length || 1)
      ).toFixed(2),
    ),
  };

  const generatedAt = new Date().toISOString();

  return {
    teachers,
    students,
    trades,
    activityLogs,
    stats,
    generatedAt,
  };
}

