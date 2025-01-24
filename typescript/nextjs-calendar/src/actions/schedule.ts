'use server';

import { ScheduleDBOps, SchedulerOps } from '@/dbos/operations';
import { schedulableTasks } from '@/dbos/tasks';
import { ScheduleUIRecord, ResultsUIRecord } from '@/types/models';

// Fetch all schedule items
export async function fetchSchedules(): Promise<ScheduleUIRecord[]> {
  const sched = await ScheduleDBOps.getSchedule() as ScheduleUIRecord[];
  for (const s of sched) {
    s.name = schedulableTasks.find(t => t.id === s.task)?.name ?? '<UNKNOWN>';
  }
  return sched as ScheduleUIRecord[];
}

// Fetch results within a date range
export async function fetchResults(startDate: Date, endDate: Date): Promise<ResultsUIRecord[]> {
  const res = await ScheduleDBOps.getResultsOverTime(startDate, endDate) as ResultsUIRecord[];
  for (const r of res) {
    r.name = schedulableTasks.find(t => t.id === r.task)?.name ?? '<UNKNOWN>';
  }
  return res;
}

// Add a new schedule item
export async function addSchedule(task: string, start: Date, end: Date, repeat: string) {
  return await ScheduleDBOps.addScheduleItem(task, start, end, repeat);
}

// Delete a schedule item
export async function deleteSchedule(id: string) {
  return await ScheduleDBOps.deleteScheduleItem(id);
}

// Get possible tasks
export async function getAllTasks() {
  return Promise.resolve(SchedulerOps.getAllTasks());
}