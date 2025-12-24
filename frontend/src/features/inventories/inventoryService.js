import axios from 'axios';

const API_URL = '/api/inventories/';

//Create new inventory
const registerInventory = async (inventoryData, { token, store }) => {
  console.log('token ..:', token);
  console.log('inventoryData ..:', inventoryData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // CAMBIO: Renombrar reasonTransaction a reasonTransactionId para coincidir con el backend
  const { reasonTransactionId, ...restData } = inventoryData;

  const response = await axios.post(API_URL, {
    payload: {
      ...restData,
      reasonTransactionId, // Enviar el ID del motivo
      store: store.id
    }
  }, config);
  console.log('response ..:', response);

  return response.data;
};

//Update inventory
const updateInventory = async (inventoryData, token) => {
  console.log('token ..:', token);
  console.log('inventoryData ..:', inventoryData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.put(`${API_URL}${inventoryData.id}`, { payload: inventoryData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Get inventory by code/
const getInventory = async (params, { token, store }) => {
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
  console.log('getInventory params ..:', params);
  const response = await axios.get(API_URL, config);
  console.log('response ..:', response);

  return response.data;
};

const productService = {
  registerInventory,
  updateInventory,
  getInventory
};

export default productService;