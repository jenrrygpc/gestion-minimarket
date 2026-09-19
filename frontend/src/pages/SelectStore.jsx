import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { FaStore } from "react-icons/fa";
import { getStores, reset as resetStoreState } from "../features/stores/storeSlice";
import { setStore, logout, reset as resetAuthState } from "../features/auth/authSlice";
import Spinner from '../components/Spinner';

import Modal from 'react-modal';

const customStyles = {
  content: {
    width: '500px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    position: 'relative'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  }
};

Modal.setAppElement('#root');

function SelectStore() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { stores, isLoading } = useSelector((state) => state.store);

  const [selectedStoreId, setSelectedStoreId] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(getStores());

    return () => {
      dispatch(resetStoreState());
    };
  }, []);

  // Si el usuario solo tiene una tienda asignada, se preselecciona automáticamente
  useEffect(() => {
    if (stores.length === 1) {
      setSelectedStoreId(stores[0]._id);
    }
  }, [stores]);

  const onConfirm = () => {
    const selectedStore = stores.find((s) => s._id === selectedStoreId);
    if (!selectedStore) {
      return;
    }
    dispatch(setStore(selectedStore));
    navigate('/');
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(resetAuthState());
    navigate('/login');
  };

  if (isLoading) {
    return <Spinner />
  }

  return (
    // Modal sin botón de cierre ni cierre por overlay/Esc: bloquea el acceso al menú hasta confirmar
    <Modal
      isOpen={true}
      onRequestClose={() => {}}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      style={customStyles}
      contentLabel='Seleccionar Tienda'>
      <h3><FaStore /> Seleccionar Tienda</h3>
      <hr></hr>
      <p>Elige la tienda con la que deseas trabajar</p>

      {stores.length === 0 && (
        <p className="empty-state">
          No tienes tiendas asignadas. Contacta a un administrador para que te asigne al menos una.
        </p>
      )}

      {stores.length > 0 && (
        <div className="checklist" style={{ gridTemplateColumns: '1fr', maxHeight: '300px' }}>
          {stores.map((s) => (
            <label className="checklist-item" key={s._id} style={{ padding: '4px 0' }}>
              <input
                type='radio'
                name='store'
                checked={selectedStoreId === s._id}
                onChange={() => setSelectedStoreId(s._id)} />
              <span>
                <strong>{s.name}</strong>
                {s.address && <span style={{ color: '#777' }}> — {s.address}</span>}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="modal-actions">
        {stores.length === 0 ? (
          <button className="btn btn-block" onClick={onLogout}>
            Cerrar sesión
          </button>
        ) : (
          <button
            className="btn btn-block"
            disabled={!selectedStoreId}
            onClick={onConfirm}>
            Confirmar
          </button>
        )}
      </div>
    </Modal>
  );
}

export default SelectStore;
