import React, { useState } from 'react';
import { FaSignInAlt, FaSignOutAlt, FaUser, FaProductHunt, FaBars } from 'react-icons/fa';
import styled from 'styled-components';
import { AiOutlineClose } from 'react-icons/ai';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { IconContext } from 'react-icons/lib';

import { SidebarData } from '../assets/SidebarData';
import SubMenu from './SubMenu';

import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset, showSidebar } from '../features/auth/authSlice';



const Nav = styled.div`
  background: #828282;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavIcon = styled(Link)`
  margin-left: 2rem;
  font-size: 2rem;
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
`;


function Header() {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, sidebar } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

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
                <LoginStyle2>
                  User: {user.name}
                </LoginStyle2>
                <LoginStyle2>
                  <button className='btn' onClick={onLogout}><FaSignOutAlt /> Logout</button>
                </LoginStyle2>

              </>
            ) : (
              <>
                <LoginStyle2>
                  <Link to='/login'>
                    <FaSignInAlt /> Login
                  </Link>
                </LoginStyle2>
                <LoginStyle2>
                  <Link to='/register'>
                    <FaUser /> Register
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