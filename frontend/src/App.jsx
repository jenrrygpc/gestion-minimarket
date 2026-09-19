import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/Header";
import RequireAuth from "./components/RequireAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SelectStore from "./pages/SelectStore";
import Register from "./pages/Usuario";
import Role from "./pages/Role";
import ProductSale from "./pages/ProductSale";
import Product from "./pages/Product";
import Category from "./pages/Category";
import Display from "./pages/Display";
import MetodoPago from "./pages/MetodoPago";
import Store from "./pages/Store";
import Pos from "./pages/Pos";
import Ventas from "./pages/Ventas";
import PosShift from "./pages/PosShift";
import Inventory from "./pages/Inventory";
import Customer from "./pages/Customer";
import ReasonTransaction from "./pages/MotivoTransaccion";
import Test from "./pages/Test";


function App() {

  return (
    <>      
      <Router>
        <div className="">
          <Header />
          <Routes>
            <Route path = '/' element = {<RequireAuth><Home /></RequireAuth>} />
            <Route path = '/login' element = {<Login />} />
            <Route path = '/seleccionar-tienda' element = {<SelectStore />} />
            <Route path = '/usuarios/nuevo' element = {<RequireAuth><Register /></RequireAuth>} />
            <Route path = '/usuarios/roles' element = {<RequireAuth><Role /></RequireAuth>} />
            <Route path = '/productos/venta' element = {<RequireAuth><ProductSale /></RequireAuth>} />
            <Route path = '/productos/registro' element = {<RequireAuth><Product /></RequireAuth>} />
            <Route path = '/maestros/categoria' element = {<RequireAuth><Category /></RequireAuth>} />
            <Route path = '/maestros/presentacion' element = {<RequireAuth><Display /></RequireAuth>} />
            <Route path = '/maestros/metodos_pago' element = {<RequireAuth><MetodoPago /></RequireAuth>} />
            <Route path = '/maestros/tienda' element = {<RequireAuth><Store /></RequireAuth>} />
            <Route path = '/maestros/puntoventa' element = {<RequireAuth><Pos /></RequireAuth>} />
            <Route path = '/maestros/cliente' element = {<RequireAuth><Customer /></RequireAuth>} />
            <Route path = '/maestros/motivo_transaccion' element = {<RequireAuth><ReasonTransaction /></RequireAuth>} />
            <Route path = '/ventas/venta' element = {<RequireAuth><Ventas /></RequireAuth>} />
            <Route path = '/ventas/turno' element = {<RequireAuth><PosShift /></RequireAuth>} />
            <Route path = '/inventario/nuevo' element = {<RequireAuth><Inventory /></RequireAuth>} />
            <Route path = '/test/test01' element = {<RequireAuth><Test /></RequireAuth>} />
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
