import axios from 'axios';

const API_URL = '/api/masters/';

//Create new master
const createMaster = async (masterData, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(API_URL, { payload: masterData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Update master
const updateMaster = async (masterData, token) => {
  console.log('masterData ..:', masterData);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.put(`${API_URL}${masterData.id}`, { payload: masterData }, config);
  console.log('response ..:', response);

  return response.data;
};

//Get master by code
const getMasters = async (params, token) => {
  console.log('token ..:', token);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params
  };
  console.log('getMasters params ..:', params);
  const response = await axios.get(API_URL, config);
  console.log('response ..:', response);

  return response.data;
};

const getMastersByTypes = async (params, token) => {
  console.log('token ..:', token);
  console.log('getMastersByTypes params ..:', params);

  const mastersListPromise = [];
  params.forEach(element => {
    mastersListPromise.push(axios.get(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        type: element
      }
    }));
  });

  const mastersList = await Promise.all(mastersListPromise);
  console.log('mastersList ..:', mastersList);
  const response = mastersList.map((master) => master.data);

  return response.flat();
}

const masterService = {
  createMaster,
  updateMaster,
  getMasters,
  getMastersByTypes
};

export default masterService;