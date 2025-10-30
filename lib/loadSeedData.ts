import { storage } from './storage';
import { generateAllSeedData } from './seedData';

/**
 * Load seed data into localStorage if not already present
 * Call this on app initialization
 */
export function loadSeedData() {
  // Check if data already exists
  const existingTeachers = storage.getItem('teachers');
  
  if (existingTeachers && existingTeachers.length > 0) {
    console.log('Seed data already exists in localStorage');
    return;
  }

  console.log('Generating seed data...');
  const seedData = generateAllSeedData();

  // Store in localStorage
  storage.setItem('teachers', seedData.teachers);
  storage.setItem('students', seedData.students);
  storage.setItem('trades', seedData.trades);
  storage.setItem('activityLogs', seedData.activityLogs);
  storage.setItem('seedDataGeneratedAt', seedData.generatedAt);

  console.log('Seed data loaded successfully:', {
    teachers: seedData.teachers.length,
    students: seedData.students.length,
    trades: seedData.trades.length,
    activityLogs: seedData.activityLogs.length,
  });
}

/**
 * Clear all seed data from localStorage
 * Useful for testing/development
 */
export function clearSeedData() {
  storage.removeItem('teachers');
  storage.removeItem('students');
  storage.removeItem('trades');
  storage.removeItem('activityLogs');
  storage.removeItem('seedDataGeneratedAt');
  console.log('Seed data cleared');
}

/**
 * Regenerate seed data
 * Clears existing and generates new
 */
export function regenerateSeedData() {
  clearSeedData();
  loadSeedData();
}

