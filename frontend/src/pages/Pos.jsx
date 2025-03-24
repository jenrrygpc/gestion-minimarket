import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
//import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";
import { TbNewSection } from "react-icons/tb";
import { AiTwotoneEdit } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import ReactPaginate from 'react-paginate'; // pagination library
import {
  createPos, updatePos, getPos,
  reset, setPos, resetPos
} from "../features/pos/posSlice";

import { getStores } from '../features/stores/storeSlice';
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
  storeId: '',
  storeName: '',
}

function Pos() {

  // ini pagination states
  const [offset, setOffset] = useState(0);
  const [posPage, setPosPage] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);
  //fin pagination states

  //state para establecer el texto de busqueda.
  const [posSearch, setPosSearch] = useState('');

  //state para abrir o cerrar el modal.
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const { stores } = useSelector(
    (state) => state.store
  );

  console.log('stores ....:', stores);

  initialState.storeId = (stores[0] || {})._id
  console.log('initialState ..:', initialState);
  const [formData, setFormData] = useState(initialState);

  const { name, storeId, storeName } = formData;

  console.log('name xxx..:', name);
  console.log('storeId xxx..:', storeId);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { pos, posList, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.pos
  );

  console.log('posList ..:', posList);

  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, message);
    if (isError) {
      Message(message, 'error');
      dispatch(reset());
    }

    if (isSuccess) {
      closeModal();
      dispatch(getPos());
      if (pos._id) {
        Message('Punto de venta actualizada exitosamente!');
      } else {
        Message('Punto de venta creada exitosamente!');
      }
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  // useEffect usado para cargar la data al inicio. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 2 ...');
    dispatch(getStores());
    dispatch(getPos());
  }, []);

  // useEffect to handle items by page.
  useEffect(() => {
    console.log('useEffect pos ...', posList);
    setPosPage(posList.slice(offset * perPage,
      (offset + 1) * perPage));
    setPageCount(Math.ceil(posList.length / perPage));
  }, [posList]);

  // use effect to handle pagination
  useEffect(() => {
    console.log('use effect offset ');
    setPosPage(posList.slice(offset * perPage,
      (offset + 1) * perPage));
  }, [offset]);

  //useEffect to show data on popup.
  useEffect(() => {
    console.log('useEffect 3 ...', pos);
    //if (user._id) {
    setFormData({
      name: pos.name,
      storeId: pos.store,
      //storeName: stores.find((store) => store._id === pos.store).name
      //description: store.description,
      //address: store.address
    });
    //}
  }, [pos]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const handleStoreChange = (e) => {
    console.log('e ..:', e);
    const storeId = e.target.value;
    console.log('storeId ..:', storeId);
    const storeFound = stores.find((store) => store._id === storeId);
    console.log('storeFound ..:', storeFound);

    setFormData((prevState) => ({
      ...prevState,
      storeId,
      storeName: storeFound.name
    }));
  };


  const onChangeSearch = (e) => {
    setPosSearch(e.target.value);
  };

  const onKeyDownSearch = (e) => {
    console.log('onKeyDownSearch ..:', e);
    if (e.key === 'Enter') {
      console.log('get pos ..:');
      dispatch(getPos({ name: e.target.value }));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();


    console.log('name ..:', name);
    console.log('storeId ..:', storeId);

    if (pos._id) {
      dispatch(updatePos({
        id: pos._id,
        name,
        store: storeId
      }));
    } else {
      dispatch(createPos({
        name,
        store: storeId || initialState.storeId
      }));
    }

  };

  const onEditar = (posItem) => {
    console.log('eeeee  ...', posItem);
    if (posItem) {
      dispatch(setPos(posItem));
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
    dispatch(resetPos());
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
          <FaUser /> Puntos de venta
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
                    id='posSearch'
                    name='posSearch'
                    value={posSearch}
                    onChange={onChangeSearch}
                    onKeyDown={onKeyDownSearch}
                    placeholder='Buscar por nombre ...'
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

        {posList.length > 0 && <div>

          <div className="listas-headings" key="0">
            <div>Nombre</div>
            <div>Tienda</div>
            <div>Estado</div>
            <div>Editar</div>
          </div>

          {posPage.map(pos => (
            <div className="listas" key={pos._id}>
              <div>{pos.name}</div>
              <div>{stores.find((store) => store._id === pos.store).name}</div>
              <div> {pos.enabled ? 'Activo' : 'Inactivo'}</div>
              <div>
                
                <button onClick={() => onEditar(pos)} style={{ border: 'none', background: 'none' }} >
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


        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel='Nuevo POS'>
          <h3>Nuevo Punto de Venta</h3>
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
                        <label htmlFor="store">Tienda ..:</label>
                      </td>
                      <td>

                        <select
                          className='form-control'
                          id='store'
                          name='store'
                          value={storeId}
                          onChange={handleStoreChange}
                          required>
                          {
                            stores.map((store) => {
                              return <option key={store._id} id={store._id} value={store._id}>{store.name}</option>
                            })
                          }
                        </select>

                      </td>
                    </tr>


                  </tbody>
                </table>
              </div>
              <div className="form-group">
                <button className="btn btn-block">{pos._id ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </section>

        </Modal>

      </section>
    </div>
  );
}

export default Pos;