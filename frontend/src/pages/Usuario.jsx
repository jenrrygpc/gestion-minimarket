import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
//import { toast } from "react-toastify";
import { FaUser, FaSearch } from "react-icons/fa";
import { TbNewSection } from "react-icons/tb";
import { AiTwotoneEdit } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import ReactPaginate from 'react-paginate'; // pagination library
import { register, getUsers, setUser, reset, resetUser, updateUser } from "../features/auth/userSlice";
import { getRoles } from "../features/roles/roleSlice";
import { getStores } from "../features/stores/storeSlice";
import Spinner from '../components/Spinner';
import Message from '../components/Message';

/* Ini: atributos para ventana modal */
import Modal from 'react-modal';

const customStyles = {
  content: {
    width: '600px',
    maxHeight: '85vh',
    overflowY: 'auto',
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
  role: '',
  stores: []
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

  const { roles } = useSelector(
    (state) => state.role
  );

  const { stores } = useSelector(
    (state) => state.store
  );

  console.log('initialState ..:', initialState);

  const [formData, setFormData] = useState(initialState);

  const { name, email, password, confirmPassword, role, stores: selectedStores } = formData;

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
    dispatch(getRoles());
    dispatch(getStores());
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
      role: user.role?.id || '',
      stores: (user.stores || []).map((s) => s.id)
    });
    //}
  }, [user]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onToggleStore = (storeId) => {
    setFormData((prevState) => {
      const alreadySelected = prevState.stores.includes(storeId);
      return {
        ...prevState,
        stores: alreadySelected
          ? prevState.stores.filter((id) => id !== storeId)
          : [...prevState.stores, storeId]
      };
    });
  };

  const onToggleAllStores = () => {
    setFormData((prevState) => ({
      ...prevState,
      stores: prevState.stores.length === stores.length ? [] : stores.map((store) => store._id)
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
          role,
          stores: selectedStores
        }));
      } else {
        dispatch(register({
          name,
          email,
          password,
          role,
          stores: selectedStores
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
              <div> {user.role?.name}</div>
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
          <h3>{user._id ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
          <hr></hr>

          <button className='btn-close' onClick={closeModal}>
            X
          </button>
          <br></br>

          <section className="form modal-form">
            <form onSubmit={onSubmit}>
              <div className="form-grid">

                <div className="field">
                  <label htmlFor="name">Nombre</label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={name}
                    onChange={onChange}
                    placeholder='Ej. Juan Pérez'
                    required />
                </div>

                <div className="field">
                  <label htmlFor="email">Correo</label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={email}
                    onChange={onChange}
                    placeholder='usuario@correo.com'
                    disabled={user._id ? true : false}
                    required />
                  {user._id && <small className="field-hint">El correo no se puede modificar</small>}
                </div>

                <div className="field">
                  <label htmlFor="password">Clave</label>
                  <input
                    type='password'
                    id='password'
                    name='password'
                    value={password}
                    onChange={onChange}
                    placeholder='Ingrese la clave'
                    required />
                </div>

                <div className="field">
                  <label htmlFor="confirmPassword">Confirmar clave</label>
                  <input
                    type='password'
                    id='confirmPassword'
                    name='confirmPassword'
                    value={confirmPassword}
                    onChange={onChange}
                    placeholder='Repita la clave'
                    required />
                </div>

                <div className="field full-width">
                  <label htmlFor="role">Rol</label>
                  <select
                    name="role"
                    id="role"
                    value={role}
                    onChange={onChange}
                    required>
                    <option value=''>Seleccione un rol</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>{role.name}</option>
                    ))}
                  </select>
                  <small className="field-hint">Define a qué opciones del menú y APIs tendrá acceso</small>
                </div>

                <div className="field full-width">
                  <div className="checklist-header">
                    <label>Tiendas asignadas ({selectedStores.length}/{stores.length})</label>
                    {stores.length > 0 && (
                      <button type="button" onClick={onToggleAllStores}>
                        {selectedStores.length === stores.length ? 'Quitar todas' : 'Seleccionar todas'}
                      </button>
                    )}
                  </div>
                  <div className="checklist">
                    {stores.length === 0 && <span>No hay tiendas registradas</span>}
                    {stores.map((store) => (
                      <label className="checklist-item" key={store._id}>
                        <input
                          type='checkbox'
                          checked={selectedStores.includes(store._id)}
                          onChange={() => onToggleStore(store._id)} />
                        {store.name}
                      </label>
                    ))}
                  </div>
                  <small className="field-hint">El usuario podrá elegir entre estas tiendas al iniciar sesión</small>
                </div>

              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-reverse" onClick={closeModal}>Cancelar</button>
                <button className="btn">{user._id ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </section>

        </Modal>

      </section>
    </div>
  );
}

export default Register;