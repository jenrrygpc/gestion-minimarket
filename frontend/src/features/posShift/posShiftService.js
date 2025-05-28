import axios from 'axios';

const API_URL = '/api/pos-shift/';

//Create new pos shift
const createPosShift = async (posData, token) => {
  console.log('token ..:', token);
  console.log('posData ..:', posData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(API_URL, { payload: posData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Update pos shift
const updatePosShift = async (posData, token) => {
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

//Get pos shift by code
const getPosShift = async (params, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params
  };
  console.log('getPosShift params ..:', params);
  const response = await axios.get(API_URL, config);
  console.log('response ..:', response);

  return response.data;
};

//Get valid pos shift by code
const getValidPosShift = async (params, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params
  };
  console.log('getValidPosShift params ..:', params);
  const response = await axios.get(`${API_URL}/valid`, config);
  console.log('response ..:', response);

  return response.data;
};

export default {
  createPosShift,
  updatePosShift,
  getPosShift,
  getValidPosShift
};