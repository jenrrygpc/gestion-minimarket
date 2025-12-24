import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
//import { toast } from "react-toastify";
import { FaUser, FaSearch } from "react-icons/fa";
import { TbNewSection } from "react-icons/tb";
import { AiTwotoneEdit } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import ReactPaginate from 'react-paginate'; // pagination library
import { register, getUsers, setUser, reset, resetUser, updateUser } from "../features/auth/userSlice";
import { getProfiles } from "../features/profiles/profileSlice";
import Spinner from '../components/Spinner';
import Message from '../components/Message';

/* Ini: atributos para ventana modal */
import Modal from 'react-modal';

const customStyles = {
  content: {
    width: '600px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    position: 'relative'
  },
};

Modal.setAppElement('#root');
/* Fin: atributos para ventana modal */

const initialState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
}

function Register() {

  // ini pagination states
  const [offset, setOffset] = useState(0);
  const [usersPage, setUsersPage] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);
  //fin pagination states

  //state para establecer el texto de busqueda.
  const [userSearch, setUserSearch] = useState('');

  //const profile = '';
  //state para abrir o cerrar el modal.
  const [modalIsOpen, setModalIsOpen] = useState(false);

  /*
  const { profiles } = useSelector(
    (state) => state.profile
  );
  */
  //initialState.profileName = (profiles[0] || {}).name
  console.log('initialState ..:', initialState);

  const [formData, setFormData] = useState(initialState);

  const { name, email, password, confirmPassword, role } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log('formData 2 ...', formData);

  const { user, users, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.user
  );

  //console.log('profiles ..:', profiles);
  console.log('users ..:', users);

  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, user, message);
    if (isError) {
      Message(message, 'error');
      dispatch(reset());
    }

    if (isSuccess) {
      closeModal();
      dispatch(getUsers());
      if (user._id) {
        Message('Usuario actualizado exitosamente!');
      } else {
        Message('Usuario creado exitosamente!');
      }

    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  // useEffect usado para cargar la data de medidas. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 2 ...');
    dispatch(getProfiles());
    dispatch(getUsers());
    //refInputCode.current.focus();
  }, []);

  // useEffect to handle items by page.
  useEffect(() => {
    console.log('useEffect users ...', users);
    setUsersPage(users.slice(offset * perPage,
      (offset + 1) * perPage));
    setPageCount(Math.ceil(users.length / perPage));
  }, [users]);

  // use effect to handle pagination
  useEffect(() => {
    console.log('use effect offset ');
    setUsersPage(users.slice(offset * perPage,
      (offset + 1) * perPage));
  }, [offset]);

  //useEffect to show data on popup.
  useEffect(() => {
    console.log('useEffect 3 ...', user);
    //if (user._id) {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    //}
  }, [user]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onChangeSearch = (e) => {
    setUserSearch(e.target.value);
  };

  const onKeyDownSearch = (e) => {
    console.log('onKeyDownSearch ..:', e);
    if (e.key === 'Enter') {
      console.log('get user ..:');
      dispatch(getUsers({ name: e.target.value }));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    //console.log('profile ..:', profile)

    if (password !== confirmPassword) {
      Message('Las claves no coinciden', 'error');
    } else {

      if (user._id) {
        dispatch(updateUser({
          id: user._id,
          name,
          password,
          role
        }));
      } else {
        dispatch(register({
          name,
          email,
          password,
          role
        }));
      }

    }
  };

  const onEditar = (idUser) => {
    const user = users.find((user) => user._id == idUser);
    if (user) {
      dispatch(setUser(user));
      openModal();
    }
  };

  // Open/Close modal
  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFormData(initialState);
    // validar si se deberia limpiar todo el initialState
    dispatch(reset());
    dispatch(resetUser());
  };

  // manejar el evento de paginacion.
  const handlePageClick = (e) => {
    console.log('e.selected ..:', e);
    const selectedPage = e.selected;
    console.log('selectedPage ..:', selectedPage);
    setOffset(selectedPage)
  };

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="container-list">
      <br></br>
      <section>
        <h1>
          <FaUser /> Usuarios
        </h1>
      </section>

      <section className="form-list">

        <table style={{ width: '100%' }}>
          <tr>
            <td>

              <div className="form-group3">
                <input
                  type='text'
                  className='form-control'
                  id='userSearch'
                  name='userSearch'
                  value={userSearch}
                  onChange={onChangeSearch}
                  onKeyDown={onKeyDownSearch}
                  placeholder='Busqueda de usuarios...'
                  //ref={refInputDescBusqueda}
                  required />
              </div>

            </td>
            <td className="td-v-align-top" >

              <button className='btn' onClick={openModal} ><TbNewSection /> Nuevo </button>

            </td>
          </tr>
        </table>

        {users.length > 0 && <div>

          <div className="listas-headings" key="0">
            <div>Nombre</div>
            <div>Correo</div>
            <div>Role</div>
            <div>Editar</div>
          </div>

          {usersPage.map(user => (
            <div className="listas" key={user._id}>
              <div>{user.name}</div>
              <div>{user.email}</div>
              <div> {user.role}</div>
              <div>
                
                
                <button onClick={() => onEditar(user._id)} 
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  <AiTwotoneEdit color="black" />
                </button>

                </div>

            </div>
          ))}
        </div>}

        <div>
          <ReactPaginate
            previousLabel={"prev"}
            nextLabel={"next"}
            breakLabel={"..."}
            breakClassName={"break-me"}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            subContainerClassName={"pages pagination"}
            activeClassName={"active"} />
        </div>


        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel='Nuevo Usuario'>
          <h3>Nuevo Usuario</h3>
          <hr></hr>

          <button className='btn-close' onClick={closeModal}>
            X
          </button>
          <br></br>

          <section className="form">
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td>
                        <label htmlFor="name">Nombre ..:</label>
                      </td>
                      <td>

                        <input
                          type='text'
                          className='form-control'
                          id='name'
                          name='name'
                          value={name}
                          onChange={onChange}
                          placeholder='Ingrese su nombre'
                          required />

                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="name">Correo ..:</label>
                      </td>
                      <td>
                        <input
                          type='email'
                          className='form-control'
                          id='email'
                          name='email'
                          value={email}
                          onChange={onChange}
                          placeholder='Ingrese su correo'
                          disabled={user._id ? true : false}
                          required />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="name">Clave ..:</label>
                      </td>
                      <td>
                        <input
                          type='password'
                          className='form-control'
                          id='password'
                          name='password'
                          value={password}
                          onChange={onChange}
                          placeholder='Ingrese su clave'
                          required />

                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="name">Confirmar ..:</label>
                      </td>
                      <td>
                        <input
                          type='password'
                          className='form-control'
                          id='confirmPassword'
                          name='confirmPassword'
                          value={confirmPassword}
                          onChange={onChange}
                          placeholder='Confirmar clave'
                          required />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="name">Role ..:</label>
                      </td>
                      <td>

                        <select
                          name="role"
                          id="role"
                          value={role}
                          onChange={onChange}
                          className='form-control'>
                          
                          <option value="CAJERO">CAJERO</option>                          
                          <option value="ALMACENERO">ALMACENERO</option>
                          <option value="GERENTE">GERENTE</option>
                          <option value="ADMIN">ADMIN</option>                          

                        </select>

                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="form-group">
                <button className="btn btn-block">{user._id ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </section>

        </Modal>

      </section>
    </div>
  );
}

export default Register;