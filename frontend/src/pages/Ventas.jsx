import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { AiOutlineEnter } from "react-icons/ai";
import { FaBackspace } from "react-icons/fa";

import { useSelector, useDispatch } from "react-redux";

import { createProduct, getProduct, reset } from "../features/products/saleSlice";
import { getPosShift, getValidPosShift } from "../features/posShift/posShiftSlice";
/*
import {
  reset, getMasters, setMaster,
  createMaster, updateMaster,
  resetCreate
} from "../features/masters/masterSlice";
*/
import Spinner from '../components/Spinner';


const initialState = {
  code: '',
  shoppingCart: []
}


function Category() {


  const [formData, setFormData] = useState(initialState);
  const [modalIsOpen, setModalIsOpen] = useState(false); // Estado para manejar la visibilidad del modal

  //useRef is to focus into the component.
  const refInputCode = useRef(null);

  const { code, shoppingCart } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    product, isLoading,
    isError, isSuccess, message
  } = useSelector(
    (state) => state.sale
  );

  const { posShiftList } = useSelector(
    (state) => state.posShift
  );

  console.log('posShiftList ..:', posShiftList);

  // useEffect usado para cargar la data al inicio. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 0 ...');
    //Get user from localstorage
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('get local storage', user);
    const store = JSON.parse(localStorage.getItem('store'));
    console.log('get store', store);
    const posShift = JSON.parse(localStorage.getItem('PosShift'));
    console.log('get posShift', posShift);
    if (!posShift) {
      // consultar caja abierta en el backend
      dispatch(getValidPosShift({
        status: 'ABIERTO',
      }));
      // si no hay caja abierta, abrir caja

    }
    //dispatch(getProduct());
    //dispatch(getMeasures());
    //dispatch(getMastersByTypes(['PRESENTACION', 'CATEGORIA']));
  }, []);

  useEffect(() => {

    console.log('posShiftList ...', posShiftList);

    if (posShiftList.length > 0) {
      localStorage.setItem('PosShift', JSON.stringify(posShiftList[0]));
    } else {
      setModalIsOpen(true); // Mostrar modal si no hay ninguna caja abierta
    }

  }, [posShiftList]);


  /*
  useEffect(() => {
    console.log('useEffect 2 ...', isError, isSuccess, message);
    if (isError) {
      refInputCode.current.focus();
      toast.error(message);
    }

    if (isSuccess) {
      refInputCode.current.focus();
      shoppingCart.push(product);
      refInputCode.current.focus();
    }

    console.log('product 1 ...', product);
    console.log('shoppingCart 1 ...', shoppingCart);
  }, [isError, isSuccess, message, navigate, dispatch]);
  */


  const onChangeCode = (e) => {
    console.log('onChangeCode ..:', e);
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));

  };

  const onKeyDownCode = (e) => {
    console.log('onKeyDownCode ..:', e);
    if (e.key === 'Enter') {
      // se puso este codigo para devolver mensaje nuevamente y establecer el foco en el campo codigo
      dispatch(reset());
      console.log('Consultar producto ..:', e.target.value);
      dispatch(getProduct({ code: e.target.value }));
    }
  };

    const closeModal = () => {
      setModalIsOpen(false);
      //setFormData(initialState);
      // validar si se deberia limpiar todo el initialState
      //dispatch(reset());
      //dispatch(resetPos());
    };



  if (isLoading) {
    return <Spinner />
  }




  return (

    <div className="ventas">
      <div className="venta">

        <div className="form-group">
          <input
            type='text'
            className='form-control'
            id='code'
            name='code'
            // value={codigo}
            onChange={onChangeCode}
            onKeyDown={onKeyDownCode}
            placeholder='Ingresar código de producto'
            ref={refInputCode}
            required />

        </div>


        <div className="productos-cabecera-grid">
          <div>Descripción</div>
          <div>Cantidad</div>
          <div>Precio</div>
          <div>Eliminar</div>
        </div>
        <div className="productos">

          <div className="productos-detalle-grid">
            <div>Agua mineral San Luis 100ml - Sin Gas</div>
            <div>2 UN</div>
            <div>S/. 5.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Detergente Ace floral 5k</div>
            <div>1 UN</div>
            <div>S/. 59.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Aceite primor light 900 ml</div>
            <div>1 UN</div>
            <div>S/. 11.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Aceite primor light 900 ml</div>
            <div>1 UN</div>
            <div>S/. 11.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Aceite primor light 900 ml</div>
            <div>1 UN</div>
            <div>S/. 11.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Aceite primor light 900 ml</div>
            <div>1 UN</div>
            <div>S/. 11.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Aceite primor light 900 ml</div>
            <div>1 UN</div>
            <div>S/. 11.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Aceite primor light 900 ml</div>
            <div>1 UN</div>
            <div>S/. 11.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Aceite primor light 900 ml</div>
            <div>1 UN</div>
            <div>S/. 11.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Aceite primor light 900 ml</div>
            <div>1 UN</div>
            <div>S/. 11.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Aceite primor light 900 ml</div>
            <div>1 UN</div>
            <div>S/. 11.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Aceite primor light 900 ml</div>
            <div>1 UN</div>
            <div>S/. 11.00</div>
            <div>Eliminar</div>
          </div>
          <div className="productos-detalle-grid">
            <div>Aceite primor light 900 ml</div>
            <div>1 UN</div>
            <div>S/. 11.00</div>
            <div>Eliminar</div>
          </div>

        </div>

        <div className="totales">

          <p className="totales-item">Sub Total : </p>
          <p className="totales-item">{'150000.00'} </p>
          <p className="totales-item">IGV : </p>
          <p className="totales-item">{'10025.00'} </p>
          <p className="totales-item">Total : </p>
          <p className="totales-item">{'160025.00'} </p>

        </div>


      </div>

      <div className="teclado">

        <button className='btn'  > 7 </button>
        <button className='btn'  > 8 </button>
        <button className='btn'  > 9 </button>
        <button className='btn'  > 000 </button>

        <button className='btn'  > 4 </button>
        <button className='btn'  > 5 </button>
        <button className='btn'  > 6 </button>
        <button className='btn'  > Limpiar </button>

        <button className='btn'  > 1 </button>
        <button className='btn'  > 2 </button>
        <button className='btn'  > 3 </button>
        <button className='btn btn-enter'  >
          <AiOutlineEnter /> Enter
        </button>

        <button className='btn'  > 0 </button>
        <button className='btn'  > . </button>
        <button className='btn'  >  <FaBackspace /> </button>


      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel='Nuevo POS'>
        <h3>Apertura de Punto de Venta</h3>
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
                      <label htmlFor="store">Pos disponibles ..:</label>
                    </td>
                    <td>

                      <select
                        className='form-control'
                        id='pointOfSale'
                        name='pointOfSale'
                        value={pointOfSaleId}
                        onChange={handleStoreChange}
                        required>
                        {
                          pointsOfSale.map((pointOfSale) => {
                            return <option key={pointOfSale._id} id={pointOfSale._id} value={pointOfSale._id}>{pointOfSale.name}</option>
                          })
                        }
                      </select>

                    </td>
                  </tr>
                  
                  <tr>
                    <td>
                      <label htmlFor="montoInicial">Monto inicial ..:</label>
                    </td>
                    <td>

                      <input
                        type='text'
                        className='form-control'
                        id='montoInicial'
                        name='montoInicial'
                        value={montoInicial}
                        onChange={onChange}
                        placeholder='Ingrese monto inicial'
                        required />

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
    </div>


  );
}

export default Category;