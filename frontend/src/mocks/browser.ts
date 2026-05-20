import { setupWorker } from 'msw/browser'
import { employeeHandlers } from './handlers/employees'
import { departmentHandlers } from './handlers/departments'
import { skillHandlers } from './handlers/skills'

export const worker = setupWorker(...employeeHandlers, ...departmentHandlers, ...skillHandlers)
