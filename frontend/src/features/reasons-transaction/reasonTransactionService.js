import axios from 'axios';

const API_URL = '/api/reasons-transaction/';

const createReasonTransaction = async (storeData, token) => {
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

const updateReasonTransaction = async (storeData, token) => {
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

//Get reasons-transaction
const getReasonsTransaction = async (token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.get(API_URL, config);
  console.log('response ..:', response);

  return response.data;
};

const reasonTransactionService = {
  createReasonTransaction,
  updateReasonTransaction,
  getReasonsTransaction
};

export default reasonTransactionService;