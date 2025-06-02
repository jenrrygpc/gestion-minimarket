import axios from 'axios';

const API_URL = '/api/customers/';

//Create new customer
const createCustomer = async (storeData, token) => {
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

//Update customer
const updateCustomer = async (storeData, token) => {
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

//Get customers by code
const getCustomers = async (params, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params
  };
  console.log('getCustomers params ..:', params);
  const response = await axios.get(API_URL, config);
  console.log('response ..:', response);

  return response.data;
};

export default {
  createCustomer,
  updateCustomer,
  getCustomers
};