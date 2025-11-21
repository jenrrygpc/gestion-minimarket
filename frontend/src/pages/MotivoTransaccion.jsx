import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaUser } from "react-icons/fa";
import { TbNewSection } from "react-icons/tb";
import { AiTwotoneEdit } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import ReactPaginate from 'react-paginate'; // pagination library

import {
  createReasonTransaction,
  getReasonsTransaction,
  updateReasonTransaction,
  reset,
  setReason,
  resetReason
} from "../features/reasons-transaction/reasonTransactionSlice";

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
  name: '',
  description: '',
  transactionType: 'ENTRADA',
  affectsCost: false,
  requiresDocument: false,
  enabled: true
}

function ReasonTransaction() {

  // ini pagination states
  const [offset, setOffset] = useState(0);
  const [reasonsPage, setReasonsPage] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);
  //fin pagination states

  //state para establecer el texto de busqueda.
  const [reasonSearch, setReasonSearch] = useState('');

  //const profile = '';
  //state para abrir o cerrar el modal.
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [formData, setFormData] = useState(initialState);

  console.log('formData ..:', formData);

  const { code, name, description,
    transactionType, affectsCost,
    requiresDocument, enabled } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { reason, reasons, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.reasonTransaction
  );
  // useEffect para manejar errores y exito en las operaciones.
  useEffect(() => {
    console.log('useEffect 1 ...', isError, isSuccess, reason, message);
    if (isError) {
      Message(message, 'error');
      dispatch(reset());
    }

    if (isSuccess) {
      closeModal();
      dispatch(getReasonsTransaction());
      if (reason._id) {
        Message('Motivo Transacción actualizado exitosamente!');
      } else {
        Message('Motivo Transacción creado exitosamente!');
      }

    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  // useEffect to get reasons transaction.
  useEffect(() => {
    dispatch(getReasonsTransaction());
  }, []);

  // useEffect to handle items by page.
  useEffect(() => {
    console.log('useEffect reasons ...', reasons);
    setReasonsPage(reasons.slice(offset * perPage,
      (offset + 1) * perPage));
    setPageCount(Math.ceil(reasons.length / perPage));
  }, [reasons]);

  // use effect to handle pagination
  useEffect(() => {
    console.log('use effect offset ');
    setReasonsPage(reasons.slice(offset * perPage,
      (offset + 1) * perPage));
  }, [offset]);

  //useEffect to show data on popup.
  useEffect(() => {
    console.log('useEffect 3 ...', reason);
    if (reason && reason._id) {
    setFormData({
      code: reason.code,
      name: reason.name,
      description: reason.description,
      transactionType: reason.transactionType,
      affectsCost: reason.affectsCost,
      requiresDocument: reason.requiresDocument,
      enabled: reason.enabled
    });
  }
  }, [reason]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'code') {
      // Solo permitir alfanuméricos en mayúsculas, sin espacios
      const cleanValue = value.replace(/[^A-Za-z0-9_]/g, '').toUpperCase();
      setFormData((prevState) => ({
        ...prevState,
        code: cleanValue
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const onChangeSearch = (e) => {
    setReasonSearch(e.target.value);
  };

  const onKeyDownSearch = (e) => {
    console.log('onKeyDownSearch ..:', e);
    if (e.key === 'Enter') {
      console.log('get reason ..:');
      dispatch(getReasonsTransaction({ name: e.target.value }));
    }
  };

  const onChangeCheck = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    console.log('onSubmit ..:', code, name, description,
      transactionType, affectsCost,
      requiresDocument);

    if (reason._id) {
      dispatch(updateReasonTransaction({
        id: reason._id,
        code,
        name,
        description,
        transactionType,
        affectsCost,
        requiresDocument,
      }));
    } else {
      dispatch(createReasonTransaction({
        code,
        name,
        description,
        transactionType,
        affectsCost,
        requiresDocument
      }));
    }
  };

  const onEditar = (idReason) => {
    const reason = reasons.find((reason) => reason._id == idReason);
    if (reason) {
      dispatch(setReason(reason));
      openModal();
    }
  };

  // Open/Close modal
  const openModal = () => {

    console.log('openModal ..:', transactionType);

    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFormData(initialState);
    // validar si se deberia limpiar todo el initialState
    dispatch(reset());
    dispatch(resetReason());
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
          <FaUser /> Motivos de Transacción
        </h1>
      </section>

      <section className="form-list">

        <table style={{ width: '100%' }}>
          <tr>
            <td>

              <div className="form-group3">
                <input
                  type='text'
                  className='form-control'
                  id='reasonSearch'
                  name='reasonSearch'
                  value={reasonSearch}
                  onChange={onChangeSearch}
                  onKeyDown={onKeyDownSearch}
                  placeholder='Busqueda de motivos de transacción...'
                  //ref={refInputDescBusqueda}
                  required />
              </div>

            </td>
            <td className="td-v-align-top" >

              <button className='btn' onClick={openModal} ><TbNewSection /> Nuevo </button>

            </td>
          </tr>
        </table>

        {reasons.length > 0 && <div>

          <div className="listas-motivos-headings" key="0">
            <div>Código</div>
            <div>Nombre</div>
            <div>Descripción</div>
            <div>Tipo Tx</div>
            <div>Recal costo?</div>
            <div>Documento?</div>
            <div>Editar</div>
          </div>

          {reasonsPage.map(reason => (
            <div className="listas-motivos" key={reason._id}>
              <div>{reason.code}</div>
              <div>{reason.name}</div>
              <div>{reason.description}</div>
              <div>{reason.transactionType}</div>
              <div>{reason.affectsCost ? 'Sí' : 'No'}</div>
              <div>{reason.requiresDocument ? 'Sí' : 'No'}</div>
              <div>


                <button onClick={() => onEditar(reason._id)}
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


        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel='Nuevo Motivo'>
          <h3>Nuevo Motivo</h3>
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
                        <label htmlFor="code">Código ..:</label>
                      </td>
                      <td>

                        <input
                          type='text'
                          className='form-control'
                          id='code'
                          name='code'
                          value={code}
                          onChange={onChange}
                          placeholder='Ingrese código'
                          required
                          autoComplete='off'
                          maxLength={20}
                          style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                          pattern='[A-Z0-9_]+'
                        />

                      </td>
                    </tr>

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
                        <label htmlFor="description">Descripción ..:</label>
                      </td>
                      <td>
                        <input
                          type='text'
                          className='form-control'
                          id='description'
                          name='description'
                          value={description}
                          onChange={onChange}
                          placeholder='Ingrese descripción'
                          required />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="transactionType">Tipo transacción ..:</label>
                      </td>
                      <td>

                        <select
                          name="transactionType"
                          id="transactionType"
                          value={transactionType}
                          onChange={onChange}
                          className='form-control'
                          defaultValue="ENTRADA"
                        >

                          <option value="ENTRADA">ENTRADA</option>
                          <option value="SALIDA">SALIDA</option>
                          <option value="AMBOS">AMBOS</option>

                        </select>

                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="affectsCost">Recalcular Costo ..:</label>
                      </td>
                      <td>

                        <input
                          type='checkbox'
                          id='affectsCost'
                          name='affectsCost'
                          checked={affectsCost}
                          onChange={onChangeCheck} />

                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="requiresDocument">Requiere documento ..:</label>
                      </td>
                      <td>

                        <input
                          type='checkbox'
                          id='requiresDocument'
                          name='requiresDocument'
                          checked={requiresDocument}
                          onChange={onChangeCheck} />

                      </td>
                    </tr>


                  </tbody>
                </table>
              </div>
              <div className="form-group">
                <button className="btn btn-block">{reason._id ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </section>

        </Modal>

      </section>
    </div>
  );
}

export default ReasonTransaction;