import axios from 'axios';

const API_URL = '/api/categories/';

//Create new category
const createCategory = async (categoryData, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(API_URL, { payload: categoryData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Update category
const updateCategory = async (categoryData, token) => {
  console.log('categoryData ..:', categoryData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.put(`${API_URL}${categoryData.id}`, { payload: categoryData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Get categories by code
const getCategories = async (params, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params
  };
  console.log('getCategories params ..:', params);
  const response = await axios.get(API_URL, config);
  console.log('response ..:', response);

  return response.data;
};

export default {
  createCategory,
  updateCategory,
  getCategories,
};