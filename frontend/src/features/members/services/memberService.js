import api from "../../../api/axios";

export const getMembers = async () => {
  const response = await api.get("/members/");
  return response.data;
};

export const createMember = async (memberData) => {
  const response = await api.post("/members/", memberData);
  return response.data;
};

export const getMemberPassbook = async (memberId) => {
  const response = await api.get(`/members/${memberId}/passbook`);
  return response.data;
};