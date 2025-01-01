import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { AiOutlineEnter } from "react-icons/ai";



import { FaBackspace } from "react-icons/fa";
//import ReactPaginate from 'react-paginate';

import { useSelector, useDispatch } from "react-redux";

import { createProduct, getProduct, reset } from "../features/products/saleSlice";
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



  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, message);
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
    // Redirect to the same page
    /*
    if (isSuccess) {
      dispatch(reset());
      setFormData(initialState);
      navigate('/productos/venta');
      if (product._id) {
        toast.success('Producto Actualizado');
      } else {
        toast.success('Producto registrado');
      }

      setDisableInputCode(false);

      refInputCode.current.focus();
    }
    */
    //    if (measures.length === 0) {
    //    dispatch(getMeasures())
    //  }
  }, [isError, isSuccess, message, navigate, dispatch]);


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
    </div>


  );
}

export default Category;