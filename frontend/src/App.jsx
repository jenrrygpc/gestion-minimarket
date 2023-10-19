import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductSale from "./pages/ProductSale";
import Category from "./pages/Category";


function App() {

  return (
    <>      
      <Router>
        <div className="">
          <Header />
          <Routes>
            <Route path = '/' element = {<Home />} />
            <Route path = '/login' element = {<Login />} />
            <Route path = '/register' element = {<Register />} />
            <Route path = '/productos/venta' element = {<ProductSale />} />
            <Route path = '/maestros/categoria' element = {<Category />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
