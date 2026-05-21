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

const CustomerListPage = lazy(() => import('@/features/customers/pages/CustomerListPage'))
const CustomerDetailPage = lazy(() => import('@/features/customers/pages/CustomerDetailPage'))
const CustomerFormPage = lazy(() => import('@/features/customers/pages/CustomerFormPage'))
const FollowUpPage = lazy(() => import('@/features/customers/pages/FollowUpPage'))

const ClockPage = lazy(() => import('@/features/attendance/pages/ClockPage'))
const TimesheetListPage = lazy(() => import('@/features/attendance/pages/TimesheetListPage'))
const TimesheetDetailPage = lazy(() => import('@/features/attendance/pages/TimesheetDetailPage'))
const ApprovalListPage = lazy(() => import('@/features/attendance/pages/ApprovalListPage'))
const MonthlySummaryPage = lazy(() => import('@/features/attendance/pages/MonthlySummaryPage'))
const MonthlyClosePage = lazy(() => import('@/features/attendance/pages/MonthlyClosePage'))
const LeaveListPage = lazy(() => import('@/features/attendance/pages/LeaveListPage'))

const InvoiceListPage = lazy(() => import('@/features/billing/pages/InvoiceListPage'))
const InvoiceDetailPage = lazy(() => import('@/features/billing/pages/InvoiceDetailPage'))
const PaymentListPage = lazy(() => import('@/features/billing/pages/PaymentListPage'))
const PaymentDetailPage = lazy(() => import('@/features/billing/pages/PaymentDetailPage'))
const ReceivablesPage = lazy(() => import('@/features/billing/pages/ReceivablesPage'))
const BillingClosePage = lazy(() => import('@/features/billing/pages/BillingClosePage'))
const BillingSummaryPage = lazy(() => import('@/features/billing/pages/BillingSummaryPage'))

const MatchingSearchPage = lazy(() => import('@/features/matching/pages/MatchingSearchPage'))
const ProposalListPage = lazy(() => import('@/features/matching/pages/ProposalListPage'))
const ProposalDetailPage = lazy(() => import('@/features/matching/pages/ProposalDetailPage'))

const PartnerListPage = lazy(() => import('@/features/partners/pages/PartnerListPage'))
const PartnerDetailPage = lazy(() => import('@/features/partners/pages/PartnerDetailPage'))
const PartnerFormPage = lazy(() => import('@/features/partners/pages/PartnerFormPage'))
const FreelancerListPage = lazy(() => import('@/features/partners/pages/FreelancerListPage'))
const FreelancerDetailPage = lazy(() => import('@/features/partners/pages/FreelancerDetailPage'))
const FreelancerFormPage = lazy(() => import('@/features/partners/pages/FreelancerFormPage'))

const ContractListPage = lazy(() => import('@/features/contracts/pages/ContractListPage'))
const ContractDetailPage = lazy(() => import('@/features/contracts/pages/ContractDetailPage'))
const ContractFormPage = lazy(() => import('@/features/contracts/pages/ContractFormPage'))
const ContractRenewalAlertPage = lazy(() => import('@/features/contracts/pages/ContractRenewalAlertPage'))

const ExpenseListPage = lazy(() => import('@/features/expenses/pages/ExpenseListPage'))
const ExpenseDetailPage = lazy(() => import('@/features/expenses/pages/ExpenseDetailPage'))
const ExpenseApprovalPage = lazy(() => import('@/features/expenses/pages/ExpenseApprovalPage'))
const ExpenseSummaryPage = lazy(() => import('@/features/expenses/pages/ExpenseSummaryPage'))

const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))

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
            <Route path="customers" element={<CustomerListPage />} />
            <Route path="customers/new" element={<CustomerFormPage mode="new" />} />
            <Route path="customers/followup" element={<FollowUpPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="customers/:id/edit" element={<CustomerFormPage mode="edit" />} />
            <Route path="attendance/clock" element={<ClockPage />} />
            <Route path="attendance/timesheets" element={<TimesheetListPage />} />
            <Route path="attendance/timesheets/:id" element={<TimesheetDetailPage />} />
            <Route path="attendance/approval" element={<ApprovalListPage />} />
            <Route path="attendance/summary" element={<MonthlySummaryPage />} />
            <Route path="attendance/close" element={<MonthlyClosePage />} />
            <Route path="attendance/leaves" element={<LeaveListPage />} />
            <Route path="billing/invoices" element={<InvoiceListPage />} />
            <Route path="billing/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="billing/payments" element={<PaymentListPage />} />
            <Route path="billing/payments/:id" element={<PaymentDetailPage />} />
            <Route path="billing/receivables" element={<ReceivablesPage />} />
            <Route path="billing/close" element={<BillingClosePage />} />
            <Route path="billing/summary" element={<BillingSummaryPage />} />
            <Route path="matching" element={<MatchingSearchPage />} />
            <Route path="matching/proposals" element={<ProposalListPage />} />
            <Route path="matching/proposals/:id" element={<ProposalDetailPage />} />
            <Route path="partners" element={<PartnerListPage />} />
            <Route path="partners/new" element={<PartnerFormPage mode="new" />} />
            <Route path="partners/:id" element={<PartnerDetailPage />} />
            <Route path="partners/:id/edit" element={<PartnerFormPage mode="edit" />} />
            <Route path="freelancers" element={<FreelancerListPage />} />
            <Route path="freelancers/new" element={<FreelancerFormPage mode="new" />} />
            <Route path="freelancers/:id" element={<FreelancerDetailPage />} />
            <Route path="freelancers/:id/edit" element={<FreelancerFormPage mode="edit" />} />
            <Route path="contracts" element={<ContractListPage />} />
            <Route path="contracts/new" element={<ContractFormPage mode="new" />} />
            <Route path="contracts/renewals" element={<ContractRenewalAlertPage />} />
            <Route path="contracts/:id" element={<ContractDetailPage />} />
            <Route path="contracts/:id/edit" element={<ContractFormPage mode="edit" />} />
            <Route path="expenses" element={<ExpenseListPage />} />
            <Route path="expenses/approval" element={<ExpenseApprovalPage />} />
            <Route path="expenses/summary" element={<ExpenseSummaryPage />} />
            <Route path="expenses/:id" element={<ExpenseDetailPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
