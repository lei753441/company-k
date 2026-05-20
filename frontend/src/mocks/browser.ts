import { setupWorker } from 'msw/browser'
import { employeeHandlers } from './handlers/employees'
import { departmentHandlers } from './handlers/departments'

export const worker = setupWorker(...employeeHandlers, ...departmentHandlers)
