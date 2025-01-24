import { DBOS, SchedulerMode } from "@dbos-inc/dbos-sdk";

import { TaskOption } from "@/types/models";
import { doTaskFetch, schedulableTasks } from "./tasks";
import { ScheduleDBOps } from "./dbtransactions";
import { getOccurrencesAt } from "../types/taskschedule";
export { ScheduleDBOps };

// Welcome to DBOS!
// This is a template application built with DBOS and Next.
export class SchedulerOps
{
  static getAllTasks(): TaskOption[] {
    return schedulableTasks.map((t) => { return {id:t.id, name: t.name}; });
  }

  @DBOS.step()
  static async runTask(task: string) {
    return doTaskFetch(task);
  }

  @DBOS.workflow()
  static async runJob(sched: string, task: string, time: Date) {
    DBOS.logger.info(`Running ${task} at ${time.toString()}`);

    // Fetch the result
    const res = await doTaskFetch(task);

    // Store in database
    await ScheduleDBOps.setResult(sched, task, time, res);

    // Send notification (future)
  }

  @DBOS.scheduled({crontab: '* * * * *', mode: SchedulerMode.ExactlyOncePerIntervalWhenActive })
  @DBOS.workflow()
  static async runSchedule(schedTime: Date, _atTime: Date) {
    DBOS.logger.info(`Checking schedule at ${schedTime.toString()}`);
    const schedule = await ScheduleDBOps.getSchedule();
    for (const sched of schedule) {
      const occurrences = getOccurrencesAt(sched, schedTime);
      if (!occurrences.length) {
        DBOS.logger.info("   ...no occurrences");
      }
      for (const occurrence of occurrences) {
        DBOS.logger.info("   ...triggering");
        await DBOS.startWorkflow(SchedulerOps).runJob(sched.id, sched.task, occurrence);
      }
    }
  }
}


// Only launch DBOS when the app starts running
if (process.env.NEXT_PHASE !== "phase-production-build") {
  await DBOS.launch();
}
