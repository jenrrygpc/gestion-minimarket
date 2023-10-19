import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useSelector, useDispatch } from 'react-redux';
import { logout, reset, showSidebar } from '../features/auth/authSlice';

const SidebarLink = styled(Link)`
  display: flex;
  color: #e1e9fc;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  list-style: none;
  height: 40px;
  text-decoration: none;
  font-size: 18px;

  &:hover {
    background: #252831;
    border-left: 4px solid #3380FF;
    cursor: pointer;
  }
`;

const SidebarLabel = styled.span`
  margin-left: 16px;
`;

const DropdownLink = styled(Link)`
  background: #414757;
  height: 40px;
  padding-left: 2rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #f5f5f5;
  font-size: 15px;

  &:hover {
    background: #3380FF;
    cursor: pointer;
  }
`;

const SubMenu = ({ item }) => {
  const dispatch = useDispatch();
  const [subnav, setSubnav] = useState(false);

  const showSubnav = () => {
    console.log('prueba');
    setSubnav(!subnav);
  };

  // const hideSidebar = () => setSidebar(!sidebar);
  const hideSidebar = () => {
    console.log('prueba hideSidebar');
    dispatch(showSidebar());
    //setSubnav(!subnav);
  };

  return (
    <>
      <SidebarLink to={item.path} onClick={item.subNav && showSubnav}>
        <div>
          {item.icon}
          <SidebarLabel>{item.title}</SidebarLabel>
        </div>
        <div>
          {item.subNav && subnav
            ? item.iconOpened
            : item.subNav
              ? item.iconClosed
              : null}
        </div>
      </SidebarLink>
      {subnav &&
        item.subNav.map((item, index) => {
          return (
            <DropdownLink to={item.path} key={index} onClick={hideSidebar}>
              {item.icon}
              <SidebarLabel>{item.title}</SidebarLabel>
            </DropdownLink>
          );
        })}
    </>
  );
};

export default SubMenu;
