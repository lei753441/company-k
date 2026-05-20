import { setupWorker } from 'msw/browser'
import { employeeHandlers } from './handlers/employees'
import { departmentHandlers } from './handlers/departments'
import { skillHandlers } from './handlers/skills'
import { projectHandlers } from './handlers/projects'

export const worker = setupWorker(...employeeHandlers, ...departmentHandlers, ...skillHandlers, ...projectHandlers)
