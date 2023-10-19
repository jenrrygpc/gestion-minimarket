import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt } from "react-icons/fa";
import { AiOutlineEdit, AiTwotoneEdit } from "react-icons/ai";
import ReactPaginate from 'react-paginate';

import { useSelector, useDispatch } from "react-redux";
import {
  reset, getMasters, setMaster,
  createMaster, updateMaster,
  resetCreate
} from "../features/masters/masterSlice";
import Spinner from '../components/Spinner';


const initialState = {
  name: '',
  description: '',
  enabled: true
}


function Category() {

  // ini pagination states
  const [offset, setOffset] = useState(0);
  const [mastersPage, setMastersPage] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);
  //fin pagination states
  console.log('offset ...', offset);
  console.log('mastersPage ...', mastersPage);
  console.log('perPage ...', perPage);
  console.log('pageCount ...', pageCount);

  const [formData, setFormData] = useState(initialState);

  //useRef is to focus into the component.
  const refInputName = useRef(null);

  const { name, description, enabled } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    master, masters, isError,
    isSuccess, isLoading, message
  } = useSelector(
    (state) => state.master
  );

  console.log('masters ...', masters);

  useEffect(() => {
    console.log('useEffect inicial ...');
    dispatch(getMasters({
      type: 'CATEGORIAS'
    }));
    refInputName.current.focus();
  }, []);

  useEffect(() => {
    console.log('useEffect masters ...', masters);
    setMastersPage(masters.slice(offset * perPage,
      (offset + 1) * perPage));
    setPageCount(Math.ceil(masters.length / perPage));
  }, [masters]);

  useEffect(() => {
    console.log('useEffect master ...', master);
    if (master._id) {
      setFormData({
        ...master
      });
    }
  }, [master]);


  // useEffect usado para manejar el registro o actualizacion del producto
  useEffect(() => {
    console.log('useEffect 3 ...', isError, isSuccess, message);
    if (isError) {
      refInputName.current.focus();
      toast.error(message);
    }
    // Redirect to the same page
    if (isSuccess) {
      dispatch(resetCreate());
      setFormData(initialState);


      dispatch(getMasters({
        type: 'CATEGORIAS'
      }));


      if (master._id) {
        toast.success('Categoría Actualizada');
      } else {
        toast.success('Categoría Registrada');
      }

      refInputName.current.focus();

    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  useEffect(() => {
    console.log('use effect offset ');
    setMastersPage(masters.slice(offset * perPage,
      (offset + 1) * perPage));
  }, [offset]);


  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onChangeCheck = (e) => {
    console.log('e ..:', e);
    setFormData({
      ...formData,
      enabled: !enabled
    });
  };

  const onSave = (e) => {
    console.log('on submit');
    if (validate()) {
      console.log('grabar informacion ..:');
      if (master._id) {
        console.log('Actualizar producto ...');
        dispatch(updateMaster({
          id: master._id,
          name,
          description,
          enabled
        }));
      } else {
        dispatch(createMaster({
          type: 'CATEGORIAS',
          name,
          description,
          enabled
        }));
      }

    };
    refInputName.current.focus();
  };

  const onSearch = (e) => {
    console.log('on search');
    console.log('event ..:', e);
  };

  const onClean = (e) => {
    console.log('on clean');
    console.log('event ..:', e);
    setFormData(initialState);
    dispatch(setMaster({}));
    refInputName.current.focus();

  };

  const onEditar = (e) => {
    console.log('onEditar  ...', e.target.id);
    const master = masters.find((master) => master._id == e.target.id);
    console.log('onEditar master ...', master);
    dispatch(setMaster(master));
    refInputName.current.focus();
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

  const validate = () => {
    if (!name && name.length < 4) {
      toast.info('Ingresar nombre completo');
      return false;
    }
    return true;
  };

  return (
    <div className="container">
      <section className="heading">
        <p>
          Mantenimiento de Categoría
        </p>
      </section>
      <div className="maestro">
        <div className="form-group">

          <table style={{ width: '100%' }}>
            <tr>
              <td>
                <label htmlFor="name">NOMBRE ..:</label>
              </td>
              <td>
                <input
                  type='text'
                  className='form-control'
                  id='name'
                  name='name'
                  value={name}
                  onChange={onChange}
                  placeholder='Ingresar nombre'
                  ref={refInputName}
                  required />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="name">DESCRIPCIÓN ..:</label>
              </td>
              <td colSpan="2">
                <textarea
                  type='text'
                  className='form-control'
                  id='description'
                  name='description'
                  value={description}
                  onChange={onChange}
                  placeholder='Ingresar descripción' />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="name">ACTIVO ..:</label>
              </td>
              <td colSpan="2">
                <input
                  type='checkbox'
                  id='enabled'
                  name='enabled'
                  onChange={onChangeCheck}
                  checked={enabled}
                  placeholder='Requiere estado' />
              </td>
            </tr>
          </table>
          <div className="form-group2">
            <button className="btn btn-block" onClick={onSave} >{master._id ? 'Actualizar' : 'Guardar'}</button>
            {
              /*
              <button className="btn btn-block" onClick={onSearch}>Buscar</button>
              */
            }

            <button className="btn btn-block" onClick={onClean} >Limpiar</button>
          </div>

        </div>

        <div>
          <div className="grilla-maestro-cabecera">

            <div>NOMBRE</div>
            <div>ESTADO</div>
            <div><AiTwotoneEdit /> Editar</div>
          </div>

          {mastersPage.map(master => (
            <div className="grilla-maestro" key={master._id}>
              <div>{master.name}</div>
              <div>{master.enabled ? 'Activo' : 'Inactivo'}</div>
              <button className="btn2" id={master._id} onClick={onEditar} />

            </div>
          ))}

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

        </div>


      </div>

    </div>
  );
}

export default Category;