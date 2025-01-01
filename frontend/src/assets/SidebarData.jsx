import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';
import * as RiIcons from 'react-icons/ri';
import * as FcIcons from 'react-icons/fc';

export const SidebarData = [
  {
    title: 'Ventas',
    path: '/ventas',
    icon: <AiIcons.AiFillHome />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,

    subNav: [
      {
        title: 'Venta por código',
        path: '/ventas/venta',
        icon: <FcIcons.FcSalesPerformance />
      },
      {
        title: 'Cierre de caja',
        path: '/ventas/cierre',
        icon: <IoIcons.IoIosPaper />
      },
      {
        title: 'Devolución',
        path: '/ventas/devolucion',
        icon: <IoIcons.IoIosPaper />
      }
    ]
  },
  {
    title: 'Productos',
    path: '/productos',
    icon: <FaIcons.FaCartPlus />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,
    subNav: [
      {
        title: 'Registrar producto venta',
        path: '/productos/venta',
        icon: <IoIcons.IoIosPaper />
      },
      {
        title: 'Registrar',
        path: '/productos/registro',
        icon: <IoIcons.IoIosPaper />
      }
    ]
  },
  {
    title: 'Inventario',
    path: '/inventario',
    icon: <FaIcons.FaCartPlus />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,
    subNav: [
      {
        title: 'Nuevo movimiento',
        path: '/inventario/nuevo',
        icon: <IoIcons.IoIosPaper />
      },
      {
        title: 'Movimientos',
        path: '/inventario/consulta',
        icon: <IoIcons.IoIosPaper />
      }
    ]
  },
  {
    title: 'Compras',
    path: '/compras',
    icon: <FaIcons.FaCartPlus />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,
    subNav: [
      {
        title: 'Generar pedido',
        path: '/compras/pedido',
        icon: <IoIcons.IoIosPaper />
      },
      {
        title: 'Registrar ingreso',
        path: '/compras/ingreso',
        icon: <IoIcons.IoIosPaper />
      }
    ]
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: <IoIcons.IoIosPaper />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,

    subNav: [
      {
        title: 'Reports',
        path: '/reports/reports1',
        icon: <IoIcons.IoIosPaper />,
        cName: 'sub-nav'
      },
      {
        title: 'Reports 2',
        path: '/reports/reports2',
        icon: <IoIcons.IoIosPaper />,
        cName: 'sub-nav'
      },
      {
        title: 'Reports 3',
        path: '/reports/reports3',
        icon: <IoIcons.IoIosPaper />
      }
    ]
  },
  {
    title: 'Maestros',
    path: '/maestros',
    icon: <FaIcons.FaCartPlus />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,
    subNav: [
      {
        title: 'Categoria',
        path: '/maestros/categoria',
        icon: <IoIcons.IoIosPaper />
      },
      {
        title: 'Presentacion',
        path: '/maestros/presentacion',
        icon: <IoIcons.IoIosPaper />
      },
      {
        title: 'Tienda',
        path: '/maestros/tienda',
        icon: <IoIcons.IoIosPaper />
      }
    ]
  },
  {
    title: 'Usuarios',
    path: '/usuarios',
    icon: <FaIcons.FaCartPlus />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,
    subNav: [
      {
        title: 'Nuevo',
        path: '/usuarios/nuevo',
        icon: <IoIcons.IoIosPaper />
      }
    ]
  }
];
