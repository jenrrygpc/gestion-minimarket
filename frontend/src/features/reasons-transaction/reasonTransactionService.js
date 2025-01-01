import axios from 'axios';

const API_URL = '/api/reasons-transaction/';

//Get reasons-transaction
const getRTs = async (token) => {
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
  getRTs
};

export default reasonTransactionService;