import axios from 'axios';

const API_URL = '/api/pos/';

//Create new pos
const createPos = async (posData, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(API_URL, { payload: posData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Update pos
const updatePos = async (posData, token) => {
  console.log('posData ..:', posData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.put(`${API_URL}${posData.id}`, { payload: posData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Get pos by code
const getPos = async (params, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params
  };
  console.log('getPos params ..:', params);
  const response = await axios.get(API_URL, config);
  console.log('response ..:', response);

  return response.data;
};

const getAvailablePos = async (params, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params
  };
  console.log('getAvailablePos params ..:', params);
  const response = await axios.get(`${API_URL}available`, config);
  console.log('response ..:', response);

  return response.data;
}

export default {
  createPos,
  updatePos,
  getPos,
  getAvailablePos
};