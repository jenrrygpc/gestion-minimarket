import { toast } from 'react-toastify';

const options = {
  autoClose: 2000,
  pauseOnHover: false
};

const Message = (message, type = 'success', ) => {
  if (type === 'success') {
    toast.success(message, options);
    return;
  }
  if (type === 'error') {
    toast.error(message, options);
    return;
  }  
};

export default Message;