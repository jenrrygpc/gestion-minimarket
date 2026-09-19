import axios from 'axios';

const API_URL = '/api/permissions/';

//Get permissions
const getPermissions = async (params, token) => {
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
  getPermissions
};
