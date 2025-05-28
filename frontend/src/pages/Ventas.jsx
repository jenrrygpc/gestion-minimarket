import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEnter } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { FaBackspace, FaPlusCircle, FaMinusCircle } from "react-icons/fa";

import { useSelector, useDispatch } from "react-redux";

import {
  createProduct,
  getProduct,
  reset,
} from "../features/products/saleSlice";
import {
  getPosShift,
  createPosShift,
  getValidPosShift,
  setPosShift,
} from "../features/posShift/posShiftSlice";
import { getAvailablePos } from "../features/pos/posSlice";
/*
import {
  reset, getMasters, setMaster,
  createMaster, updateMaster,
  resetCreate
} from "../features/masters/masterSlice";
*/
import Spinner from "../components/Spinner";
import Message from "../components/Message";

import Modal from "react-modal";
const customStyles = {
  content: {
    width: "600px",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    position: "relative",
  },
};

const customStylesPagos = {
  content: {
    width: "600px",
    height: "340px",
    top: "40%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    position: "relative",
  },
};
Modal.setAppElement("#root");

/*
const initialState = {
  code: '',
  shoppingCart: []
}
*/

const initialState = {
  posId: "",
  initialAmount: 0,
  status: "ABIERTO",
};

const initialStateSale = {
  documentType: "BOLETA",
  documentNumber: "",
  customerId: 0,
  amountWithoutTax: 0,
  taxAmount: 0,
  totalAmount: 0,
  productsSale: [],
  payments: []
  /*
  paymentMethod: 'EFECTIVO',
  paymentStatus: 'PENDIENTE',
  status: 'PENDIENTE',
  */
};

const initialStatePayment = {
  montoPago: "",
  metodoPago: "EFECTIVO",
  codigoOperacion: "",
}

function Category() {
  //state para establecer el texto de busqueda.
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [formDataSale, setFormDataSale] = useState(initialStateSale);
  const { documentType, documentNumber, customerId, igv, totalAmount, productsSale, payments } = formDataSale;

  const [formData, setFormData] = useState(initialState);
  const [modalIsOpen, setModalIsOpen] = useState(false); // Estado para manejar la visibilidad del modal

  //useRef is to focus into the component.
  const refInputCode = useRef(null);

  console.log("modalIsOpen ..:", modalIsOpen);

  const { posId, initialAmount } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, products, isLoading, isError, isSuccess, message } =
    useSelector((state) => state.sale);

  const {
    posShiftList,
    posShift,
    isLoading: isLoadingPS,
    isSuccess: isSuccessPS,
    message: messagePS,
    isError: isErrorPS,
  } = useSelector((state) => state.posShift);

  const { availablePos } = useSelector((state) => state.pos);

  console.log("posShiftList ..:", posShiftList);
  console.log("availablePos ..:", availablePos);

  useEffect(() => {
    dispatch(getAvailablePos({}));
    const checkPosShift = async () => {
      console.log("localStorage.getItem ..:", localStorage.getItem("posShift"));
      const posShiftStorage = JSON.parse(
        localStorage.getItem("posShift") || "{}"
      );
      if (posShiftStorage?._id) {
        const isValid = await validatePosShift(posShiftStorage);
        if (isValid) {
          closeModal();
          return;
        }
        localStorage.removeItem("posShift"); // Remove invalid posShift from localStorage
      }

      dispatch(getValidPosShift({ status: "ABIERTO" }));
      //openModal();
    };

    checkPosShift();
  }, []);

  useEffect(() => {
    return () => {
      dispatch(reset()); // Reiniciar el estado global al desmontar
    };
  }, [dispatch]);

  const validatePosShift = async (posShift) => {
    const response = await dispatch(getValidPosShift({ status: "ABIERTO" }));
    return response.payload.some((shift) => shift._id === posShift._id);
  };

  useEffect(() => {
    console.log("posShiftList ...", posShiftList);
    console.log("isLoadingPS ...", isLoadingPS);
    console.log("isSuccessPS ...", isSuccessPS);
    console.log("messagePS ...", messagePS);
    console.log("isErrorPS ...", isErrorPS);

    if (isSuccessPS) {
      if (posShiftList.length === 0) {
        console.log("No hay caja abierta ...");
        openModal(); // Abrir modal si no hay caja abierta
      } else {
        const firstPosShift = posShiftList[0];

        // obtenemos el nombre del punto de venta
        console.log("availablePos:", availablePos);
        const selectedPos = availablePos.find(
          (pos) => pos._id === firstPosShift.posId
        );
        console.log("selectedPos:", selectedPos);
        console.log("firstPosShift:", firstPosShift);
        //firstPosShift.storeName = selectedPos?.name;

        // guardamos en localStorage el primer el turno de venta
        localStorage.setItem(
          "posShift",
          JSON.stringify({ ...firstPosShift, posName: selectedPos?.name })
        );
        // guardamos el turno de venta en el store
        dispatch(setPosShift({ ...firstPosShift, posName: selectedPos?.name }));
      }
    }
  }, [posShiftList, isLoadingPS, isSuccessPS, isErrorPS]);

  useEffect(() => {
    if (availablePos.length > 0) {
      setFormData((prevState) => ({
        ...prevState,
        posId: availablePos[0]._id, // Inicializar con el primer valor del combobox
      }));
    }
  }, [availablePos]);

  useEffect(() => {
    console.log("posShift ...", posShift);
    console.log("messagePS ...", messagePS);
    if (posShift._id && messagePS === "createPosShift") {
      const selectedPos = availablePos.find(
        (pos) => pos._id === posShift.posId
      );
      //posShift.posName = selectedPos.name;

      localStorage.setItem(
        "posShift",
        JSON.stringify({ ...posShift, posName: selectedPos.name })
      );
      dispatch(setPosShift({ ...posShift, posName: selectedPos.name }));
      closeModal();
      // navigate('/ventas');
    } else if (posShift._id) {
      closeModal();
    }
  }, [posShift]);

  // useEffect to handle items by page.
  useEffect(() => {
    console.log("useEffect product ...", product);
    if (product) {
      if (!product.code) {
        Message("Producto no encontrado!", "error");
        return;
      }

      setFormDataSale((prevState) => ({
        ...prevState,
        productsSale: [
          ...prevState.productsSale,
          {
            id: product._id,
            code: product.code,
            description: product.description,
            quantity: 1,
            price: product.price,
            measure: product.measure,
          },
        ],
      }));
    }
  }, [product]);

  useEffect(() => {
    console.log("useEffect products ...", products);

    setSearchResults(
      products.map((product) => {
        return {
          id: product._id,
          code: product.code,
          description: product.description,
          price: product.price,
          measure: product.measure,
        };
      })
    );
    //setShowResults(true);
  }, [products]);

  console.log("showResults ...", showResults);
  console.log("searchResults ...", searchResults);

  const onChange = (e) => {
    console.log("onChange ..:", e.target);
    const { name, value } = e.target;

    // Evitar ingreso si ya se pagó el total
    if ((name === "montoPago" || name === "codigoOperacion") &&
      montoPagado >= totalVenta) {
      return;
    }

    if (name === "initialAmount" || name === "montoPago") {
      if (isNaN(value) || value.includes(" ")) {
        return;
      }
    }

 
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setPagos((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setFormDataSale((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePosChange = (e) => {
    console.log("e ..:", e);
    const posId = e.target.value;
    console.log("posId ..:", posId);
    //const posFound = availablePos.find((pos) => pos._id === posId);
    //console.log('posFound ..:', posFound);

    setFormData((prevState) => ({
      ...prevState,
      posId, //,
      //storeName: storeFound.name
    }));
  };

  /*
  useEffect(() => {
    console.log('useEffect 2 ...', isError, isSuccess, message);
    if (isError) {
      refInputCode.current.focus();
      toast.error(message);
    }

    if (isSuccess) {
      refInputCode.current.focus();
      shoppingCart.push(product);
      refInputCode.current.focus();
    }

    console.log('product 1 ...', product);
    console.log('shoppingCart 1 ...', shoppingCart);
  }, [isError, isSuccess, message, navigate, dispatch]);
  */

  const onChangeCode = (e) => {
    console.log("onChangeCode ..:", e);
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onKeyDownCode = (e) => {
    console.log("onKeyDownCode ..:", e);
    if (e.key === "Enter") {
      // se puso este codigo para devolver mensaje nuevamente y establecer el foco en el campo codigo
      dispatch(reset());
      console.log("Consultar producto ..:", e.target.value);
      dispatch(getProduct({ code: e.target.value }));
    }
  };

  const onChangeSearch = (e) => {
    const { value = "" } = e.target;
    console.log("onChangeSearch ..:", value);
    setProductSearch(value);
    if (value.length > 2) {
      if (isNaN(value.trim())) {
        dispatch(getProduct({ description: value.trim() }));
        setShowResults(true);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const onKeyDownSearch = (e) => {
    console.log("onKeyDownSearch ..:", e);
    const { value = "" } = e.target;
    //if (e.key === 'Enter') {
    console.log("get product ..:", value);
    if (!isNaN(value.trim()) && value.trim() !== "" && e.key === "Enter") {
      const productFound = productsSale.find(
        (product) => product.code === Number(value)
      );

      if (productFound) {
        setFormDataSale((prevState) => ({
          ...prevState,
          productsSale: productsSale.map((product) => {
            if (product.code === Number(value)) {
              return {
                ...product,
                quantity: product.quantity + 1,
              };
            }
            return product;
          }),
        }));
      } else {
        dispatch(getProduct({ code: Number(value) }));
      }
      setProductSearch("");
    }
  };



  const onSubmit = (e) => {
    e.preventDefault();
    console.log("posId ..:", posId);
    console.log("initialAmount ..:", initialAmount);

    const now = new Date();
    const localShiftStart = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 19);

    console.log("localShiftStart ..:", localShiftStart);

    dispatch(
      createPosShift({
        posId,
        initialAmount,
        shiftStart: localShiftStart,
        status: "ABIERTO",
      })
    );

    /*
    if (pos._id) {
      dispatch(updatePos({
        id: pos._id,
        name,
        store: storeId
      }));
    } else {
      dispatch(createPos({
        name,
        store: storeId || initialState.storeId
      }));
    }
    */
  };

  // Open/Close modal
  const openModal = () => {
    setModalIsOpen(true);
    dispatch(getAvailablePos({}));
  };

  const closeModal = () => {
    console.log("closeModal entra? ..:");
    setModalIsOpen(false);
    //setFormData(initialState);
    // validar si se deberia limpiar todo el initialState
    //dispatch(reset());
    //dispatch(resetPos());
  };

  const handleResultClick = (product) => {
    console.log("Producto seleccionado:", product);
    // Aquí puedes agregar la lógica para manejar la selección del producto
    // Por ejemplo, actualizar el estado con el producto seleccionado

    const productFound = productsSale.find((p) => p.code === product.code);
    console.log("productFound ..:", productFound);

    if (productFound) {
      console.log("productsSale ..:", productsSale);

      setFormDataSale((prevState) => ({
        ...prevState,
        productsSale: productsSale.map((p) => {
          console.log("product ppp ..:", p);
          return p.code === product.code
            ? { ...p, quantity: p.quantity + 1 }
            : p;
        }),
      }));
    } else {
      setFormDataSale((prevState) => ({
        ...prevState,
        productsSale: [
          ...prevState.productsSale,
          {
            id: product.id, // id , ya que se formateo previamante en el useEffect.
            code: product.code,
            description: product.description,
            quantity: 1,
            price: product.price,
            measure: product.measure,
          },
        ],
      }));
    }

    setSearchResults([]);
    setShowResults(false);
    setProductSearch("");
    refInputCode.current.focus();
  };

  const handlePlusClick = (product) => {
    console.log("handlePlusClick  ...", product);
    setFormDataSale((prevState) => ({
      ...prevState,
      productsSale: productsSale.map((p) =>
        p.code === product.code ? { ...p, quantity: Number(p.quantity) + 1 } : p
      ),
    }));
  };

  const handleMinusClick = (product) => {
    console.log("Minus icon clicked");
    if (product.quantity > 1) {
      setFormDataSale((prevState) => ({
        ...prevState,
        productsSale: productsSale.map((p) =>
          p.code === product.code ? { ...p, quantity: p.quantity - 1 } : p
        ),
      }));
    }
  };

  const onChangeQuantity = (e, product) => {
    const { name, value } = e.target;

    console.log("name  ...", name);
    console.log("value  ...", value);
    console.log("product  ...", product);

    if (name === "quantity" && (isNaN(value) || value.includes(" "))) {
      return;
    }

    setFormDataSale((prevState) => ({
      ...prevState,
      productsSale: productsSale.map((p) =>
        p.code === product.code ? { ...p, [name]: value } : p
      ),
    }));
  };

  const handleDeleteClick = (product) => {
    setFormDataSale((prevState) => ({
      ...prevState,
      productsSale: prevState.productsSale.filter((p) => p.code !== product.code)
    }));
  };

  const handleDeletePayment = (index) => {
    console.log("handleDeletePayment ...", index);
    setFormDataSale((prevState) => ({
      ...prevState,
      payments: prevState.payments.filter((_, i) => i !== index)
    }));
  };
  

  const handleEventBlur = (event, product) => {
    const { name, value } = event.target;

    console.log("name  ...", name);
    console.log("value  ...", value);
    console.log("product  ...", product);
    console.log("product cost  ...", product.cost);
    const newCost = event.target.value;
    console.log(
      "Cost input lost focus. New cost:",
      newCost,
      "for product:",
      product
    );

    if (name === "quantity" && (isNaN(value) || value === "")) {
      setFormDataSale((prevState) => ({
        ...prevState,
        productsSale: productsSale.map((p) =>
          p.code === product.code ? { ...p, quantity: 1 } : p
        ),
      }));
    }
  };

  const agregarPagos = () => {
    console.log("pagar ...");
    if (productsSale.length === 0) {
      Message("No hay productos en la venta!", "error");
      return;
    }
    abrirModalPago();
  }

  const limpiarVenta = () => {
  setFormDataSale(initialStateSale); // Reinicia productos y pagos
  setPagos(initialStatePayment);     // Limpia los campos de pago
  setProductSearch("");              // Limpia la búsqueda de productos
  setSearchResults([]);              // Limpia los resultados de búsqueda
  // Si tienes más estados relacionados, agrégalos aquí
  if (refInputCode.current) {
    refInputCode.current.focus();    // Devuelve el foco al input de código
  }
};

  const pagar = () => {
    console.log("pagar  !!!...");
  }

  // Estado para el modal de pagos
  const [modalPagoIsOpen, setModalPagoIsOpen] = useState(false);

  const [pagos, setPagos] = useState(initialStatePayment);
  const { montoPago, metodoPago, codigoOperacion } = pagos;

  const refInputMontoPagar = useRef(null);

  
  useEffect(() => {
    if (modalPagoIsOpen) {
      setTimeout(() => {
        if (refInputMontoPagar.current) {
          refInputMontoPagar.current.focus();
        }
      }, 100); // 100ms suele ser suficiente
  }
  }, [modalPagoIsOpen]);  


  //const [montoPago, setMontoPago] = useState("");
  //const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  //const [pagos, setPagos] = useState([]);

  const abrirModalPago = () => setModalPagoIsOpen(true);
  const cerrarModalPago = () => setModalPagoIsOpen(false);

  // Agregar pago
  const agregarPago = () => {
    if (!montoPago || isNaN(montoPago) || Number(montoPago) <= 0){
      refInputMontoPagar.current.focus();
      return;
    } 

    setFormDataSale((prevState) => ({
        ...prevState,
        payments: [
          ...prevState.payments,
          {
            montoPago: Number(montoPago),
            codigoOperacion: codigoOperacion,
            metodoPago: metodoPago,
          },
        ],
    }));

    //setPagos([...pagos, { monto: Number(montoPago), metodo: metodoPago }]);
    //setMontoPago("");
    setPagos(initialStatePayment);
    refInputMontoPagar.current.focus();
  };



  // Calcula el total de la venta
  const totalVenta = productsSale.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.quantity),
    0
  );

  // Calcula el monto ingresado/pagado
  const montoPagado = payments.reduce(
    (acc, pago) => acc + Number(pago.montoPago),
    0
  );

  // Calcula el monto restante o vuelto
  const montoRestante = totalVenta - montoPagado;
  const montoVuelto = montoPagado > totalVenta ? montoPagado - totalVenta : 0;

  const onKeyDownMontoPago = (e) => {
    console.log("onKeyDownMontoPago ..:", e);
    const { value = "" } = e.target;

    if (e.key === "Enter") {
      if (montoPagado >= totalVenta) {
        pagar();
      } else if (!isNaN(value.trim()) && value.trim() !== "") {
        agregarPago();
      }
    }
  }

  const onKeyDownCodigoOperacion = (e) => {
    console.log("onKeyDownCodigoOperacion ..:", e);
    console.log("montoPagado ..:", montoPagado);
    const { value = "" } = e.target;
    console.log("value ..:", value);
    if (e.key === "Enter") {
      if (montoPagado >= totalVenta) {
        pagar(); // tu función para realizar el pago
      } else if (!isNaN(value.trim()) && value.trim() !== "") {
        agregarPago();
      }
    }

  
  }


  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="ventas">
      <div className="venta">
     

        <div className="form-group">
          <div className="search-container">
            <input
              type="text"
              className="form-control"
              id="productSearch"
              name="productSearch"
              value={productSearch}
              onChange={onChangeSearch}
              onKeyDown={onKeyDownSearch}
              onFocus={() => {
                console.log("searchResults ...", searchResults);
                if (searchResults.length > 0) {
                  console.log("on focus ...", showResults);
                  setShowResults(true);
                }
              }}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              placeholder="Ingresar código de producto"
              ref={refInputCode}
              required
            />

            {showResults && (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((product, index) => (
                    <div
                      key={index}
                      className="search-result-item"
                      onClick={() => handleResultClick(product)}
                    >
                      {` ${product.code} | ${product.description}  | S/.${product.price} `}
                    </div>
                  ))
                ) : (
                  <div className="search-result-item">
                    No se encontraron resultados
                  </div>
                )}
              </div>
            )}
          </div>         
        </div>



        <div className="productos-cabecera-grid">
          <div>Código</div>
          <div>Descripción</div>
          <div>Cantidad</div>
          <div>Precio</div>
          <div>Total</div>
          <div>Eliminar</div>
        </div>
        <div className="productos">
          {productsSale.map((product, index) => (
            <div key={index} className="productos-detalle-grid">
              <div>{product.code}</div>
              <div>{product.description}</div>
              <div className="list-group">
                {product.measure === "UN" && (
                  <button
                    onClick={() => handlePlusClick(product)}
                    style={{ border: "none", background: "none" }}
                  >
                    <FaPlusCircle color="blue" />
                  </button>
                )}

                {product.measure === "UN" ? (
                  ` ${product.quantity} ${product.measure}. `
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      id="quantity"
                      name="quantity"
                      value={product.quantity}
                      onChange={(event) => onChangeQuantity(event, product)}
                      onBlur={(event) => handleEventBlur(event, product)}
                      required
                    />
                    <span> {product.measure}</span>
                  </>
                )}

                {product.measure === "UN" && (
                  <button
                    onClick={() => handleMinusClick(product)}
                    style={{ border: "none", background: "none" }}
                  >
                    <FaMinusCircle color="red" />
                  </button>
                )}
              </div>
              <div>S/. {product.price}</div>
              <div>S/. {product.price * product.quantity}</div>
              <div>
                <button onClick={() => handleDeleteClick(product)} style={{ border: 'none', background: 'none' }}>
                  <MdDelete color="black" />
                </button>
              </div>
            </div>

            
          ))}
        </div>

        <div className="totales">
          <p className="totales-item">Sub Total ..: </p>
          <p className="totales-item">{(totalVenta / 1.18).toFixed(2)} </p>
          <p className="totales-item">IGV ..: </p>
          <p className="totales-item">{(totalVenta - totalVenta / 1.18).toFixed(2)} </p>
          <p className="totales-item">Total ..: </p>
          <p className="totales-item">{totalVenta.toFixed(2)} </p>
        </div>
      </div>

      <div className="teclado">

        <button className="btn btn-extra btn-col-4">Cerrar Caja</button>

        <button className="btn btn-extra btn-col-2">Cliente</button>
        <select
    className="btn btn-extra btn-col-2"
    name="documentType"
    value={documentType}
    onChange={onChange}
    style={{ width: "120px", marginRight: "8px" }}
  >
    <option value="BOLETA">Boleta</option>
    <option value="FACTURA">Factura</option>
    <option value="TICKET">Ticket</option>
  </select>

        <button className="btn"> 7 </button>
        <button className="btn"> 8 </button>
        <button className="btn"> 9 </button>
        <button className="btn"> 000 </button>

        <button className="btn"> 4 </button>
        <button className="btn"> 5 </button>
        <button className="btn"> 6 </button>
        <button className="btn"> Limpiar </button>

        <button className="btn"> 1 </button>
        <button className="btn"> 2 </button>
        <button className="btn"> 3 </button>
        <button className="btn btn-enter">
          <AiOutlineEnter /> Enter
        </button>

        <button className="btn"> 0 </button>
        <button className="btn"> . </button>
        <button className="btn">
          {" "}
          <FaBackspace />{" "}
        </button>

        
        <button className="btn btn-extra btn-col-2">Recuperar</button>
        <button className="btn btn-extra btn-col-2" onClick={limpiarVenta}>Limpiar</button>
        <button className="btn btn-extra btn-col-4" onClick={agregarPagos}>Pagar</button>
        

      </div>

      <Modal isOpen={modalIsOpen} style={customStyles} contentLabel="Nuevo POS">
        <h3>Apertura de Punto de Venta</h3>
        <hr></hr>

        <br></br>

        <section className="form">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td>
                      <label htmlFor="store">Pos disponibles ..:</label>
                    </td>
                    <td>
                      <select
                        className="form-control"
                        id="pointOfSale"
                        name="pointOfSale"
                        value={posId}
                        onChange={handlePosChange}
                        required
                      >
                        {availablePos.map((pos) => {
                          return (
                            <option key={pos._id} id={pos._id} value={pos._id}>
                              {pos.name}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <label htmlFor="montoInicial">Monto inicial ..:</label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        id="initialAmount"
                        name="initialAmount"
                        value={initialAmount}
                        onChange={onChange}
                        placeholder="Ingrese monto inicial"
                        required
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="form-group">
              <button className="btn btn-block">Abrir Punto de venta</button>
            </div>
          </form>
        </section>
      </Modal>

      <Modal isOpen={modalPagoIsOpen} onRequestClose={cerrarModalPago} style={customStylesPagos} contentLabel="Pagos">
        <h3>Ingresar Pagos</h3>
        <hr></hr>
        <button className='btn-close' onClick={cerrarModalPago}>
          X
        </button>
        <br></br>
        <div className="form-group">
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type='text'
              className="form-control"
              id="montoPago"
              name="montoPago"
              value={montoPago}
              onChange={onChange}
              onKeyDown={onKeyDownMontoPago}
              placeholder="Monto a pagar"
              required            
              style={{ width: "30%" }}
              ref={refInputMontoPagar}
            />
            <input
              type='text'
              className="form-control"
              name="codigoOperacion"
              value={codigoOperacion}
              onChange={onChange}
              onKeyDown={onKeyDownCodigoOperacion}
              placeholder="Código operacion"
              required            
              style={{ width: "40%" }}
            />
            
            <button
              className="btn"
              type="button"
              style={{
                backgroundColor: montoPagado >= totalVenta ? "#28a745" : "#007bff",
                color: "#fff",
                fontWeight: "bold"//,
                //cursor: montoPagado >= totalVenta ? "pointer" : "not-allowed"
              }}
              onClick={montoPagado >= totalVenta ? pagar: agregarPago}
            >
              {montoPagado >= totalVenta ? "Pagar" : "Agregar"}
            </button>
            
            
          </div>
        </div>
        <div className="form-group">

          <div className="lista-pagos-headings" key="0">
            <div>Método de pago</div>
            <div>Monto</div>
            <div>Cód. operación</div>
            <div>Eliminar</div>
          </div>

          <div className="pagos-scroll">
            {payments.map((pago, index) => (
              <div className="lista-pagos" key={index}>
                <div>{pago.metodoPago}</div>
                <div>{pago.montoPago}</div>
                <div>{pago.codigoOperacion}</div>
                <div>
                  <button onClick={() => handleDeletePayment(index)} style={{ border: 'none', background: 'none' }}>
                    <MdDelete color="black" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen de pagos */}
          <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "15px",
                marginTop: "16px",
                borderTop: "1px solid #eee",
                paddingTop: "10px",
                background: "#fff"
              }}>
            <span>Total a pagar: S/. {totalVenta.toFixed(2)}</span>
            <span>Monto pagado: S/. {montoPagado.toFixed(2)}</span>
            <span>
              {montoRestante > 0
              ? <>Monto restante: S/. {montoRestante.toFixed(2)}</>
              : <>Vuelto: S/. {montoVuelto.toFixed(2)}</>
              } 
            </span>
          </div>

        </div>          
        
      </Modal>
    </div>
  );
}

export default Category;
