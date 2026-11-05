import React from 'react';
import { SyllabusTrackerPage } from './SyllabusTrackerPage';

/**
 * Backwards compatibility wrapper:
 * Attendance Tracker has been upgraded into the comprehensive Syllabus Tracker.
 */
export function AttendancePage() {
  return <SyllabusTrackerPage />;
}

export default AttendancePage;
