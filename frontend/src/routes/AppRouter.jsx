import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import DashboardPage from "../features/dashboard/pages/DashboardPage";
import GroupsPage from "../features/groups/pages/GroupsPage";
import SubgroupsPage from "../features/subgroups/pages/SubgroupsPage";
import MembersPage from "../features/members/pages/MembersPage";

import SavingsPage from "../features/finance/savings/pages/SavingsPage";
import LoansPage from "../features/finance/loans/pages/LoansPage";
import InstallmentsPage from "../features/finance/installments/pages/InstallmentPage";
import ExpensesPage from "../features/finance/expenses/pages/ExpensesPage";

import ReportsPage from "../features/reports/pages/ReportsPage";
import SettingsPage from "../features/settings/pages/SettingsPage";

import AddMemberPage from "../features/members/pages/AddMemberPage";
import MemberPassbookPage from "../features/members/pages/MemberPassbookPage";

import SavingsDetailsPage from "../features/finance/savings/pages/SavingsDetailsPage";

import SavingsEntryPage from "../features/finance/savings/pages/SavingsEntryPage";

import LoanDetailsPage from "../features/finance/loans/pages/LoanDetailsPage";

import LoanEntryPage from "../features/finance/loans/pages/LoanEntryPage";

import LoanPassbookPage from "../features/finance/loans/pages/LoanPassbookPage";

import InstallmentDetailsPage from "../features/finance/installments/pages/InstallmentDetailsPage";

import InstallmentPassbookPage from "../features/finance/installments/pages/InstallmentPassbookPage";

import InstallmentEntryPage from "../features/finance/installments/pages/InstallmentEntryPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/subgroups" element={<SubgroupsPage />} />
          <Route
            path="/groups/:groupId/subgroups"
            element={<SubgroupsPage />}
          />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/add" element={<AddMemberPage />} />
          <Route
            path="/subgroups/:subgroupId/members"
            element={<MembersPage />}
          />
          <Route
            path="/members/:memberId/passbook"
            element={<MemberPassbookPage />}
          />

          <Route path="/savings" element={<SavingsPage />} />
          <Route
            path="/savings/subgroup/:subgroupId"
            element={<SavingsDetailsPage />}
          />
          <Route path="/savings/entry" element={<SavingsEntryPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route
            path="/loans/subgroup/:subgroupId"
            element={<LoanDetailsPage />}
          />
          <Route path="/loans/entry" element={<LoanEntryPage />} />
          <Route path="/loans/member/:loanId" element={<LoanPassbookPage />} />

          <Route path="/installments" element={<InstallmentsPage />} />
          <Route
            path="/installments/subgroup/:subgroupId"
            element={<InstallmentDetailsPage />}
          />
          <Route
            path="/installments/member/:loanId"
            element={<InstallmentPassbookPage />}
          />
          <Route
            path="/installments/entry"
            element={<InstallmentEntryPage />}
          />

          <Route path="/expenses" element={<ExpensesPage />} />

          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
