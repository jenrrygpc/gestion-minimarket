import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
//import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";
import { TbNewSection } from "react-icons/tb";
import { AiTwotoneEdit } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
//import ReactPaginate from 'react-paginate'; // pagination library
/*
import {
  createStore, updateStore, getStores,
  reset, setStore, resetStore
} from "../features/stores/storeSlice";
*/

import {
  createPosShift, updatePosShift, getPosShift,
  reset, resetPosShift, setPosShift
} from "../features/posShift/posShiftSlice";

import { getPos } from '../features/pos/posSlice';

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
  pos: '',
  user: '',
  initialAmount: ''
}

function PosShift() {

  // ini pagination states
  /*
  const [offset, setOffset] = useState(0);
  const [storesPage, setStoresPage] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);
  */
  //fin pagination states

  //state para establecer el texto de busqueda.
  //const [storeSearch, setStoreSearch] = useState('');

  //state para abrir o cerrar el modal.
  const [modalIsOpen, setModalIsOpen] = useState(false);

  console.log('initialState ..:', initialState);
  const [formData, setFormData] = useState(initialState);

  const { pos, user, initialAmount } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { posShift, posShiftList, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.posShift
  );

  const { posList } = useSelector(
    (state) => state.pos
  );

  console.log('posList ..:', posList);
  console.log('posShiftList ..:', posShiftList);

  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, message);
    if (isError) {
      //toast.error(message);
      Message(message, 'error');
      dispatch(reset());
    }

    if (isSuccess) {
      closeModal();
      dispatch(getPosShift());
      if (posShift._id) {
        Message('Cierre de turno exitoso!');
      } else {
        Message('Inicio de turno exitoso!');
      }
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  // useEffect usado para cargar la data al inicio. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 2 ...');
    dispatch(getPos());
    dispatch(getPosShift({
      status: 'ABIERTO',
    }));
  }, []);

  // useEffect to handle items by page.
  /*
  useEffect(() => {
    console.log('useEffect stores ...', stores);
    setStoresPage(stores.slice(offset * perPage,
      (offset + 1) * perPage));
    setPageCount(Math.ceil(stores.length / perPage));
  }, [stores]);
  */

  // use effect to handle pagination
  /*
  useEffect(() => {
    console.log('use effect offset ');
    setStoresPage(stores.slice(offset * perPage,
      (offset + 1) * perPage));
  }, [offset]);
  */

  //useEffect to show data on popup.
  useEffect(() => {
    console.log('useEffect 3 ...', posShift);
    //if (user._id) {
    setFormData({
      status: posShift.status,
      shiftStart: posShift.shiftStart,
      initialAmount: posShift.initialAmount
    });
    //}
  }, [posShift]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  /*
  const onChangeSearch = (e) => {
    setStoreSearch(e.target.value);
  };
  */

  /*
  const onKeyDownSearch = (e) => {
    console.log('onKeyDownSearch ..:', e);
    if (e.key === 'Enter') {
      console.log('get store ..:');
      dispatch(getStores({ name: e.target.value }));
    }
  };
  */

  const onSubmit = (e) => {
    e.preventDefault();

    if (posShift._id) {
      dispatch(updateStore({
        id: posShift._id,
        name,
        description,
        address
      }));
    } else {
      dispatch(createStore({
        status: 'ABIERTO',
        shiftStart: new Date(),
        initialAmount,
        idPos: 'POS-001'
      }));
    }

  };

  const onEditar = (posShiftItem) => {
    console.log('eeeee  ...', posShiftItem);
    if (posShiftItem) {
      dispatch(setPosShift(posShiftItem));
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
  /*
  const handlePageClick = (e) => {
    console.log('e.selected ..:', e);
    const selectedPage = e.selected;
    console.log('selectedPage ..:', selectedPage);
    setOffset(selectedPage)
  };
  */

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="container-list">
      <br></br>
      <section>
        <h1>
          <FaUser /> Inicio/Cierre de Turno
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
                    //value={storeSearch}
                    //onChange={onChangeSearch}
                    //onKeyDown={onKeyDownSearch}
                    placeholder='Busqueda de tiendas...'
                    //ref={refInputDescBusqueda}
                    required />
                </div>

              </td>
              <td className="td-v-align-top" >

                <button className='btn' onClick={openModal} ><TbNewSection /> Iniciar Turno </button>

              </td>
            </tr>
          </tbody>
        </table>

        {posShiftList.length > 0 && <div>

          <div className="listas-headings-dynamics" key="0">
            <div>Caja</div>
            <div>Usuario</div>
            <div>Monto apertura</div>
            <div>Fecha/hora Inicio</div>
            <div>Estado</div>
          </div>

          {posShiftList.map(posShift => (
            <div className="listas-dynamics" key={posShift._id}>
              <div>{posList.find((item) => item._id === posShift.idPos)?.name}</div>
              <div>{posShift.userName}</div>
              <div>{posShift.initialAmount}</div>
              <div>{posShift.shiftStart}</div>
              <div> {posShift.enabled ? 'Activo' : 'Inactivo'}</div>
              <div>

                <button onClick={() => onEditar(posShift)} style={{ border: 'none', background: 'none' }} >
                  <AiTwotoneEdit color="black" />
                </button>

              </div>

            </div>
          ))}
        </div>}

        { /*
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
        */
        }


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
                          id='initialAmount'
                          name='initialAmount'
                          value={initialAmount}
                          onChange={onChange}
                          placeholder='Ingrese monto inicial'
                          required />

                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
              <div className="form-group">
                <button className="btn btn-block">{posShift._id ? 'Cerrar' : 'Iniciar'}</button>
              </div>
            </form>
          </section>

        </Modal>

      </section>
    </div>
  );
}

export default PosShift;