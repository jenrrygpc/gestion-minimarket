import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { FaUser, FaSignOutAlt, FaSearch } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { createProduct, updateProduct, getProduct, reset, setProduct, setProducts } from "../features/products/productSlice";
import { getMeasures } from "../features/measures/measureSlice";
import Spinner from '../components/Spinner';
import styled from 'styled-components';

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


const LoginStyle = styled.ul`
  display: flex;
`;

const LoginStyle2 = styled.li`
  margin-left: 20px;
`;



const initialState = {
  code: '',
  description: '',
  measure: '',
  price: 0,
  stock: 0,
  minimumStock: 0,
  discount: 0,
  requiresParameter: false
}

function ProductSale() {

  //state para abrir o cerrar el modal.
  const [modalIsOpen, setModalIsOpen] = useState(false);
  //state para establecer el texto de busqueda.
  const [descBusqueda, setDescBusqueda] = useState('');

  //useRef is to focus into the component.
  const refInputCode = useRef(null);
  const refInputDescription = useRef(null);
  const refInputDescBusqueda = useRef(null);

  const { measures } = useSelector(
    (state) => state.measure
  );
  initialState.measure = (measures[0] || {}).abbreviation

  const [formData, setFormData] = useState(initialState);

  //state used to disable inputCode
  const [disableInputCode, setDisableInputCode] = useState(false);

  //const [measure, setMeasure] = useState('');


  const { code,
    description,
    measure,
    price,
    stock,
    minimumStock,
    discount,
    requiresParameter } = formData;


  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    product, products, isLoading,
    isError, isSuccess, message,
    isErrorGetProduct, messageGetProduct
  } = useSelector(
    (state) => state.product
  );


  console.log('product ...', product);

  console.log('products ...', products);


  // useEffect usado para manejar el registro o actualizacion del producto
  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, message);
    if (isError) {
      refInputCode.current.focus();
      toast.error(message);
    }
    // Redirect to the same page
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
    //    if (measures.length === 0) {
    //    dispatch(getMeasures())
    //  }
  }, [isError, isSuccess, message, navigate, dispatch]);

  // useEffect usado para manejar la busqueda de producto por codigo de barras.  
  useEffect(() => {
    console.log('useEffect 2 ...', product);
    console.log('refInputCode 2 ...', refInputCode);
    console.log('refInputCode 2 ...', isErrorGetProduct);
    console.log('refInputCode 2 ...', messageGetProduct);

    if (isErrorGetProduct) {
      //esta funcionalidad no se habilita, para ello desactivar el input code.
      //setFormData(initialState);
      //navigate('/productos/venta');
      //dispatch(reset());
      refInputDescription.current.focus();
      toast.info(`${messageGetProduct}. Registrar nuevo producto.`);
      setDisableInputCode(true);
    }

    if (product.code) {
      setFormData({
        ...product
      });
      setDisableInputCode(true);
      refInputDescription.current.focus();
    }

  }, [product, isErrorGetProduct, messageGetProduct])

  // useEffect usado para cargar la data de medidas. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 3 ...');
    dispatch(getMeasures())
    refInputCode.current.focus();
  }, [])


  // useEffect usado para manejar listado de productos.
  useEffect(() => {
    console.log('refInputDescBusqueda ...:', refInputDescBusqueda);
    console.log('refInputDescBusqueda ...:', refInputDescBusqueda.current);
    if (refInputDescBusqueda.current) {
      console.log('refInputDescBusqueda.current.focus() ...:');
      refInputDescBusqueda.current.focus();
    }
  }, [products])




  const onKeyDownCode = (e) => {
    console.log('onKeyDownCode ..:', e);
    if (e.key === 'Enter' && !disableInputCode) {
      console.log('Consultar producto ..:', e.target.value);
      dispatch(getProduct({ code: e.target.value }));
    }

  };

  const onKeyDownDesc = (e) => {
    console.log('onKeyDownDesc ..:', e);
    if (e.key === 'Enter' && e.target.value.length > 2) {
      console.log('Buscar producto por descripción ..:', e.target.value);
      //dispatch(getProductByCode(e.target.value));
      dispatch(getProduct({ description: e.target.value }));

    }

  };

  const onChangeCode = (e) => {
    console.log('onChangeCode ..:', e);
    if (!disableInputCode) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.value
      }));
    }

  };


  const onChange = (e) => {
    console.log('e ..:', e);
    console.log('e.target ..:', e.target);
    console.log('e.target.name ..:', e.target.name);
    console.log('e.target.value ..:', e.target.value);
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onChangeDesc = (e) => {
    console.log('onChangeDesc ..:', e);
    setDescBusqueda(e.target.value);
  };

  const onChangeCheck = (e) => {
    console.log('e ..:', e);
    setFormData({
      ...formData,
      requiresParameter: !requiresParameter
    });
  };


  const onSubmit = (e) => {
    // e.preventDefault();

    const productData = {
      id: product._id,
      code,
      description,
      price,
      stock,
      minimumStock,
      discount,
      measure,
      requiresParameter
    };

    console.log('product ...', product);
    console.log('productData ..: ', productData);
    if (product.code) {
      console.log('Actualizar producto ...');
      dispatch(updateProduct(productData));
    } else {
      dispatch(createProduct(productData));
    }

  };

  const onReset = (e) => {
    dispatch(reset());
    setFormData(initialState);
    navigate('/productos/venta');
    refInputCode.current.focus();
    setDisableInputCode(false);

  };

  // Open/Close modal
  const openModal = () => {
    setModalIsOpen(true);
    setDescBusqueda('');
    dispatch(setProducts([]));
    //refInputDescBusqueda.current.focus();
  };



  const closeModal = () => {
    setModalIsOpen(false);
    // validar si se deberia limpiar todo el initialState
    // dispatch(reset());
  };

  const onEditar = (e) => {
    console.log('onEditar  ...', e.target.id);
    console.log('onEditar products ...', products);
    const product = products.find((pro) => pro.code == e.target.id);
    closeModal();
    console.log('onEditar product ...', product);

    // se establece el valor en lugar de buscarlo nuevamente de la base de datos
    // dispatch(getProduct({ code: product.code }));
    dispatch(setProduct(product));

    /*
    setFormData({
      ...product
    });
    */
  };


  if (isLoading) {
    return <Spinner />
  }


  return (
    <div className="container">
      <section className="heading">
        <p>
          <FaUser />Mantenimiento de productos
        </p>
      </section>

      <section className="form">

        <div className="form-group">

          <table style={{ width: '100%' }}>
            <tr>
              <td>
                <label htmlFor="name">Código ..:</label>
              </td>
              <td>
                <input
                  type='text'
                  className='form-control'
                  id='code'
                  name='code'
                  value={code}
                  onChange={onChangeCode}
                  onKeyDown={onKeyDownCode}
                  placeholder='Ingresar codigo de producto'
                  ref={refInputCode}
                  //disabled={disableInputCode}
                  required />
              </td>
              <td className="td-v-align-top" >
                <button className='btn' onClick={openModal} ><FaSearch /> ... </button>
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="name">Descripción ..:</label>
              </td>
              <td colSpan="2">
                <input
                  type='text'
                  className='form-control'
                  id='description'
                  name='description'
                  value={description}
                  onChange={onChange}
                  placeholder='Ingresar descripción del producto'
                  ref={refInputDescription}
                  required />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="name">Medida Venta ..:</label>
              </td>
              <td colSpan="2">
                <select name="measure" id="measure" value={measure} onChange={onChange}>

                  {
                    measures.map((measure) => {
                      return <option id={measure.id} value={measure.abbreviation}>{measure.description}</option>
                    })
                  }
                </select>
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="name">Precio ..:</label>
              </td>
              <td colSpan="2">
                <input
                  type='text'
                  className='form-control'
                  id='price'
                  name='price'
                  value={price}
                  onChange={onChange}
                  placeholder='Ingresar precio del producto'
                  required />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="name">Stock ..:</label>
              </td>
              <td colSpan="2">
                <input
                  type='text'
                  className='form-control'
                  id='stock'
                  name='stock'
                  value={stock}
                  onChange={onChange}
                  placeholder='Ingresar stock del producto' />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="name">Stock mínimo ..:</label>
              </td>
              <td colSpan="2">
                <input
                  type='text'
                  className='form-control'
                  id='minimumStock'
                  name='minimumStock'
                  value={minimumStock}
                  onChange={onChange}
                  placeholder='Ingresar stock minimo del producto' />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="name">% descuento ..:</label>
              </td>
              <td colSpan="2">
                <input
                  type='text'
                  className='form-control'
                  id='discount'
                  name='discount'
                  value={discount}
                  onChange={onChange}
                  placeholder='Ingresar % descuento' />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="name">Req. parametro ..:</label>
              </td>
              <td colSpan="2" >
                <input
                  type='checkbox'
                  id='requiresParameter'
                  name='requiresParameter'
                  //value={requiresParameter}
                  checked={requiresParameter}
                  defaultChecked={requiresParameter}
                  onChange={onChangeCheck}
                  placeholder='Requiere parametro adicional' />
              </td>
            </tr>
          </table>

        </div>

        <div className="form-group2">
          <button className="btn btn-block" onClick={onSubmit}>Guardar</button>
          <button className="btn btn-block" onClick={onReset}>Reiniciar</button>
        </div>

        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel='Busqueda de productos ...'>
          <h3>Busqueda de producto ...:</h3>
          <div className="form-group">
            <input
              type='text'
              className='form-control'
              id='descBusqueda'
              name='descBusqueda'
              value={descBusqueda}
              onChange={onChangeDesc}
              onKeyDown={onKeyDownDesc}
              placeholder='Ingresar descripción del producto'
              ref={refInputDescBusqueda}
              required />
          </div>


          <button className='btn-close' onClick={closeModal}>
            X
          </button>

          {products.length > 0 && <div>

            <div className="ticket-headings">
              <div>Descripción</div>
              <div>Medida</div>
              <div>Precio</div>
              <div>Stock</div>
              <div>Editar</div>
            </div>

            {products.map(product => (
              <div className="ticket">
                <div>{product.description}</div>
                <div>{product.measure}</div>
                <div>{product.price}</div>
                <div>{product.stock}</div>
                <button className="btn" id={product.code} onClick={onEditar}></button>
              </div>
            ))}
          </div>}

        </Modal>

      </section>
    </div>
  );
}

export default ProductSale;