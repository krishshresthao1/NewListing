import api from "../../../api/axios";

export const createGroup = async (groupData) => {
  const response = await api.post("/groups/", groupData);
  return response.data;
};

export const getGroups = async () => {
  const response = await api.get("/groups/");
  return response.data;
};
