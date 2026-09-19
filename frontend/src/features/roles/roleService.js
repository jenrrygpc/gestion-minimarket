import axios from 'axios';

const API_URL = '/api/roles/';

//Create new role
const createRole = async (roleData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(API_URL, { payload: roleData }, config);

  return response.data;
};

//Update role
const updateRole = async (roleData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.put(`${API_URL}${roleData.id}`, { payload: roleData }, config);

  return response.data;
};

//Get roles
const getRoles = async (params, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params
  };
  const response = await axios.get(API_URL, config);

  return response.data;
};

export default {
  createRole,
  updateRole,
  getRoles
};
