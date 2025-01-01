import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductSale from "./pages/ProductSale";
import Product from "./pages/Product";
import Category from "./pages/Category";
import Display from "./pages/Display";
import Store from "./pages/Store";
import Ventas from "./pages/Ventas";
import Inventory from "./pages/Inventory";


function App() {

  return (
    <>      
      <Router>
        <div className="">
          <Header />
          <Routes>
            <Route path = '/' element = {<Home />} />
            <Route path = '/login' element = {<Login />} />
            <Route path = '/usuarios/nuevo' element = {<Register />} />
            <Route path = '/productos/venta' element = {<ProductSale />} />
            <Route path = '/productos/registro' element = {<Product />} />
            <Route path = '/maestros/categoria' element = {<Category />} />
            <Route path = '/maestros/presentacion' element = {<Display />} />
            <Route path = '/maestros/tienda' element = {<Store />} />
            <Route path = '/ventas/venta' element = {<Ventas />} />
            <Route path = '/inventario/nuevo' element = {<Inventory />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
