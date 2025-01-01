import axios from 'axios';

const API_URL = '/api/stores/';

//Create new store
const createStore = async (storeData, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(API_URL, { payload: storeData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Update store
const updateStore = async (storeData, token) => {
  console.log('storeData ..:', storeData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.put(`${API_URL}${storeData.id}`, { payload: storeData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Get stores by code
const getStores = async (params, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params
  };
  console.log('getStores params ..:', params);
  const response = await axios.get(API_URL, config);
  console.log('response ..:', response);

  return response.data;
};

//Get stores public
const getStoresPublic = async (params) => {
  console.log('params ..:', params);
  const response = await axios.get(`${API_URL}public`, {
    params
  });
  console.log('response ..:', response);

  return response.data;
};

export default {
  createStore,
  updateStore,
  getStores,
  getStoresPublic
};