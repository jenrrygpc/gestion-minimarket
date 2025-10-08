import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaUser } from "react-icons/fa";
import { TbNewSection } from "react-icons/tb";
import { AiTwotoneEdit } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import ReactPaginate from 'react-paginate'; // pagination library
import {
  createCustomer, updateCustomer, getCustomers,
  reset, setCustomer, resetCustomer
} from "../features/customers/customerSlice";

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
  documentNumber: '',
  names: '',
  email: '',
  address: '',
  cellphone: ''
};

function Customer() {

  // ini pagination states
  const [offset, setOffset] = useState(0);
  const [customersPage, setCustomersPage] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);
  //fin pagination states

  //state para establecer el texto de busqueda.
  const [customerSearch, setCustomerSearch] = useState('');

  //state para abrir o cerrar el modal.
  const [modalIsOpen, setModalIsOpen] = useState(false);

  console.log('initialState ..:', initialState);
  const [formData, setFormData] = useState(initialState);

  const { documentNumber, names, email, address, cellphone } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { customer, customers, isLoading, isError, isSuccess, isSuccessGet, message } = useSelector(
    (state) => state.customer
  );

  console.log('customers ..:', customers);

  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, customer, message);
    if (isError) {
      Message('Cliente no actualizado exitosamente!', 'error');
      dispatch(reset());
    }

    if (isSuccess) {
      closeModal();
      dispatch(getCustomers());
      if (customer._id) {
        Message('Cliente actualizado exitosamente!');
      } else {
        Message('Cliente creado exitosamente!');
      }
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  // useEffect usado para cargar la data al inicio. (solo se ejecuta la primera vez)
  useEffect(() => {
    console.log('useEffect 2 ...');
    dispatch(getCustomers());
  }, []);

  // useEffect to handle items by page.
  useEffect(() => {
    console.log('useEffect customers ...', customers);
    setCustomersPage(customers.slice(offset * perPage,
      (offset + 1) * perPage));
    setPageCount(Math.ceil(customers.length / perPage));
  }, [customers]);

  // use effect to handle pagination
  useEffect(() => {
    console.log('use effect offset ');
    setCustomersPage(customers.slice(offset * perPage,
      (offset + 1) * perPage));
  }, [offset]);

  //useEffect to show data on popup.
  useEffect(() => {
    console.log('useEffect 3 ...', customer);
    //if (user._id) {
    setFormData({
      documentNumber: customer.documentNumber,
      names: customer.names,
      email: customer.email,
      address: customer.address,
      cellphone: customer.cellphone
    });
    //}
  }, [customer]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onChangeSearch = (e) => {
    setCustomerSearch(e.target.value);
  };

  const onKeyDownSearch = (e) => {
    console.log('onKeyDownSearch ..:', e);
    if (e.key === 'Enter') {
      console.log('get customer ..:');
      dispatch(getCustomers({ names: e.target.value }));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (customer._id) {
      dispatch(updateCustomer({
        id: customer._id,
        documentNumber,
        names,
        email,
        address,
        cellphone
      }));
    } else {
      dispatch(createCustomer({
        documentNumber,
        names,
        email,
        address,
        cellphone
      }));
    }

  };

  const onEditar = (customer) => {
    /*
    console.log('onEditar  ...', e.target.id);
    const customer = customers.find((customer) => customer._id == e.target.id);
    console.log('onEditar customer ...', customer);
    */
    if (customer) {
      dispatch(setCustomer(customer));
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
    dispatch(resetCustomer());
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
          <FaUser /> Clientes
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
                    id='customerSearch'
                    name='customerSearch'
                    value={customerSearch}
                    onChange={onChangeSearch}
                    onKeyDown={onKeyDownSearch}
                    placeholder='Busqueda de clientes...'
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

        {customers.length > 0 && <div>

          <div className="listas-clientes-headings" key="0">
            <div>Documento</div>
            <div>Nombres</div>
            <div>Correo</div>
            <div>Dirección</div>
            <div>Celular</div>
            <div>Editar</div>
          </div>

          {customersPage.map(customer => (
            <div className="listas-clientes" key={customer._id}>
              <div>{customer.documentNumber}</div>
              <div>{customer.names}</div>
              <div>{customer.email}</div>
              <div>{customer.address}</div>
              <div>{customer.cellphone}</div>
              <div>
                <button onClick={() => onEditar(customer)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
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


        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel='Nuevo Cliente'>
          <h3>Nuevo Cliente</h3>
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
                        <label htmlFor="name">Documento ..:</label>
                      </td>
                      <td>

                        <input
                          type='text'
                          className='form-control'
                          id='documentNumber'
                          name='documentNumber'
                          value={documentNumber}
                          onChange={onChange}
                          placeholder='Ingrese documento'
                          required />

                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="name">Nombres completos ..:</label>
                      </td>
                      <td>
                        <input
                          type='text'
                          className='form-control'
                          id='names'
                          name='names'
                          value={names}
                          onChange={onChange}
                          placeholder='Ingrese nombres completos'
                          required />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="name">Correo ..:</label>
                      </td>
                      <td>
                        <input
                          type='text'
                          className='form-control'
                          id='email'
                          name='email'
                          value={email}
                          onChange={onChange}
                          placeholder='Ingrese correo'
                        />

                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="name">Dirección ..:</label>
                      </td>
                      <td>
                        <input
                          type='text'
                          className='form-control'
                          id='address'
                          name='address'
                          value={address}
                          onChange={onChange}
                          placeholder='Ingrese dirección'
                        />

                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="name">Celular ..:</label>
                      </td>
                      <td>
                        <input
                          type='text'
                          className='form-control'
                          id='cellphone'
                          name='cellphone'
                          value={cellphone}
                          onChange={onChange}
                          placeholder='Ingrese celular'
                        />

                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="form-group">
                <button className="btn btn-block">{customer._id ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </section>

        </Modal>

      </section>
    </div>
  );
}

export default Customer;