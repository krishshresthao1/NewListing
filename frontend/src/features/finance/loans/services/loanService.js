const API_URL = "http://127.0.0.1:8000";

// =====================================================
// LOAN DASHBOARD
// =====================================================

export const getLoanDashboard = async () => {
  const response = await fetch(`${API_URL}/loans/dashboard`);

  if (!response.ok) {
    throw new Error("Failed to load loan dashboard");
  }

  return await response.json();
};

// =====================================================
// SUBGROUP LOAN DETAILS
// =====================================================

export const getSubgroupLoanDetails = async (subgroupId) => {
  const response = await fetch(
    `${API_URL}/loans/subgroup/${subgroupId}/details`,
  );

  if (!response.ok) {
    throw new Error("Failed to load subgroup loan details");
  }

  return await response.json();
};

// =====================================================
// GET ALL LOANS
// =====================================================

export const getLoans = async () => {
  const response = await fetch(`${API_URL}/loans/`);

  if (!response.ok) {
    throw new Error("Failed to load loans");
  }

  return await response.json();
};

// =====================================================
// CREATE / ADD LOAN
// =====================================================

export const createLoan = async (loanData) => {
  const response = await fetch(`${API_URL}/loans/`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(loanData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create loan");
  }

  return data;
};

// =====================================================
// GET SINGLE LOAN
// =====================================================

export const getLoan = async (loanId) => {
  const response = await fetch(`${API_URL}/loans/${loanId}`);

  if (!response.ok) {
    throw new Error("Failed to load loan");
  }

  return await response.json();
};

export const getLoanHistory = async (loanId) => {
  const response = await fetch(`${API_URL}/loans/${loanId}/history`);

  if (!response.ok) {
    const data = await response.json();

    throw new Error(data.detail || "Failed to load loan history");
  }

  return await response.json();
};