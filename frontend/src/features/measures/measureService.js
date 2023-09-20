import axios from 'axios';

const API_URL = '/api/measures/';

//Get measures
const getMeasures = async (token) => {
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

const measureService = {
  getMeasures
};

export default measureService;