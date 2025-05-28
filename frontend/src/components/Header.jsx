import React, { useState, useEffect } from 'react';
import { FaSignInAlt, FaSignOutAlt, FaUser, FaProductHunt, FaBars } from 'react-icons/fa';
import styled from 'styled-components';
import { AiOutlineClose } from 'react-icons/ai';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { IconContext } from 'react-icons/lib';

import { SidebarData } from '../assets/SidebarData';
import SubMenu from './SubMenu';

import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  logout, reset, showSidebar,
  getUser
} from '../features/auth/authSlice';
import { setPosShift } from "../features/posShift/posShiftSlice";



const Nav = styled.div`
  background: #828282;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavIcon = styled(Link)`
  margin-left: 1rem;
  font-size: 1.5rem;
  height: 80px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

// margin-top: -15px; se usa para igualar la posicion de ambos botones
const SidebarNav = styled.nav`
  background: #828282;
  width: 250px;
  height: 100vh;
  display: flex;
  justify-content: center;
  margin-top: -15px;
  position: fixed;
  top: 0;
  left: ${({ sidebar }) => (sidebar ? '0' : '-100%')};
  transition: 350ms;
  z-index: 10;
`;

const SidebarWrap = styled.div`
  width: 100%
`;

const LoginStyle = styled.ul`
  display: flex;
  align-items: center;
  margin-left: 20px;
`;

const LoginStyle2 = styled.li`
  margin-left: 20px;
  margin-right: 10px;
  font-weight: bold;
`;


function Header() {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, sidebar, isError, message, store } = useSelector((state) => state.auth);

  const { posShift } = useSelector(
    (state) => state.posShift
  );

  console.log('user Header ..:', user);
  console.log('store Header ..:', store);

  console.log('posShift Header ..:', posShift);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    
    navigate('/');
  };

  //use effect para verificar si el token sigue vigente
  useEffect(() => {
    console.log('useEffect para verificar el token.', user);
    if (user) {
      dispatch(getUser());
    }

  }, []);

  useEffect(() => {
    console.log('useEffect para volver a cargar .', user, isError, message);
    if (isError) {
      dispatch(logout());
      dispatch(reset());
      navigate('/');
    }
  }, [user, isError, message]);

  //const [sidebar, setSidebar] = useState(false);

  const changeSidebar = () => dispatch(showSidebar());

  return (

    <IconContext.Provider value={{ color: '#fff' }}>
      <Nav>
        {
          user ? (
            <NavIcon to='#'>
              <FaBars onClick={changeSidebar} />
            </NavIcon>
          ) : (
            <div>
            </div>)
        }
        <LoginStyle>
          {
            user ? (
              <>

{
                  posShift?.posName && (
                    <>
                      <LoginStyle2>
                        Punto de Venta:
                      </LoginStyle2>
                      {posShift.posName || ''} 
                    </>
                  )
                }

                <LoginStyle2>
                  Sucursal:
                </LoginStyle2>
                {store?.name || ''}
                <LoginStyle2>
                  Bienvenid@:
                </LoginStyle2>
                {user.name}

                

                <LoginStyle2>
                  <button className='btn' onClick={onLogout}><FaSignOutAlt /> Salir</button>
                </LoginStyle2>

              </>
            ) : (
              <>
                <LoginStyle2>
                  <Link to='/login'>
                    <FaSignInAlt /> Iniciar
                  </Link>
                </LoginStyle2>

              </>
            )
          }
        </LoginStyle>
      </Nav>

      <SidebarNav sidebar={sidebar}>
        <SidebarWrap>
          <NavIcon to='#'>
            <AiOutlineClose onClick={changeSidebar} />
          </NavIcon>
          {SidebarData.map((item, index) => {
            return <SubMenu item={item} key={index} />;
          })}
        </SidebarWrap>
      </SidebarNav>
    </IconContext.Provider>
  );
}

export default Header;