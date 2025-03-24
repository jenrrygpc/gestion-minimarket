import axios from 'axios';

const API_URL = '/api/products/';

//Create new product
const createProduct = async (productData, { token, store }) => {
  console.log('token ..:', token);
  console.log('productData ..:', productData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(API_URL, {
    payload: {
      ...productData,
      store: store.id
    }
  }, config);
  console.log('response ..:', response);

  return response.data;
};

//Update product
const updateProduct = async (productData, token) => {
  console.log('token ..:', token);
  console.log('productData ..:', productData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.put(`${API_URL}${productData.id}`, { payload: productData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Update products
const updateProducts = async (productData, token) => {
  console.log('token ..:', token);
  console.log('productData ..:', productData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.patch(`${API_URL}update-stock`, { payload: productData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Get product by code
const getProduct = async (params, { token, store }) => {
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
  console.log('getProduct params ..:', params);
  const response = await axios.get(API_URL, config);
  console.log('response ..:', response);

  return response.data;
};

const productService = {
  createProduct,
  updateProduct,
  getProduct,
  updateProducts
};

export default productService;