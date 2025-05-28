import axios from 'axios';

const API_URL = '/api/users/';

// Register User
const register = async (userData) => {
  console.log('userData ..:', userData);
  const response = await axios.post(API_URL, { payload: userData });
  console.log('response ..:', response);

  return response.data;
}

//Update User
const updateUser = async (userData, token) => {
  console.log('userData ..:', userData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.put(`${API_URL}${userData.id}`, { payload: userData }, config);
  console.log('response ..:', response);

  return response.data;
};

// Login User
const login = async (userData) => {
  console.log('userData ..:', userData);
  const response = await axios.post(`${API_URL}/login`, { payload: userData });
  console.log('response ..:', response);

  if (response.data) {
    console.log('localStorage ..:');
    localStorage.setItem('user', JSON.stringify(response.data));
    // localStorage.setItem('store', userData.store);
  } else {
    throw new Error('Problemas al validar usuario!');
  }

  return response.data;
}

// get User
const getUser = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await axios.get(`${API_URL}/me`, config);
  console.log('response ..:', response);
  return response.data;
}

// get Users
const getUsers = async (params, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params
  };
  console.log('getUsers params ..:', params);
  const response = await axios.get(API_URL, config);
  console.log('response ..:', response);
  return response.data;
}

//Log Out User
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('store');
  localStorage.removeItem('posShift');
}

export default {
  register,
  logout,
  login,
  getUser,
  getUsers,
  updateUser
};