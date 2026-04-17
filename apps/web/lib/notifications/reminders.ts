// Re-export of the shared reminder helpers for ergonomic imports from
// the web app. The implementation lives in the shared package so the
// behavior can be unit-tested with vitest.
export {
  buildReminderMessage,
  windowRange,
  windowToNotificationType,
  type ReminderMessage,
  type ReminderRide,
  type ReminderWindow,
} from '@veterans-first/shared';
