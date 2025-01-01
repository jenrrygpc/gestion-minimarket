import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
//import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";
import { TbNewSection } from "react-icons/tb";
import { AiTwotoneEdit } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import ReactPaginate from 'react-paginate'; // pagination library
import {
  createStore, updateStore, getStores,
  reset, setStore, resetStore
} from "../features/stores/storeSlice";

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
  description: '',
  address: ''
}

function Store() {

  // ini pagination states
  const [offset, setOffset] = useState(0);
  const [storesPage, setStoresPage] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);
  //fin pagination states

  //state para establecer el texto de busqueda.
  const [storeSearch, setStoreSearch] = useState('');

  //state para abrir o cerrar el modal.
  const [modalIsOpen, setModalIsOpen] = useState(false);

  console.log('initialState ..:', initialState);
  const [formData, setFormData] = useState(initialState);

  const { name, description, address } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { store, stores, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.store
  );

  console.log('stores ..:', stores);

  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, store, message);
    if (isError) {
      //toast.error(message);
      Message('Tienda actualizada exitosamente!', 'error');
      dispatch(reset());
    }

    if (isSuccess) {
      closeModal();
      dispatch(getStores());
      if (store._id) {
        Message('Tienda actualizada exitosamente!');
      } else {
        Message('Tienda creada exitosamente!');
      }
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  // useEffect usado para cargar la data al inicio. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 2 ...');
    dispatch(getStores());
  }, []);

  // useEffect to handle items by page.
  useEffect(() => {
    console.log('useEffect stores ...', stores);
    setStoresPage(stores.slice(offset * perPage,
      (offset + 1) * perPage));
    setPageCount(Math.ceil(stores.length / perPage));
  }, [stores]);

  // use effect to handle pagination
  useEffect(() => {
    console.log('use effect offset ');
    setStoresPage(stores.slice(offset * perPage,
      (offset + 1) * perPage));
  }, [offset]);

  //useEffect to show data on popup.
  useEffect(() => {
    console.log('useEffect 3 ...', store);
    //if (user._id) {
    setFormData({
      name: store.name,
      description: store.description,
      address: store.address
    });
    //}
  }, [store]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onChangeSearch = (e) => {
    setStoreSearch(e.target.value);
  };

  const onKeyDownSearch = (e) => {
    console.log('onKeyDownSearch ..:', e);
    if (e.key === 'Enter') {
      console.log('get store ..:');
      dispatch(getStores({ name: e.target.value }));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (store._id) {
      dispatch(updateStore({
        id: store._id,
        name,
        description,
        address
      }));
    } else {
      dispatch(createStore({
        name,
        description,
        address
      }));
    }

  };

  const onEditar = (e) => {
    console.log('onEditar  ...', e.target.id);
    const store = stores.find((store) => store._id == e.target.id);
    console.log('onEditar store ...', store);
    if (store) {
      dispatch(setStore(store));
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
    dispatch(resetStore());
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
          <FaUser /> Tiendas
        </h1>
      </section>

      <section className="form-list">

        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td>

                <div className="form-group3">
                  <input
                    type='text'
                    className='form-control'
                    id='storeSearch'
                    name='storeSearch'
                    value={storeSearch}
                    onChange={onChangeSearch}
                    onKeyDown={onKeyDownSearch}
                    placeholder='Busqueda de tiendas...'
                    //ref={refInputDescBusqueda}
                    required />
                </div>

              </td>
              <td className="td-v-align-top" >

                <button className='btn' onClick={openModal} ><TbNewSection /> Nuevo </button>

              </td>
            </tr>
          </tbody>
        </table>

        {stores.length > 0 && <div>

          <div className="listas-headings" key="0">
            <div>Nombre</div>
            <div>Descripción</div>
            <div>Dirección</div>
            <div>Editar</div>
          </div>

          {storesPage.map(store => (
            <div className="listas" key={store._id}>
              <div>{store.name}</div>
              <div>{store.description}</div>
              <div> {store.address}</div>
              <div><AiTwotoneEdit onClick={onEditar} id={store._id} /> </div>

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


        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel='Nueva Tienda'>
          <h3>Nueva Tienda</h3>
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
                          placeholder='Ingrese nombre'
                          required />

                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="name">Descripción ..:</label>
                      </td>
                      <td>
                        <input
                          type='description'
                          className='form-control'
                          id='description'
                          name='description'
                          value={description}
                          onChange={onChange}
                          placeholder='Ingrese descripción' />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="name">Dirección ..:</label>
                      </td>
                      <td>
                        <input
                          type='address'
                          className='form-control'
                          id='address'
                          name='address'
                          value={address}
                          onChange={onChange}
                          placeholder='Ingrese dirección'
                          required />

                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="form-group">
                <button className="btn btn-block">{store._id ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </section>

        </Modal>

      </section>
    </div>
  );
}

export default Store;