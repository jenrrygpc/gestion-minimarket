/* React */
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

/* React Redux */
import { useSelector, useDispatch } from "react-redux";

/* pagination library */
import ReactPaginate from 'react-paginate';

/* react-icons */
import { FaUser } from "react-icons/fa";
import { TbNewSection } from "react-icons/tb";
import { AiTwotoneEdit } from "react-icons/ai";

/* feature stores */
import {
  createProduct, updateProduct,
  getProduct, reset, setProduct,
  resetProduct
} from "../features/products/productSlice";
import { getMeasures } from "../features/measures/measureSlice";
import { getMastersByTypes } from "../features/masters/masterSlice";
import { registerInventory } from "../features/inventories/inventorySlice";
import { getCategories } from "../features/categories/categorySlice";

/* components */
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
  code: '',
  description: '',
  measure: '',
  price: 0,
  cost: 0,
  averageCost: 0, // Agregar para mostrar cuando se edita
  stock: 0,
  minimumStock: 0,
  display: '',
  category: '',
  taxFree: false,
  discount: 0,
  requiresParameter: false,
}

function Product() {

  // ini pagination states
  const [offset, setOffset] = useState(0);
  const [productsPage, setProductsPage] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);
  //fin pagination states

  //state para establecer el texto de busqueda.
  const [productSearch, setProductSearch] = useState('');

  //state para abrir o cerrar el modal.
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const { measures } = useSelector(
    (state) => state.measure
  );
  initialState.measure = (measures[0] || {}).abbreviation;

  const { categories } = useSelector(
    (state) => state.category
  );

  initialState.category = (categories[0] || {}).name;

  const { masters } = useSelector(
    (state) => state.master
  );
  initialState.display = (masters.filter(({ type }) => type === 'PRESENTACION')[0] || {}).name;
  //initialState.category = (masters.filter(({ type }) => type === 'CATEGORIA')[0] || {}).name;

  console.log('measures 2 ...', measures);
  console.log('masters 2 ...', masters);

  const [formData, setFormData] = useState(initialState);

  const { code, description, measure,
    display, price, cost, averageCost, stock,
    category, minimumStock, taxFree,
    discount, requiresParameter
  } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log('formData 2 ...', formData);

  const {
    product, products, isLoading,
    isError, isSuccess, message, newProductId
  } = useSelector(
    (state) => state.product
  );

  console.log('products 2 ...', products);
  console.log('product 2 ...', product);


  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, product, message);
    console.log('useEffect 1 newProductId...', newProductId);
    if (isError) {
      Message(message, 'error');
      dispatch(reset());
    }

    if (isSuccess) {
      closeModal();
      dispatch(getProduct());
      if (product._id) {
        Message('Producto actualizado exitosamente!');
      } else {
        Message('Producto creado exitosamente!');
        // registrar el stock en inventario si es un nuevo producto.
        /*
        if (stock > 0) {
          dispatch(registerInventory({
            //product: newProductId, quantity: stock,
            transactionType: 'ENTRADA',
            reason: 'Inventario inicial',
            products: [
              {
                productId: newProductId,
                quantity: stock,
                price,
                //cost
              }
            ]
          }));
        }
        */
      }

    }
  }, [isError, isSuccess, message, navigate, dispatch]);


  // useEffect usado para cargar la data al inicio. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 2 ...');
    dispatch(getProduct());
    dispatch(getMeasures());
    dispatch(getMastersByTypes(['PRESENTACION']));
    dispatch(getCategories());
  }, []);

  // useEffect to handle items by page.
  useEffect(() => {
    console.log('useEffect products ...', products);
    setProductsPage(products.slice(offset * perPage,
      (offset + 1) * perPage));
    setPageCount(Math.ceil(products.length / perPage));
  }, [products]);

  // use effect to handle pagination
  useEffect(() => {
    console.log('use effect offset ');
    setProductsPage(products.slice(offset * perPage,
      (offset + 1) * perPage));
  }, [offset]);

  //useEffect to show data on popup.

  useEffect(() => {
    console.log('useEffect 3 ...', product);
    if (product._id) {

      setFormData({
        code: product.code,
        description: product.description,
        measure: product.measure,
        display: product.display,
        price: product.price,
        cost: product.cost,
        averageCost: product.averageCost || 0, // Agregar averageCost al cargar producto existente
        stock: product.stock,
        category: product.category,
        minimumStock: product.minimumStock,
        taxFree: product.taxFree,
        discount: product.discount,
        requiresParameter: product.requiresParameter
      });
    }
  }, [product]);


  // manejar el evento de paginacion.
  const handlePageClick = (e) => {
    console.log('e.selected ..:', e);
    const selectedPage = e.selected;
    console.log('selectedPage ..:', selectedPage);
    setOffset(selectedPage)
  };


  const onChange = (e) => {
    const { name, value } = e.target;
    console.log('onChange ...:', name, value);
    if (name === 'code') {
      if (isNaN(value) || value.includes('.') || value.includes(' ')) {
        return;
      }
    }
    if (name === 'price' || name === 'cost' || name === 'stock' || name === 'minimumStock') {
      if (isNaN(value) || value.includes(' ')) {
        return;
      }
    }

    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onChangeSearch = (e) => {
    setProductSearch(e.target.value);
  };

  const onKeyDownSearch = (e) => {
    console.log('onKeyDownSearch ..:', e);
    const { value = '' } = e.target;
    if (e.key === 'Enter') {
      console.log('get product ..:');
      if (!isNaN(value.trim()) && value.trim() !== '') {
        dispatch(getProduct({ code: Number(value) }));
      } else {
        dispatch(getProduct({ description: value }));
      }


    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // NOT IMPLEMENTED YET
    console.log('product ..:', product)

    if (product._id) {
      dispatch(updateProduct({
        id: product._id,
        //code,
        measure,
        description,
        display,
        //category,
        price,
        cost,
        taxFree,
        discount,
        requiresParameter,
        //stock,        
        minimumStock,

      }));
    } else {
      dispatch(createProduct({
        code,
        measure,
        description,
        display,
        category,        
        taxFree,
        discount,
        requiresParameter,
        price,
        cost,
        stock,
        minimumStock,
      }));
    }

  };

  const onEditar = (idProduct) => {
    const product = products.find((product) => product._id == idProduct);
    if (product) {
      dispatch(setProduct(product));
      openModal();
    }
  };

  // Open/Close modal
  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    console.log('closeModal ...');
    setModalIsOpen(false);
    setFormData(initialState);
    // validar si se deberia limpiar todo el initialState
    dispatch(reset());
    dispatch(resetProduct());
  };


  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="container-list-large">
      <br></br>
      <section>
        <h1>
          <FaUser /> Productos
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
                    id='productSearch'
                    name='productSearch'
                    value={productSearch}
                    onChange={onChangeSearch}
                    onKeyDown={onKeyDownSearch}
                    placeholder='Busqueda de productos...'
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

        {products.length > 0 && <div>

          <div className="listas-headings-dynamics" key="0">
            <div>Código</div>
            <div>Descripción</div>
            <div>Medida Venta</div>
            <div>Precio</div>
            <div>Costo Promedio</div>
            <div>Stock</div>
            <div>Presentación</div>
            <div>Editar</div>
          </div>

          {productsPage.map(product => (
            <div className="listas-dynamics" key={product._id}>
              <div>{product.code}</div>
              <div>{product.description}</div>
              <div> {product.measure}</div>
              <div> {product.price}</div>
              <div> {product.averageCost}</div>
              <div> {product.stock}</div>
              <div> {product.display}</div>
              <div>

                <button onClick={() => onEditar(product._id)} style={{ border: 'none', background: 'none' }}>
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
          <h3> {product._id ? 'Actualizar Producto' : 'Nuevo Producto'}</h3>
          <hr></hr>

          <button className='btn-close' onClick={closeModal}>
            X
          </button>
          <br></br>

          <section className="form">
            <form onSubmit={onSubmit}>
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
                        onChange={onChange}
                        placeholder='Ingrese código de producto' />

                    </td>
                  </tr>

                  <tr>
                    <td>
                      <label htmlFor="name">Descripción ..:</label>
                    </td>
                    <td>
                      <input
                        type='text'
                        className='form-control'
                        id='description'
                        name='description'
                        value={description}
                        onChange={onChange}
                        placeholder='Ingresar descripción del producto'
                        required />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <label htmlFor="name">Precio ..:</label>
                    </td>
                    <td>
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
                      <label htmlFor="name">Costo {product._id ? '(solo lectura)' : '..:'}</label>
                    </td>
                    <td>
                      <input
                        type='text'
                        className='form-control'
                        id='cost'
                        name='cost'
                        value={cost}
                        onChange={onChange}
                        placeholder='Ingresar costo del producto'
                        disabled={!!product._id}
                      />

                    </td>
                  </tr>

                  {/* Mostrar costo promedio solo cuando se edita */}
                  {product._id && (
                    <tr>
                      <td>
                        <label htmlFor="averageCost">Costo Promedio (solo lectura) ..:</label>
                      </td>
                      <td>
                        <input
                          type='text'
                          className='form-control'
                          id='averageCost'
                          name='averageCost'
                          value={averageCost}
                          placeholder='Costo promedio calculado'
                          disabled
                          style={{ backgroundColor: '#f0f0f0' }}
                        />
                      </td>
                    </tr>
                  )}


                  <tr>
                    <td>
                      <label htmlFor="name">Medida de venta ..:</label>
                    </td>
                    <td>

                      <select
                        name="measure"
                        id="measure"
                        value={measure}
                        onChange={onChange}
                        className='form-control'>
                        {
                          measures.map((measure) => {
                            return <option key={measure._id} id={measure._id} value={measure.abbreviation}>{measure.description}</option>
                          })
                        }
                      </select>

                    </td>
                  </tr>

                  <tr>
                    <td>
                      <label htmlFor="name">Presentación ..:</label>
                    </td>
                    <td>

                      <select
                        name="display"
                        id="display"
                        value={display}
                        onChange={onChange}
                        className='form-control'>
                        {
                          masters
                            .filter(({ type }) => type === 'PRESENTACION')
                            .map((master) => {
                              return <option key={master._id} id={master._id} value={master.name}>{master.name}</option>
                            })
                        }
                      </select>

                    </td>
                  </tr>

                  <tr>
                    <td>
                      <label htmlFor="name">Categoría ..:</label>
                    </td>
                    <td>

                      <select
                        name="category"
                        id="category"
                        value={category}
                        onChange={onChange}
                        className='form-control'
                        disabled={!!product._id} >

                        {
                          categories.map((category) => {
                            return <option key={category._id} id={category._id} value={category.name}>{category.name}</option>
                          })
                        }
                      </select>

                    </td>
                  </tr>

                  {/* Línea separadora */}
                  <tr>
                    <td colSpan={2}><hr /></td>
                  </tr>

                  {/* Mensaje informativo solo en modo edición */}
                  {product._id && (
                    <tr>
                      <td colSpan={2}>
                        <div style={{ 
                          padding: '10px', 
                          backgroundColor: '#fff3cd', 
                          border: '1px solid #ffc107',
                          borderRadius: '4px',
                          fontSize: '0.9em',
                          marginBottom: '10px'
                        }}>
                          <strong>Nota:</strong> El stock y costo promedio se actualizan automáticamente mediante movimientos de inventario.
                        </div>
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td>
                      <label htmlFor="name">Stock {product._id ? '(solo lectura)' : '..:'}</label>
                    </td>
                    <td>
                      <input
                        type='text'
                        className='form-control'
                        id='stock'
                        name='stock'
                        value={stock}
                        onChange={onChange}
                        placeholder='Ingresar stock del producto'
                        required
                        disabled={!!product._id} />

                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="name">Stock mínimo ..:</label>
                    </td>
                    <td>
                      <input
                        type='text'
                        className='form-control'
                        id='minimumStock'
                        name='minimumStock'
                        value={minimumStock}
                        onChange={onChange}
                        placeholder='Ingresar stock minimo del producto'
                        required />

                    </td>
                  </tr>

                </table>
              </div>
              <div className="form-group">
                <button className="btn btn-block">{product._id ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </section>

        </Modal>

      </section>
    </div>
  );

}

export default Product;