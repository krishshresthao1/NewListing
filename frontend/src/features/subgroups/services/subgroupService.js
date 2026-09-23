import api from "../../../api/axios";

export const getSubgroupsByGroup = async (groupId) => {
  const response = await api.get(`/subgroups/group/${groupId}`);
  return response.data;
};

export const createSubgroup = async (subgroupData) => {
  const response = await api.post("/subgroups/", subgroupData);
  return response.data;
};

export const getAllSubgroups = async () => {
  const response = await api.get("/subgroups/");
  return response.data;
};
