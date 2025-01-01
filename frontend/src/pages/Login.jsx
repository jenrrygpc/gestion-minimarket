import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { login, reset, setStore } from "../features/auth/authSlice";
import { getStoresPublic } from "../features/stores/storeSlice";
import Spinner from '../components/Spinner';

const initialState = {
  email: '',
  password: '',
  store: ''
}

function Login() {

  const [formData, setFormData] = useState(initialState);

  const { email, password, store } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const { stores } = useSelector(
    (state) => state.store
  );
  initialState.store = (stores[0] || {}).id

  console.log('stores ..:', stores);
  console.log('store ..:', store);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      navigate('/login');
    }

    if (isSuccess || user) {
      console.log('stores ..:', stores);
      console.log('store ok ..:', store);

      dispatch(setStore(stores.find((s) => s.id === store)));
      
      navigate('/');
    }

    dispatch(reset());
  }, [isError, isSuccess, user, message, navigate, dispatch]);

  // useEffect usado para cargar la data al inicio. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 2 ...');
    dispatch(getStoresPublic());
  }, []);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,

    };

    console.log('userData ..:', userData);
     dispatch(login(userData));
  };

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="container">
      <section>
        <h1>
          <FaSignInAlt /> Inicio de Sesión
        </h1>
        <p>Por favor iniciar sesión para usar el sistema</p>
      </section>

      <section className="form">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <input
              type='email'
              className='form-control'
              id='email'
              name='email'
              value={email}
              onChange={onChange}
              placeholder='Ingrese su correo'
              required />
          </div>
          <div className="form-group">
            <input
              type='password'
              className='form-control'
              id='password'
              name='password'
              value={password}
              onChange={onChange}
              placeholder='Ingrese su clave'
              required />
          </div>

          <div className="form-group">
            <select name="store" id="store" onChange={onChange}>
              {
                stores.map((store) => {
                  return <option key={store.id} id={store.id} value={store.id}>{store.name}</option>
                })
              }
            </select>
          </div>
          <div className="form-group">
            <button className="btn btn-block">Enviar</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Login;