import axios from 'axios';

const API_URL = '/api/users';

// Register User
const register = async (userData) => {
  console.log('userData ..:', userData);
  const response = await axios.post(API_URL, { payload: userData });
  console.log('response ..:', response);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
}

// Login User
const login = async (userData) => {
  console.log('userData ..:', userData);
  const response = await axios.post(`${API_URL}/login`, { payload: userData });
  console.log('response ..:', response);
  console.log('response.data ..:', response.data);

  if (response.data) {
    console.log('localStorage ..:');
    localStorage.setItem('user', JSON.stringify(response.data));
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

//Log Out User
const logout = () => localStorage.removeItem('user');

export default {
  register,
  logout,
  login,
  getUser
};