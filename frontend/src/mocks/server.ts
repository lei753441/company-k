import { setupServer } from 'msw/node'
import { employeeHandlers } from './handlers/employees'
import { departmentHandlers } from './handlers/departments'

export const server = setupServer(...employeeHandlers, ...departmentHandlers)
