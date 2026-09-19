import { useState, useEffect, useRef, Fragment } from "react";
import { useNavigate } from 'react-router-dom';
import { FaUserShield } from "react-icons/fa";
import { TbNewSection } from "react-icons/tb";
import { AiTwotoneEdit } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import ReactPaginate from 'react-paginate';
import {
  createRole, updateRole, getRoles,
  reset, setRole, resetRole
} from "../features/roles/roleSlice";
import { getPermissions } from "../features/permissions/permissionSlice";

import Spinner from '../components/Spinner';
import Message from '../components/Message';

import Modal from 'react-modal';

const customStyles = {
  content: {
    width: '760px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    overflowY: 'auto',
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

// Checkbox con estado "parcial" para los encabezados de módulo
function TriStateCheckbox({ checked, indeterminate, onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return <input type='checkbox' ref={ref} checked={checked} onChange={onChange} />;
}

// Convierte VENTAS_CREAR -> "Crear" y MENU_VENTAS -> "Ver menú" para no repetir el módulo en cada opción
const getActionLabel = (permission) => {
  if (permission.type === 'MENU') {
    return 'Ver menú';
  }
  const action = permission.code.replace(`${permission.module}_`, '').toLowerCase();
  return action.charAt(0).toUpperCase() + action.slice(1);
};

const initialState = {
  name: '',
  description: '',
  enabled: true,
  permissions: []
}

function Role() {

  // ini pagination states
  const [offset, setOffset] = useState(0);
  const [rolesPage, setRolesPage] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);
  //fin pagination states

  //state para establecer el texto de busqueda.
  const [roleSearch, setRoleSearch] = useState('');

  //state para filtrar el catálogo de permisos dentro del modal.
  const [permissionSearch, setPermissionSearch] = useState('');

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);

  const { name, description, enabled, permissions } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role, roles, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.role
  );

  const { permissions: allPermissions } = useSelector(
    (state) => state.permission
  );

  useEffect(() => {
    if (isError) {
      Message(message, 'error');
      dispatch(reset());
    }

    if (isSuccess) {
      closeModal();
      dispatch(getRoles());
      if (role._id) {
        Message('Rol actualizado exitosamente!');
      } else {
        Message('Rol creado exitosamente!');
      }
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  // useEffect usado para cargar la data al inicio. (solo se ejecuta la primera vez)
  useEffect(() => {
    dispatch(getRoles());
    dispatch(getPermissions());
  }, []);

  // useEffect to handle items by page.
  useEffect(() => {
    setRolesPage(roles.slice(offset * perPage, (offset + 1) * perPage));
    setPageCount(Math.ceil(roles.length / perPage));
  }, [roles]);

  // use effect to handle pagination
  useEffect(() => {
    setRolesPage(roles.slice(offset * perPage, (offset + 1) * perPage));
  }, [offset]);

  //useEffect to show data on popup.
  useEffect(() => {
    setFormData({
      name: role.name || '',
      description: role.description || '',
      enabled: role._id ? role.enabled : true,
      permissions: (role.permissions || []).map((permission) => permission._id || permission)
    });
  }, [role]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onChangeSearch = (e) => {
    setRoleSearch(e.target.value);
  };

  const onKeyDownSearch = (e) => {
    if (e.key === 'Enter') {
      dispatch(getRoles({ name: e.target.value }));
    }
  };

  // manejar el evento de paginacion.
  const handlePageClick = (e) => {
    setOffset(e.selected);
  };

  const onTogglePermission = (permissionId) => {
    setFormData((prevState) => {
      const alreadySelected = prevState.permissions.includes(permissionId);
      return {
        ...prevState,
        permissions: alreadySelected
          ? prevState.permissions.filter((id) => id !== permissionId)
          : [...prevState.permissions, permissionId]
      };
    });
  };

  const onToggleAllPermissions = () => {
    setFormData((prevState) => ({
      ...prevState,
      permissions: prevState.permissions.length === allPermissions.length
        ? []
        : allPermissions.map((permission) => permission._id)
    }));
  };

  const onToggleModule = (modulePermissions) => {
    const moduleIds = modulePermissions.map((permission) => permission._id);
    setFormData((prevState) => {
      const allSelected = moduleIds.every((id) => prevState.permissions.includes(id));
      return {
        ...prevState,
        permissions: allSelected
          ? prevState.permissions.filter((id) => !moduleIds.includes(id))
          : [...new Set([...prevState.permissions, ...moduleIds])]
      };
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (role._id) {
      dispatch(updateRole({
        id: role._id,
        name,
        description,
        enabled,
        permissions
      }));
    } else {
      dispatch(createRole({
        name,
        description,
        enabled,
        permissions
      }));
    }
  };

  const onEditar = (idRole) => {
    const role = roles.find((role) => role._id == idRole);
    if (role) {
      dispatch(setRole(role));
      openModal();
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFormData(initialState);
    setPermissionSearch('');
    dispatch(reset());
    dispatch(resetRole());
  };

  // agrupa el catálogo de permisos por módulo, para pintar los checkboxes ordenados
  const permissionsByModule = allPermissions.reduce((groups, permission) => {
    const group = groups[permission.module] || [];
    group.push(permission);
    groups[permission.module] = group;
    return groups;
  }, {});

  const search = permissionSearch.trim().toLowerCase();
  const visibleModules = Object.entries(permissionsByModule)
    .map(([module, modulePermissions]) => {
      if (!search || module.toLowerCase().includes(search)) {
        return [module, modulePermissions];
      }
      return [module, modulePermissions.filter((permission) =>
        permission.code.toLowerCase().includes(search)
        || getActionLabel(permission).toLowerCase().includes(search))];
    })
    .filter(([, modulePermissions]) => modulePermissions.length > 0);

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="container-list">
      <br></br>
      <section>
        <h1>
          <FaUserShield /> Roles
        </h1>
      </section>

      <section className="form-list">

        <div className="list-toolbar">
          <input
            type='text'
            id='roleSearch'
            name='roleSearch'
            value={roleSearch}
            onChange={onChangeSearch}
            onKeyDown={onKeyDownSearch}
            placeholder='Buscar rol por nombre y presione Enter...' />
          <button className='btn' onClick={openModal}><TbNewSection /> Nuevo </button>
        </div>

        {roles.length === 0 && (
          <p className="empty-state">No hay roles registrados. Crea el primero con el botón "Nuevo".</p>
        )}

        {roles.length > 0 && <div>

          <div className="listas-roles-headings" key="0">
            <div>Nombre</div>
            <div>Descripción</div>
            <div>Permisos</div>
            <div>Estado</div>
            <div>Editar</div>
          </div>

          {rolesPage.map(role => (
            <div className="listas-roles" key={role._id}>
              <div><strong>{role.name}</strong></div>
              <div>{role.description || '-'}</div>
              <div>{(role.permissions || []).length} permiso(s)</div>
              <div>
                <span className={`badge ${role.enabled ? 'badge-success' : 'badge-muted'}`}>
                  {role.enabled ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div>
                <button onClick={() => onEditar(role._id)}
                  title='Editar rol'
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  <AiTwotoneEdit color="black" />
                </button>
              </div>
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
        </div>}

        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel='Nuevo Rol'>
          <h3>{role._id ? 'Editar Rol' : 'Nuevo Rol'}</h3>
          <hr></hr>

          <button className='btn-close' onClick={closeModal}>
            X
          </button>
          <br></br>

          <section className="form modal-form">
            <form onSubmit={onSubmit}>
              <div className="form-grid">

                <div className="field">
                  <label htmlFor="name">Nombre</label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={name}
                    onChange={onChange}
                    placeholder='Ej. SUPERVISOR'
                    disabled={role._id ? true : false}
                    required />
                </div>

                <div className="field">
                  <label htmlFor="description">Descripción</label>
                  <input
                    type='text'
                    id='description'
                    name='description'
                    value={description}
                    onChange={onChange}
                    placeholder='Ingrese una descripción' />
                </div>

                <div className="field full-width">
                  <label className="checklist-item">
                    <input
                      type='checkbox'
                      name='enabled'
                      checked={enabled}
                      onChange={onChange} />
                    Rol activo
                  </label>
                  <small className="field-hint">Los roles inactivos no deberían asignarse a nuevos usuarios</small>
                </div>

                <div className="field full-width">
                  <div className="checklist-header">
                    <label>Permisos ({permissions.length}/{allPermissions.length})</label>
                    {allPermissions.length > 0 && (
                      <button type="button" onClick={onToggleAllPermissions}>
                        {permissions.length === allPermissions.length ? 'Quitar todos' : 'Seleccionar todos'}
                      </button>
                    )}
                  </div>

                  <input
                    type='text'
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    placeholder='Filtrar permisos por módulo o acción...'
                    style={{ marginBottom: '8px' }} />

                  <div className="checklist checklist-permissions">
                    {allPermissions.length === 0 && <span>No hay permisos registrados</span>}
                    {allPermissions.length > 0 && visibleModules.length === 0 && (
                      <span>No hay permisos que coincidan con el filtro</span>
                    )}
                    {visibleModules.map(([module, modulePermissions]) => {
                      const selectedInModule = modulePermissions
                        .filter((p) => permissions.includes(p._id)).length;

                      return (
                        <Fragment key={module}>
                          <div className="checklist-group-title">
                            <label className="checklist-item">
                              <TriStateCheckbox
                                checked={selectedInModule === modulePermissions.length}
                                indeterminate={selectedInModule > 0 && selectedInModule < modulePermissions.length}
                                onChange={() => onToggleModule(modulePermissions)} />
                              {module}
                            </label>
                            <span className="checklist-group-count">
                              {selectedInModule}/{modulePermissions.length}
                            </span>
                          </div>
                          {modulePermissions.map((permission) => (
                            <label className="checklist-item" key={permission._id} title={permission.code}>
                              <input
                                type='checkbox'
                                checked={permissions.includes(permission._id)}
                                onChange={() => onTogglePermission(permission._id)} />
                              {getActionLabel(permission)}
                            </label>
                          ))}
                        </Fragment>
                      );
                    })}
                  </div>
                  <small className="field-hint">
                    Los permisos "Ver menú" controlan la visibilidad en el menú lateral; el resto habilita las operaciones del módulo.
                  </small>
                </div>

              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-reverse" onClick={closeModal}>Cancelar</button>
                <button className="btn">{role._id ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </section>

        </Modal>

      </section>
    </div>
  );
}

export default Role;
