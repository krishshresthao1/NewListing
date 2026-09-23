const API_URL = "http://127.0.0.1:8000";

// =====================================================
// GET INSTALLMENT DASHBOARD
// =====================================================

export const getInstallmentDashboard = async () => {
  const response = await fetch(`${API_URL}/installments/dashboard`);

  if (!response.ok) {
    const data = await response.json();

    throw new Error(data.detail || "Failed to load installment dashboard");
  }

  return await response.json();
};

// =====================================================
// GET INSTALLMENTS FOR A LOAN
// =====================================================

export const getLoanInstallments = async (loanId) => {
  const response = await fetch(`${API_URL}/installments/loan/${loanId}`);

  if (!response.ok) {
    const data = await response.json();

    throw new Error(data.detail || "Failed to load loan installments");
  }

  return await response.json();
};

// =====================================================
// CREATE INSTALLMENT
// =====================================================

export const createInstallment = async (installmentData) => {
  const response = await fetch(`${API_URL}/installments/`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(installmentData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create installment");
  }

  return data;
};

// =====================================================
// GET ALL INSTALLMENTS
// =====================================================

export const getInstallments = async () => {
  const response = await fetch(`${API_URL}/installments/`);

  if (!response.ok) {
    const data = await response.json();

    throw new Error(data.detail || "Failed to load installments");
  }

  return await response.json();
};

// =====================================================
// GET SINGLE INSTALLMENT
// =====================================================

export const getInstallment = async (installmentId) => {
  const response = await fetch(`${API_URL}/installments/${installmentId}`);

  if (!response.ok) {
    const data = await response.json();

    throw new Error(data.detail || "Failed to load installment");
  }

  return await response.json();
};

export const getSubgroupInstallmentDetails = async (subgroupId) => {
  const response = await fetch(
    `${API_URL}/installments/subgroup/${subgroupId}/details`,
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.detail || "Failed to load subgroup installment details",
    );
  }

  return await response.json();
};