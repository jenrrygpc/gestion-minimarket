import axios from 'axios';

const API_URL = '/api/sales/';

//Create new sale
const createSale = async (saleData, { token, store }) => {
  console.log('token ..:', token);
  console.log('saleData ..:', saleData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(API_URL, {
    payload: {
      ...saleData,
      store: store.id
    }
  }, config);
  console.log('response ..:', response);

  return response.data;
};

//Update sale
const updateSale = async (saleData, token) => {
  console.log('token ..:', token);
  console.log('saleData ..:', saleData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.put(`${API_URL}${saleData.id}`, { payload: saleData }, config);
  console.log('response ..:', response);

  return response.data;
};


//Get sale by code
const getSale = async (params, { token, store }) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      ...params,
      store: store.id
    }
  };
  console.log('getSale params ..:', params);
  const response = await axios.get(API_URL, config);
  console.log('response ..:', response);

  return response.data;
};

const saleService = {
  createSale,
  updateSale,
  getSale
};

export default saleService;