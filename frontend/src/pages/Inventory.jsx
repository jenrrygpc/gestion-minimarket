/* React */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';

/* React Redux */
import { useSelector, useDispatch } from "react-redux";

/* react-icons */
import { FaUser } from "react-icons/fa";
import { MdOutlineInventory, MdDelete, MdRestartAlt } from "react-icons/md";
import { FaMinusCircle, FaPlusCircle, FaRegSave } from "react-icons/fa";

import { TbNewSection } from "react-icons/tb";

/* feature stores */
import { getRTs } from "../features/reasons-transaction/reasonTransactionSlice";
//import { getProduct } from "../features/products/productSlice";
import {
  getProduct,
  registerInventory,
  reset,
  updateProducts
} from "../features/inventories/inventorySlice";

/* components */
import Spinner from '../components/Spinner';
import Message from '../components/Message';

const initialState = {
  transactionType: 'ENTRADA',
  reasonTransaction: '',
  referenceDocument: '',
  supplier: '',
  productsInventory: [],
}

//const Inventory = () => {
function Inventory() {

  const refInputDescBusqueda = useRef(null);

  //state para establecer el texto de busqueda.
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const { reasons } = useSelector(
    (state) => state.reasonTransaction
  );
  initialState.reasonTransaction = (reasons[0] || {}).name;

  console.log('reasons ...', reasons);

  const [formData, setFormData] = useState(initialState);

  const { transactionType, reasonTransaction,
    referenceDocument, supplier,
    productsInventory,
  } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, products, isLoading,
    isError, isSuccess, message } = useSelector(
      (state) => state.inventory
    );


  // useEffect usado para cargar la data al inicio. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 2 ...');
    dispatch(getRTs());
  }, []);

  useEffect(() => {
    return () => {
      dispatch(reset()); // Reiniciar el estado global al desmontar
    };
  }, [dispatch]);

  // useEffect to handle items by page.
  useEffect(() => {
    console.log('useEffect product ...', product);
    if (product) {

      if (!product.code) {
        Message('Producto no encontrado!', 'error');
        return;
      }

      setFormData((prevState) => ({
        ...prevState,
        productsInventory: [...prevState.productsInventory, {
          id: product._id,
          code: product.code,
          description: product.description,
          quantity: 1,
          cost: product.cost || product.price,
          price: product.price,
          originalPrice: product.price,
        }]
      }));
    }



  }, [product]);

  useEffect(() => {
    console.log('useEffect products ...', products);

    setSearchResults(products.map((product) => {
      return {
        id: product._id,
        code: product.code,
        description: product.description,
        price: product.price,
        measure: product.measure,
      }
    }));


    //setShowResults(true);

  }, [products]);

  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, product, message);
    if (isError) {
      Message(message, 'error');
    }

    if (isSuccess) {
      Message('Inventario actualizado exitosamente!');
      // actualizar stock y price en el listado de productos.
      handleStockAndPriceUpdate(productsInventory);
      reiniciar();
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  const handleStockAndPriceUpdate = () => {
    console.log('productsInventory 1 ...', productsInventory);


    dispatch(updateProducts(
      productsInventory.map((product) => ({
        id: product.id,
        quantity: Number(product.quantity),
        price: Number(product.price),
        cost: Number(product.cost),
      }))
    ))


  }

  /*
  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, message);
    if (isError) {
      Message(message, 'error');
      //dispatch(reset());
    }

    if (isSuccess) {
      Message('Productos agregados al inventario!', 'success');
    }


  }, [isError, isSuccess, message, navigate, dispatch]);
  */

  console.log('productsInventory 2 ...', productsInventory);

  const onChange = (e) => {
    const { name, value } = e.target;
    console.log('onChange ...:', name, value);
    if (name === 'code') {
      if (isNaN(value) || value.includes('.') || value.includes(' ')) {
        return;
      }
    }
    if (name === 'price' || name === 'stock' || name === 'minimumStock') {
      if (isNaN(value) || value.includes(' ')) {
        return;
      }
    }
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onChangeQuantity = (e, product) => {

    const { name, value } = e.target;

    console.log('name  ...', name);
    console.log('value  ...', value);
    console.log('product  ...', product);

    if (name === 'quantity' && (isNaN(value) || value.includes('.') || value.includes(' '))) {
      return;
    }

    if ((name === 'cost' || name === 'price') && (isNaN(value) || value.includes(' '))) {
      return;
    }

    console.log('setFormData  ...');

    setFormData((prevState) => ({
      ...prevState,
      productsInventory: productsInventory.map((p) =>
        p.code === product.code ? { ...p, [name]: value } : p
      )
    }));


  };

  const onChangeSearch = (e) => {
    const { value = '' } = e.target;
    console.log('onChangeSearch ..:', value);
    setProductSearch(value);
    if (value.length > 2) {
      if (isNaN(value.trim())) {
        dispatch(getProduct({ description: value.trim() }));
        setShowResults(true);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const onKeyDownSearch = (e) => {
    console.log('onKeyDownSearch ..:', e);
    const { value = '' } = e.target;
    //if (e.key === 'Enter') {
    console.log('get product ..:', value);
    if (!isNaN(value.trim()) && value.trim() !== '' && e.key === 'Enter') {

      const productFound = productsInventory.find((product) => product.code === Number(value));

      if (productFound) {

        setFormData((prevState) => ({
          ...prevState,
          productsInventory: productsInventory.map((product) => {
            if (product.code === Number(value)) {
              return {
                ...product,
                quantity: product.quantity + 1
              }
            }
            return product
          })
        }));
      }
      else {
        dispatch(getProduct({ code: Number(value) }));
      }
      setProductSearch('');
    } //else {
    //if (value.length > 2) {
    //  dispatch(getProduct({ description: value }));
    //}
    //}
    //}
  };

  const guardar = () => {
    console.log('guardar ...', formData);
    console.log('transactionType ...', transactionType);
    console.log('reasonTransaction ...', reasonTransaction);
    console.log('referenceDocument ...', referenceDocument);
    console.log('productsInventory ...', productsInventory);

    if (productsInventory.length === 0) {
      Message('No hay productos para registrar!', 'info');
      refInputDescBusqueda.current.focus();
      return
    }

    if (productsInventory.find((product) => product.cost > product.price)) {
      Message('El costo no puede ser mayor al precio!', 'error');
      return
    }

    dispatch(registerInventory({
      transactionType,
      reasonTransaction,
      document: referenceDocument,
      products: productsInventory.map((product) => {
        return {
          productId: product.id,
          quantity: product.quantity,
          price: product.price,
          cost: product.cost,
          originalPrice: product.originalPrice
        }
      })
    }));
  };

  const reiniciar = () => {
    setFormData(initialState);
    dispatch(reset());
    refInputDescBusqueda.current.focus();
  };


  // Define the event handlers
  const handlePlusClick = (product) => {
    console.log('handlePlusClick  ...', product);

    setFormData((prevState) => ({
      ...prevState,
      productsInventory: productsInventory.map((p) =>
        p.code === product.code ? { ...p, quantity: Number(p.quantity) + 1 } : p
      )
    }));
    // Your event handling logic here
    //console.log('Plus icon clicked');
  };

  // Define the event handlers
  const handleMinusClick = (product) => {
    // Your event handling logic here
    console.log('Minus icon clicked');
    if (product.quantity > 1) {
      setFormData((prevState) => ({
        ...prevState,
        productsInventory: productsInventory.map((p) =>
          p.code === product.code ? { ...p, quantity: p.quantity - 1 } : p
        )
      }));
    }
  };

  const handleDeleteClick = (product) => {
    // Your event handling logic here
    setFormData((prevState) => ({
      ...prevState,
      productsInventory: prevState.productsInventory.filter((p) => p.code !== product.code)
    }));
  };

  const handleEventBlur = (event, product) => {

    const { name, value } = event.target;

    console.log('name  ...', name);
    console.log('value  ...', value);
    console.log('product  ...', product);
    console.log('product cost  ...', product.cost);
    const newCost = event.target.value;
    console.log('Cost input lost focus. New cost:', newCost, 'for product:', product);
    if (name === 'cost') {

      if (isNaN(value) || value === '') {
        setFormData((prevState) => ({
          ...prevState,
          productsInventory: productsInventory.map((p) =>
            p.code === product.code ? { ...p, cost: p.originalPrice } : p
          )
        }));
        Message('El costo no puede ser vacío o no numérico!', 'error');
      }

      /*
      if (value > product.price) {
        setFormData((prevState) => ({
          ...prevState,
          productsInventory: productsInventory.map((p) =>
            p.code === product.code ? { ...p, cost: p.price } : p
          )
        }));
        Message('El costo no puede ser mayor al precio!', 'error');
      }
        */


    }

    if (name === 'price') {

      if (isNaN(value) || value === '') {
        setFormData((prevState) => ({
          ...prevState,
          productsInventory: productsInventory.map((p) =>
            p.code === product.code ? { ...p, price: p.originalPrice } : p
          )
        }));
        Message('El costo no puede ser vacío o no numérico!', 'error');
      }

      /*
      if (value < product.cost) {
        setFormData((prevState) => ({
          ...prevState,
          productsInventory: productsInventory.map((p) =>
            p.code === product.code ? { ...p, price: p.cost } : p
          )
        }));
        Message('El precio no puede ser menor al costo!', 'error');
      }
        */

    }

    if (name === 'quantity' && (isNaN(value) || value === '')) {
      setFormData((prevState) => ({
        ...prevState,
        productsInventory: productsInventory.map((p) =>
          p.code === product.code ? { ...p, quantity: 1 } : p
        )
      }));
    }
  };

  const handleResultClick = (product) => {
    console.log('Producto seleccionado:', product);
    // Aquí puedes agregar la lógica para manejar la selección del producto
    // Por ejemplo, actualizar el estado con el producto seleccionado


    const productFound = productsInventory.find((p) => p.code === product.code);
    console.log('productFound ..:', productFound);

    if (productFound) {

      console.log('productsInventory ..:', productsInventory);

      setFormData((prevState) => ({
        ...prevState,
        productsInventory: productsInventory.map((p) => {
          console.log('ppppp ..:', p);
          console.log('product ppp ..:', product);
          return p.code === product.code ? { ...p, quantity: p.quantity + 1 } : p

        }
        )
      }));

    } else {

      setFormData((prevState) => ({
        ...prevState,
        productsInventory: [...prevState.productsInventory, {
          id: product.id, // id , ya que se formateo previamante en el useEffect.
          code: product.code,
          description: product.description,
          quantity: 1,
          cost: product.price,
          price: product.price,
          originalPrice: product.price,
        }]
      }));

    }

    setSearchResults([]);
    setShowResults(false);
    setProductSearch('');
    refInputDescBusqueda.current.focus();
  };

  if (isLoading) {
    return <Spinner />
  }

  return (

    <div className="container-list-large">
      <br></br>
      <section>
        <h1>
          <MdOutlineInventory /> Registrar productos al inventario
        </h1>
      </section>

      <section className="form-list">

        <div className="form-group">
          <table style={{ width: '80%' }}>
            <tbody>
              <tr>
                <td>
                  <label htmlFor="name">Tipo de movimiento..:</label>
                </td>
                <td>

                  <select
                    name="transactionType"
                    id="transactionType"
                    value={transactionType}
                    onChange={onChange}
                    className='form-control'>

                    <option value="ENTRADA">ENTRADA</option>
                    <option value="SALIDA">SALIDA</option>

                  </select>


                </td>
                <td>
                  <label htmlFor="name"> &emsp; &emsp; </label>
                </td>
                <td>
                  <label htmlFor="name">Documento de referencia..:</label>
                </td>
                <td>
                  <input
                    type='text'
                    className='form-control'
                    id='referenceDocument'
                    name='referenceDocument'
                    value={referenceDocument}
                    onChange={onChange}
                    required />

                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="name">Motivo de movimiento..:</label>
                </td>
                <td>

                  <select
                    name="reasonTransaction"
                    id="reasonTransaction"
                    value={reasonTransaction}
                    onChange={onChange}
                    className='form-control'>

                    {
                      reasons.map((reason) => {
                        return <option key={reason._id} id={reason._id} value={reason.name}>{reason.name}</option>
                      })
                    }

                  </select>

                </td>
                <td>
                  <label htmlFor="name"> &emsp; &emsp; </label>
                </td>
                <td>
                  <label htmlFor="name">Proveedor..:</label>
                </td>
                <td>
                  <input
                    type='text'
                    className='form-control'
                    id='supplier'
                    name='supplier'
                    value={supplier}
                    onChange={onChange}
                    required />

                </td>
              </tr>
              <tr>
                <td colSpan="5">
                  <hr></hr>
                </td>
              </tr>

              <tr>
                <td colSpan="2">
                  <div className="search-container">
                    <input
                      type='text'
                      className='form-control'
                      id='productSearch'
                      name='productSearch'
                      value={productSearch}
                      onChange={onChangeSearch}
                      onKeyDown={onKeyDownSearch}
                      onFocus={() => {
                        console.log('searchResults ...', searchResults);
                        if (searchResults.length > 0) {
                          console.log('on focus ...', showResults);
                          setShowResults(true)
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowResults(false), 200)}
                      placeholder='Busqueda de productos...'
                      ref={refInputDescBusqueda}
                      required />

                    {showResults && (
                      <div className="search-results">

                        {searchResults.length > 0 ? (
                          searchResults.map((product, index) => (
                            <div
                              key={index}
                              className="search-result-item"
                              onClick={() => handleResultClick(product)}
                            >
                              {product.code} | {product.description} | {product.measure}
                            </div>
                          ))
                        ) : (
                          <div className="search-result-item">No se encontraron resultados</div>
                        )}

                      </div>
                    )}

                  </div>
                </td>
                <td>
                  <label htmlFor="name"> &emsp; &emsp; </label>
                </td>
                <td>
                  <button className='btn' onClick={guardar} ><FaRegSave /> Guardar </button>
                </td>
                <td>
                  <button className='btn' onClick={reiniciar} ><MdRestartAlt /> Reiniciar </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="listas-headings-dynamics" key="0">
            <div>Código</div>
            <div>Descripción</div>
            <div>Cantidad</div>
            <div>Costo</div>
            <div>Precio</div>
            <div>Costo Total</div>
            <div>Eliminar</div>
          </div>

          <div className="productos-inventario">

            {productsInventory.map((product, index) => (
              <div className="listas-dynamics" key={index}>
                <div>{product.code}</div>
                <div>{product.description}</div>
                <div className='list-group'>
                  <button onClick={() => handlePlusClick(product)} style={{ border: 'none', background: 'none' }} >
                    <FaPlusCircle color="blue" />
                  </button>

                  <input
                    type='text'
                    className='form-control'
                    id='quantity'
                    name='quantity'
                    value={product.quantity}
                    onChange={(event) => onChangeQuantity(event, product)}
                    onBlur={(event) => handleEventBlur(event, product)}
                    required />

                  <button onClick={() => handleMinusClick(product)} style={{ border: 'none', background: 'none' }}>
                    <FaMinusCircle color="red" />
                  </button>
                </div>
                <div className='list-group'>
                  S/.
                  <input
                    type='text'
                    className='form-control'
                    id='cost'
                    name='cost'
                    value={product.cost}
                    onChange={(event) => onChangeQuantity(event, product)}
                    onBlur={(event) => handleEventBlur(event, product)}
                    required />
                </div>
                <div className='list-group'>
                  S/.
                  <input
                    type='text'
                    className='form-control'
                    id='price'
                    name='price'
                    value={product.price}
                    onChange={(event) => onChangeQuantity(event, product)}
                    onBlur={(event) => handleEventBlur(event, product)}
                    required />
                </div>
                <div>S/. {product.quantity * product.cost}</div>
                <div>
                  <button onClick={() => handleDeleteClick(product)} style={{ border: 'none', background: 'none' }}>
                    <MdDelete color="black" />
                  </button>
                </div>
              </div>
            ))}



          </div>
        </div>

      </section>

    </div>

  );
};

export default Inventory;