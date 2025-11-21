import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { FaUser } from "react-icons/fa";
import { TbNewSection } from "react-icons/tb";
import { AiTwotoneEdit } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import ReactPaginate from 'react-paginate'; // pagination library
import {
  createCategory, updateCategory, getCategories,
  reset, setCategory, resetCategory
} from "../features/categories/categorySlice";

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
  prefix: ''
}

function Category() {

  // ini pagination states
  const [offset, setOffset] = useState(0);
  const [categoriesPage, setCategoriesPage] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);
  //fin pagination states

  //state para establecer el texto de busqueda.
  const [categorySearch, setCategorySearch] = useState('');

  //state para abrir o cerrar el modal.
  const [modalIsOpen, setModalIsOpen] = useState(false);

  console.log('initialState ..:', initialState);
  const [formData, setFormData] = useState(initialState);

  const { name, description, prefix } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { category, categories, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.category
  );

  console.log('categories ..:', categories);

  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, category, message);
    if (isError) {
      Message(message, 'error');
      dispatch(reset());
    }

    if (isSuccess) {
      closeModal();
      dispatch(getCategories());
      if (category._id) {
        Message('Categoria actualizada exitosamente!');
      } else {
        Message('Categoria creada exitosamente!');
      }
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  // useEffect usado para cargar la data al inicio. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 2 ...');
    dispatch(getCategories());
  }, []);

  // useEffect to handle items by page.
  useEffect(() => {
    console.log('useEffect categories ...', categories);
    setCategoriesPage(categories.slice(offset * perPage,
      (offset + 1) * perPage));
    setPageCount(Math.ceil(categories.length / perPage));
  }, [categories]);

  // use effect to handle pagination
  useEffect(() => {
    console.log('use effect offset ');
    setCategoriesPage(categories.slice(offset * perPage,
      (offset + 1) * perPage));
  }, [offset]);

  //useEffect to show data on popup.
  useEffect(() => {
    console.log('useEffect 3 ...', category);
    //if (user._id) {
    setFormData({
      name: category.name,
      description: category.description,
      prefix: category.prefix
    });
    //}
  }, [category]);

  const onChange = (e) => {

    console.log('onChange ..:', e);
    const { name, value } = e.target;

    if (name === 'prefix' && (isNaN(value) || value.includes('.') || value.includes(' '))) {
      return;
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: name === 'name' ? value.toUpperCase() : value
    }));
  };

  const onChangeSearch = (e) => {
    setCategorySearch(e.target.value);
  };

  const onKeyDownSearch = (e) => {
    console.log('onKeyDownSearch ..:', e);
    if (e.key === 'Enter') {
      console.log('get category ..:');
      dispatch(getCategories({ name: e.target.value }));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (category._id) {
      dispatch(updateCategory({
        id: category._id,
        description
      }));
    } else {
      dispatch(createCategory({
        name,
        description,
        prefix
      }));
    }

  };

  const onEditar = (idCategory) => {
    const category = categories.find((category) => category._id == idCategory);
    if (category) {
      dispatch(setCategory(category));
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
    dispatch(resetCategory());
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
          <FaUser /> Categorias
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
                    id='categorySearch'
                    name='categorySearch'
                    value={categorySearch}
                    onChange={onChangeSearch}
                    onKeyDown={onKeyDownSearch}
                    placeholder='Busqueda de categorias...'
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

        {categories.length > 0 && <div>

          <div className="listas-headings" key="0">
            <div>Nombre</div>
            <div>Descripción</div>
            <div>Prefijo</div>
            <div>Editar</div>
          </div>

          {categoriesPage.map(category => (
            <div className="listas" key={category._id}>
              <div>{category.name}</div>
              <div>{category.description}</div>
              <div> {category.prefix}</div>
              <div>

                <button onClick={() => onEditar(category._id)} 
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


        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel='Nueva Categoria'>
          <h3>{category._id ? 'Actualizar Categoría' : 'Nueva Categoría'}</h3>
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
                          required
                          disabled={!!category._id} />

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
                          placeholder='Ingrese descripción' />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="name">Prefijo ..:</label>
                      </td>
                      <td>
                        <input
                          className='form-control'
                          id='prefix'
                          name='prefix'
                          value={prefix}
                          onChange={onChange}
                          placeholder='Ingrese prefijo'
                          required
                          disabled={!!category._id} />

                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="form-group">
                <button className="btn btn-block">{category._id ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </section>

        </Modal>

      </section>
    </div>
  );
}

export default Category;