import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { register, reset } from "../features/auth/authSlice";
import { getProfiles } from "../features/profiles/profileSlice";
import Spinner from '../components/Spinner';

function Register() {

  const profile = '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { name, email, password, confirmPassword } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );
  const { profiles } = useSelector(
    (state) => state.profile
  );
  console.log('profiles ..:', profiles);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    // Redirect when logged in
    if (isSuccess || user) {
      //navigate('/');
    }

    dispatch(reset());
  }, [isError, isSuccess, user, message, navigate, dispatch]);

  // useEffect usado para cargar la data de medidas. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 2 ...');
    dispatch(getProfiles())
    //refInputCode.current.focus();
  }, [])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      const userData = {
        name,
        email,
        password
      };
      dispatch(register(userData));
    }
  };

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="container">
      <section>
        <h1>
          <FaUser /> Registro de Usuario
        </h1>
        <p>Por favor crear usuario.</p>
      </section>

      <section className="form">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <input
              type='text'
              className='form-control'
              id='name'
              name='name'
              value={name}
              onChange={onChange}
              placeholder='Ingrese su nombre'
              required />
          </div>
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
            <input
              type='password'
              className='form-control'
              id='confirmPassword'
              name='confirmPassword'
              value={confirmPassword}
              onChange={onChange}
              placeholder='Confirmar clave'
              required />
          </div>
          <div className="form-group">
            <select
              name="profile"
              id="profile"
              value={profile}
              onChange={onChange}
              className='form-control'>
              {
                profiles.map((profile) => {
                  return <option id={profile.id} value={profile.name}>{profile.name}</option>
                })
              }
            </select>
          </div>
          <div className="form-group">
            <button className="btn btn-block">Registrar</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Register;