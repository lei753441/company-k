import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

const EmployeeListPage = lazy(() => import('@/features/employees/pages/EmployeeListPage'))
const EmployeeDetailPage = lazy(() => import('@/features/employees/pages/EmployeeDetailPage'))
const EmployeeNewPage = lazy(() => import('@/features/employees/pages/EmployeeNewPage'))
const EmployeeEditPage = lazy(() => import('@/features/employees/pages/EmployeeEditPage'))
const EmployeeRetirePage = lazy(() => import('@/features/employees/pages/EmployeeRetirePage'))
const EmployeeLeavePage = lazy(() => import('@/features/employees/pages/EmployeeLeavePage'))
const EmployeeHistoryPage = lazy(() => import('@/features/employees/pages/EmployeeHistoryPage'))
const DepartmentPage = lazy(() => import('@/features/employees/pages/DepartmentPage'))

const SkillListPage = lazy(() => import('@/features/skills/pages/SkillListPage'))
const SkillSheetPage = lazy(() => import('@/features/skills/pages/SkillSheetPage'))
const SkillEditPage = lazy(() => import('@/features/skills/pages/SkillEditPage'))
const AvailabilityListPage = lazy(() => import('@/features/skills/pages/AvailabilityListPage'))
const SkillSearchPage = lazy(() => import('@/features/skills/pages/SkillSearchPage'))

const ProjectListPage = lazy(() => import('@/features/projects/pages/ProjectListPage'))
const ProjectDetailPage = lazy(() => import('@/features/projects/pages/ProjectDetailPage'))
const ProjectFormPage = lazy(() => import('@/features/projects/pages/ProjectFormPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8 text-slate-500">Loading...</div>}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/employees" replace />} />
            <Route path="employees" element={<EmployeeListPage />} />
            <Route path="employees/new" element={<EmployeeNewPage />} />
            <Route path="employees/:id" element={<EmployeeDetailPage />} />
            <Route path="employees/:id/edit" element={<EmployeeEditPage />} />
            <Route path="employees/:id/retire" element={<EmployeeRetirePage />} />
            <Route path="employees/:id/leave" element={<EmployeeLeavePage />} />
            <Route path="employees/:id/history" element={<EmployeeHistoryPage />} />
            <Route path="departments" element={<DepartmentPage />} />
            <Route path="skills" element={<SkillListPage />} />
            <Route path="skills/search" element={<SkillSearchPage />} />
            <Route path="skills/:id" element={<SkillSheetPage />} />
            <Route path="skills/:id/edit" element={<SkillEditPage />} />
            <Route path="availability" element={<AvailabilityListPage />} />
            <Route path="projects" element={<ProjectListPage />} />
            <Route path="projects/new" element={<ProjectFormPage mode="new" />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="projects/:id/edit" element={<ProjectFormPage mode="edit" />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
