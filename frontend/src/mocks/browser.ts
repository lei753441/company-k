import { setupWorker } from 'msw/browser'
import { employeeHandlers } from './handlers/employees'
import { departmentHandlers } from './handlers/departments'
import { skillHandlers } from './handlers/skills'
import { projectHandlers } from './handlers/projects'
import { customerHandlers } from './handlers/customers'
import { attendanceHandlers } from './handlers/attendance'
import { billingHandlers } from './handlers/billing'
import { matchingHandlers } from './handlers/matching'
import { partnerHandlers } from './handlers/partners'
import { contractHandlers } from './handlers/contracts'
import { expenseHandlers } from './handlers/expenses'
import { dashboardHandlers } from './handlers/dashboard'
import { documentHandlers } from './handlers/documents'
import { notificationHandlers } from './handlers/notifications'

export const worker = setupWorker(
  ...employeeHandlers,
  ...departmentHandlers,
  ...skillHandlers,
  ...projectHandlers,
  ...customerHandlers,
  ...attendanceHandlers,
  ...billingHandlers,
  ...matchingHandlers,
  ...partnerHandlers,
  ...contractHandlers,
  ...expenseHandlers,
  ...dashboardHandlers,
  ...documentHandlers,
  ...notificationHandlers,
)
