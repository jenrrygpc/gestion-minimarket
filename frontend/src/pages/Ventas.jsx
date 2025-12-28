import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEnter } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { FaBackspace, FaPlusCircle, FaMinusCircle } from "react-icons/fa";

import { useSelector, useDispatch } from "react-redux";

//impresion con react-to-print
//import { useReactToPrint } from "react-to-print";
//console.log("ReactToPrint importado:", useReactToPrint);
import BoletaPrint from "../components/BoletaPrint";
console.log("BoletaPrint importado:", BoletaPrint);

import {
  createProduct,
  getProduct,
  createSale,
  reset,
} from "../features/products/saleSlice";
import {
  getPosShift,
  createPosShift,
  getValidPosShift,
  setPosShift,
  closePosShift,
  resetPosShift,
  getPreClosingSummary,
} from "../features/posShift/posShiftSlice";
import { getAvailablePos } from "../features/pos/posSlice";
import {
  createCustomer, getCustomers, resetCustomers
} from "../features/customers/customerSlice";

import { getMasters } from "../features/masters/masterSlice";

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
import { set } from "mongoose";
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
    height: "380px",
    top: "40%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    position: "relative",
  },
};

const customStylesCustomer = {
  content: {
    width: '600px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    position: 'relative'
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
  //customerId: 0,
  customerSale: {},
  amountWithoutTax: 0,
  taxAmount: 0,
  totalAmount: 0,
  productsSale: [],
  payments: [],
  igv: 18, // Porcentaje de IGV
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
};

const initialStateCustomer = {
  documentNumberCustomer: '',
  names: '',
  email: '',
  address: '',
  cellphone: ''
};

function Ventas() {

  const boletaRef = useRef(null);
  const [ventaImprimir, setVentaImprimir] = useState(null);

  // hook de impresión con react-to-print
  /*
  const handlePrint = useReactToPrint({
    contentRef: boletaRef
  });
  */

  //funcion para imprimir directamente
  const handlePrint = () => {
    if (!boletaRef.current) {
      console.error("No se encontró el elemento a imprimir");
      return;
    }

    // Crear ventana de impresión optimizada
    const printWindow = window.open('', '_blank', 'width=300,height=600,scrollbars=yes');

    if (!printWindow) {
      alert('Por favor, permite las ventanas emergentes para imprimir');
      return;
    }

    // Escribir contenido optimizado para impresora térmica
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Boleta de Venta</title>
          <meta charset="utf-8">
          <style>
            @page { 
              size: 80mm auto; 
              margin: 0; 
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              color: #000;
              background: #fff;
              width: 72mm;
              padding: 2mm;
            }
            @media print {
              body { 
                margin: 0;
                padding: 2mm;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${boletaRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Esperar a que cargue y luego imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();

        // Cerrar ventana después de imprimir (opcional)
        setTimeout(() => {
          printWindow.close();
          console.log("Impresión completada");
          setVentaImprimir(null); // Limpiar datos de impresión
        }, 1000);
      }, 500);
    };
  };



  // Al inicio del componente Ventas
  const [modalCierreIsOpen, setModalCierreIsOpen] = useState(false);
  const [resumenCierre, setResumenCierre] = useState(null);
  
  // ========== ARQUEO DE CAJA ==========
  // Paso 1: Cajero ingresa montos reales (sin ver el sistema)
  // Paso 2: Se muestra comparación con diferencias
  const [pasoArqueo, setPasoArqueo] = useState(1); // 1 = ingreso, 2 = confirmación
  const [arqueoData, setArqueoData] = useState({
    realCashAmount: '',
    realCardAmount: '',
    realDigitalWalletAmount: '',
    realTransferAmount: '',
    realOtherAmount: '',
    arqueoNotes: ''
  });

  //state para establecer el texto de busqueda.
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [formDataSale, setFormDataSale] = useState(initialStateSale);
  const { documentType, documentNumber, customerId, customerSale, igv, totalAmount, productsSale, payments } = formDataSale;

  const [formData, setFormData] = useState(initialState);
  const [modalIsOpen, setModalIsOpen] = useState(false); // Estado para manejar la visibilidad del modal

  //useRef is to focus into the component.
  const refInputCode = useRef(null);

  console.log("modalIsOpen ..:", modalIsOpen);

  const { posId, initialAmount } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, products, sale, isLoading, isError, isSuccess, message } =
    useSelector((state) => state.sale);

  const {
    posShiftList,
    posShift,
    isLoading: isLoadingPS,
    isSuccess: isSuccessPS,
    message: messagePS,
    isError: isErrorPS,
    shiftClosingResult,
    preClosingSummary
  } = useSelector((state) => state.posShift);

  const { availablePos } = useSelector((state) => state.pos);

  const { masters: paymentMethods } = useSelector(
    (state) => state.master
  );

  console.log("posShiftList ..:", posShiftList);
  console.log("availablePos ..:", availablePos);
  console.log("paymentMethods ..:", paymentMethods);

  useEffect(() => {
    //dispatch(resetPosShift());
    dispatch(getAvailablePos({}));
    const checkPosShift = async () => {
      console.log("localStorage.getItem ..:", localStorage.getItem("posShift"));
      const posShiftStorage = JSON.parse(
        localStorage.getItem("posShift") || "{}"
      );
      if (posShiftStorage?._id) {
        const isValid = await validatePosShift(posShiftStorage);
        if (isValid) {
          //closeModal(); cambio 02
          return;
        }
        localStorage.removeItem("posShift"); // Remove invalid posShift from localStorage
      }

      dispatch(getValidPosShift({ status: "ABIERTO" }));
      //openModal();
    };

    checkPosShift();

    dispatch(getMasters({
      type: 'METODOS_PAGO'
    }));

    // ✅ CLEANUP: Limpiar al desmontar
    return () => {
      console.log("🧹 Limpiando al desmontar componente Ventas");
      dispatch(resetPosShift());
    };
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

    if (isSuccessPS && messagePS === "getValidPosShift") {
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
      //closeModal();  --cambio 01
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

  const handleCerrarCaja = () => {
    if (!posShift._id) {
      Message("No hay turno abierto para cerrar.", "error");
      return;
    }

    // Resetear estado del arqueo
    setPasoArqueo(1);
    setArqueoData({
      realCashAmount: '',
      realCardAmount: '',
      realDigitalWalletAmount: '',
      realTransferAmount: '',
      realOtherAmount: '',
      arqueoNotes: ''
    });
    setResumenCierre(null);
    setModalCierreIsOpen(true);
  }

  // Manejar cambios en los campos del arqueo
  const onChangeArqueo = (e) => {
    const { name, value } = e.target;
    // Solo permitir números y punto decimal para montos
    if (name !== 'arqueoNotes' && value !== '' && isNaN(value)) {
      return;
    }
    setArqueoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Paso 1 -> Paso 2: Obtener resumen del sistema para comparar
  const continuarAlResumen = () => {
    // Validar que al menos se haya ingresado el efectivo
    if (arqueoData.realCashAmount === '' || isNaN(arqueoData.realCashAmount)) {
      Message("Debe ingresar el monto de efectivo contado.", "error");
      return;
    }
    
    // Obtener el resumen del sistema
    dispatch(getPreClosingSummary(posShift._id));
  }

  const cancelarCierre = () => {
    setModalCierreIsOpen(false);
    setResumenCierre(null);
    setPasoArqueo(1);
    setArqueoData({
      realCashAmount: '',
      realCardAmount: '',
      realDigitalWalletAmount: '',
      realTransferAmount: '',
      realOtherAmount: '',
      arqueoNotes: ''
    });
    Message("Cierre de caja cancelado.", "info");
  }

  // Volver al paso 1 para corregir montos
  const volverAlArqueo = () => {
    setPasoArqueo(1);
    setResumenCierre(null);
  }

  const confirmarCierre = () => {
    if (!posShift._id) {
      Message("No hay turno abierto para cerrar.", "error");
      return;
    }
    
    // Enviar datos del arqueo junto con el cierre
    dispatch(closePosShift({
      posShiftId: posShift._id,
      realCashAmount: Number(arqueoData.realCashAmount) || 0,
      realCardAmount: Number(arqueoData.realCardAmount) || 0,
      realDigitalWalletAmount: Number(arqueoData.realDigitalWalletAmount) || 0,
      realTransferAmount: Number(arqueoData.realTransferAmount) || 0,
      realOtherAmount: Number(arqueoData.realOtherAmount) || 0,
      arqueoNotes: arqueoData.arqueoNotes
    }));

    setModalCierreIsOpen(false);
    setResumenCierre(null);
    setPasoArqueo(1);
  }

  // Agregar useEffect para manejar el resultado del cierre
  useEffect(() => {

    if (isSuccessPS && messagePS === 'getPreClosingSummary' && preClosingSummary) {
      setResumenCierre(preClosingSummary.summary || preClosingSummary);
      setPasoArqueo(2); // Pasar al paso 2 (confirmación con diferencias)
    }

    // Si el cierre fue exitoso, mostrar mensaje y limpiar estados
    if (isSuccessPS && messagePS === 'closePosShift' && shiftClosingResult) {
      Message("Caja cerrada correctamente.", "success");

      // Limpiar estados
      limpiarVenta();

      // Limpiar localStorage y estado de posShift
      localStorage.removeItem("posShift");
      dispatch(resetPosShift());


      // Navegar al inicio
      //navigate("/");
      setTimeout(() => {
        navigate("/");
      }, 1000); // Esperar 1 segundo para que el usuario vea el mensaje
    }

  }, [isSuccessPS, isErrorPS, messagePS, shiftClosingResult, preClosingSummary])

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

    setFormDataCustomer((prevState) => ({
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

  const onChangePaymentMethod = (index, e) => {
    const newMetodo = e.target.value;
    setFormDataSale((prevState) => ({
      ...prevState,
      payments: prevState.payments.map((p, i) =>
        i === index ? { ...p, metodoPago: newMetodo } : p
      )
    }));
  };

  const onChangeCodigoOperacion = (index, e) => {
    const newCodigo = e.target.value;
    setFormDataSale((prevState) => ({
      ...prevState,
      payments: prevState.payments.map((p, i) =>
        i === index ? { ...p, codigoOperacion: newCodigo } : p
      )
    }));
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
    console.log("closeModal entra? ..:", posShift);
    setModalIsOpen(false);

    if (!posShift || !posShift._id) {
      navigate("/");
    }

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
    console.log("payments ...", payments);
    setFormDataSale((prevState) => ({
      ...prevState,
      payments: prevState.payments.filter((_, i) => i !== index)
    }));

    //setPagos(initialStatePayment); // <-- Reinicia el formulario de pago
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
    console.log("agregarPagos ...");
    if (productsSale.length === 0) {
      Message("No hay productos en la venta!", "error");
      return;
    }
    abrirModalPago();
  }

  const agregarCliente = () => {
    console.log("agregarCliente ...");
    openModalCustomer();
  }

  const limpiarVenta = () => {
    dispatch(reset());
    setFormDataSale(initialStateSale); // Reinicia productos y pagos
    setPagos(initialStatePayment);     // Limpia los campos de pago
    setProductSearch("");              // Limpia la búsqueda de productos
    setSearchResults([]);              // Limpia los resultados de búsqueda
    cerrarModalPago();
    // Si tienes más estados relacionados, agrégalos aquí
    if (refInputCode.current) {
      refInputCode.current.focus();    // Devuelve el foco al input de código
    }
  };

  const pagar = () => {
    console.log("pagar  !!!...");
    console.log("payments", payments);
    if (productsSale.length === 0) {
      Message("No hay productos en la venta!", "error");
      return;
    }
    if (payments.length === 0) {
      Message("Debe agregar al menos un pago!", "error");
      return;
    }
    if (montoPagado < totalVenta) {
      Message("El monto pagado es menor al total de la venta!", "error");
      return;
    }

    dispatch(reset());

    const venta = {
      documentType,
      date: new Date().toISOString(),
      //customerId: customerSale.id || 0, // Si no hay cliente, se envía 0
      posShiftId: posShift._id || "",
      /*
      customer: {
        id: customerSale.id || 0,
        documentNumber: customerSale.documentNumber || "",
        names: customerSale.names || "",
      },*/
      subtotalAmount: totalVenta / (1 + igv / 100),
      taxAmount: totalVenta - (totalVenta / (1 + igv / 100)),
      totalAmount: totalVenta,
      products: productsSale.map(p => ({
        productId: p.id,
        code: p.code,
        description: p.description,
        quantity: p.quantity,
        price: p.price,
        measure: p.measure,
        subtotal: Number(p.price) * Number(p.quantity)
      })),
      payments,
      changeAmount: montoVuelto
    }

    if (customerSale.id) {
      venta.customerId = customerSale.id;
      venta.customer = {
        customerId: customerSale.id,
        documentNumber: customerSale.documentNumber,
        names: customerSale.names
      };
    }

    console.log("venta ..:", venta);

    dispatch(createSale(venta));
  }

  useEffect(() => {
    console.log('useEffect sale ...:', isError, isSuccess, message);
    console.log('formDataSale ...:', formDataSale);
    console.log('sale ...:', sale);
    //console.log('venta ...:', venta);

    if (isError) {
      refInputCode.current.focus();
      Message(message, "error");
    }

    if (isSuccess) {
      console.log("Venta registrada exitosamente!");
      Message("Venta registrada exitosamente!", "success");
      console.log("Realizar impresión del documento!");

      // Preparar datos para impresión
      const datosImpresion = {
        products: productsSale.map(p => ({
          quantity: p.quantity,
          description: p.description,
          price: p.price,
          total: Number(p.price) * Number(p.quantity)
        })),
        payments: payments,
        customerSale: customerSale,
        date: new Date(),
        subtotalAmount: totalVenta / 1.18,
        taxAmount: totalVenta - (totalVenta / 1.18),
        totalAmount: totalVenta,
        changeAmount: montoVuelto,
        documentType: documentType
      };

      setVentaImprimir(datosImpresion);

      console.log("Realizar impresión del documento2!");

      // Imprimir después de que el componente se monte
      // funciona con react-to-print o de forma directa
      setTimeout(() => {
        console.log('boletaRef.current ..:', boletaRef.current)
        if (boletaRef.current) {
          handlePrint();
        }
      }, 500);

      limpiarVenta();
    }

  }, [isError, isSuccess, message, dispatch]);

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
    if (!montoPago || isNaN(montoPago) || Number(montoPago) <= 0) {
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

  //////////////////// Logica para manejar el modal de cliente ////////////////////
  // Estado para el modal de pagos
  const [modalCustomerIsOpen, setModalCustomerPagoIsOpen] = useState(false);



  const [formDataCustomer, setFormDataCustomer] = useState(initialStateCustomer);
  const { documentNumberCustomer, names, email, address, cellphone } = formDataCustomer;

  const refInputDocumentCustomer = useRef(null);
  const refInputNames = useRef(null);


  const {
    customers,
    customer,
    isLoading: isLoadingCustomer,
    isSuccessGet: isSuccessGetCustomer,
    isSuccess: isSuccessCustomer,
    message: messageCustomer,
    isError: isErrorCustomer,
  } = useSelector((state) => state.customer);


  // useEffect to handle customers.
  useEffect(() => {
    console.log("useEffect customers ...", customers, customer, isSuccessGetCustomer, isSuccessCustomer);

    if (isSuccessCustomer) {

      setFormDataSale((prevState) => ({
        ...prevState,
        customerId: customer._id,
        customerSale: {
          id: customer._id,
          documentNumber: customer.documentNumber,
          names: customer.names,
        }
      }));

      Message('Cliente registrado y asignado a la venta.', "info");
      setModalCustomerPagoIsOpen(false);
      //closeModalCustomer();

    }

    if (isSuccessGetCustomer) {
      if (customers.length > 0) {
        setFormDataCustomer({
          documentNumberCustomer: customers[0].documentNumber,
          names: customers[0].names,
          email: customers[0].email,
          address: customers[0].address,
          cellphone: customers[0].cellphone
        });
        Message('Cliente encontrado!!', "info");
      } else {
        Message('Cliente no registrado!! Ingresar sus datos y guardar.', "info");
      }
    }

  }, [customers, customer, isSuccessCustomer, isSuccessGetCustomer, dispatch]);

  // useEffect to handle customers.
  /*
  useEffect(() => {
    console.log("useEffect customer ...", customer, isSuccessCustomer);
    if (isSuccessCustomer) {

      setFormDataSale((prevState) => ({
        ...prevState,
        customerId: customer._id,
        customer: {
          id: customer._id,
          documentNumber: customer.documentNumber,
          names: customer.names,
        }
      }));

      Message('Cliente registrado y asignado a la venta.', "info");

    }
  }, [customer, isSuccessCustomer, dispatch]);
  */


  const onSubmitCustomer = (e) => {
    e.preventDefault();
    console.log('onSubmitCustomer');
  };

  const onKeyDownDocument = (e) => {
    console.log("onKeyDownDocument ..:", e);
    const { value = "" } = e.target;
    //if (e.key === 'Enter') {
    console.log("get product ..:", value);
    if (!isNaN(value.trim()) && value.trim() !== "" && e.key === "Enter") {

      dispatch(getCustomers({ documentNumber: value.trim() }));

    }
  };

  const openModalCustomer = () => {
    setModalCustomerPagoIsOpen(true);
    setFormDataCustomer(initialStateCustomer);
    // no puede darle el foco al input de documento porque no se ha renderizado el modal
    refInputDocumentCustomer.current.focus();
  }
  const closeModalCustomer = () => {
    setFormDataCustomer(initialStateCustomer);
    dispatch(resetCustomers());
    setModalCustomerPagoIsOpen(false);
    refInputCode.current.focus();
  };

  const cleanDataCustomer = () => {
    setFormDataCustomer(initialStateCustomer);
    dispatch(resetCustomers());
    if (refInputDocumentCustomer.current) {
      refInputDocumentCustomer.current.focus();
    }
  };

  const assignCustomer = () => {
    console.log("assignCustomer ...");
    if (customers.length === 0) {

      if (documentNumberCustomer.trim() === "" ||
        names.trim() === "") {
        Message("Debe ingresar los datos del cliente!", "error");
        return;
      }


      dispatch(createCustomer({
        documentNumber: documentNumberCustomer.trim(),
        names: names.trim(),
        email: email.trim(),
        address: address.trim(),
        cellphone: cellphone.trim()

      }));

      return;
    }
    setFormDataSale((prevState) => ({
      ...prevState,
      customerId: customers[0]._id,
      customerSale: {
        id: customers[0]._id,
        documentNumber: customers[0].documentNumber,
        names: customers[0].names,
      }
    }));
    closeModalCustomer();
  }

  const isCustomerFound = customers.length > 0;



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

        <button className="btn btn-extra btn-col-4" onClick={handleCerrarCaja}>Cerrar Caja</button>

        <button className="btn btn-extra btn-col-2" onClick={agregarCliente}>{customerSale.names ? `Cliente: ${customerSale.names.split(' ')[0]}` : 'Cliente'}</button>
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

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel="Nuevo POS">
        <h3>Apertura de Punto de Venta</h3>
        <hr></hr>
        <button className='btn-close' onClick={closeModal}>
          X
        </button>
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
              onClick={montoPagado >= totalVenta ? pagar : agregarPago}
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
                <div>

                  <select
                    className="form-control"
                    name="metodoPago"
                    value={pago.metodoPago}
                    onChange={e => onChangePaymentMethod(index, e)}
                    style={{ height: "20px", fontSize: "12px", padding: "2px 5px" }}
                  >


                    {paymentMethods.map((paymentMethod) => (
                      <option key={paymentMethod.name} value={paymentMethod.name}>
                        {paymentMethod.name}
                      </option>
                    ))}

                  </select>


                </div>
                <div>{pago.montoPago}</div>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    value={pago.codigoOperacion}
                    onChange={e => onChangeCodigoOperacion(index, e)}
                    placeholder="Código operación"
                    style={{ height: "20px", fontSize: "12px", padding: "2px 5px" }}
                  />
                </div>
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
            fontSize: "14px",
            marginTop: "16px",
            borderTop: "1px solid #eee",
            paddingTop: "10px",
            background: "#fff"
          }}>
            <span>Total a pagar: S/. {totalVenta.toFixed(2)}</span>
            <span style={{ color: "#007bff" }}>Monto pagado: S/. {montoPagado.toFixed(2)}</span>
            <span style={{ color: montoRestante > 0 ? "red" : "green" }}>
              {montoRestante > 0
                ? <>Monto restante: S/. {montoRestante.toFixed(2)}</>
                : <>Vuelto: S/. {montoVuelto.toFixed(2)}</>
              }
            </span>
          </div>

        </div>

      </Modal>

      <Modal isOpen={modalCustomerIsOpen} onRequestClose={closeModalCustomer} style={customStyles} contentLabel='Cliente'>
        <h3>Busqueda de Cliente</h3>
        <hr></hr>

        <button className='btn-close' onClick={closeModalCustomer}>
          X
        </button>
        <br></br>

        <section className="form">
          <div className="form-group">
            <table style={{ width: '100%' }}>
              <colgroup>
                <col style={{ width: '30%' }} />
                <col style={{ width: '70%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="name">Documento ..:</label>
                  </td>
                  <td>

                    <input
                      type='text'
                      className='form-control'
                      id='documentNumberCustomer'
                      name='documentNumberCustomer'
                      value={documentNumberCustomer}
                      onChange={onChange}
                      onKeyDown={onKeyDownDocument}
                      placeholder='Ingrese documento'
                      required
                      ref={refInputDocumentCustomer}
                      disabled={isCustomerFound}
                    />

                  </td>
                </tr>

                <tr>
                  <td>
                    <label htmlFor="name">Nombres ..:</label>
                  </td>
                  <td>
                    <input
                      type='text'
                      className='form-control'
                      id='names'
                      name='names'
                      value={names}
                      onChange={onChange}
                      placeholder='Ingrese nombres completos'
                      required
                      ref={refInputNames}
                      disabled={isCustomerFound}
                    />
                  </td>
                </tr>

                <tr>
                  <td>
                    <label htmlFor="name">Correo ..:</label>
                  </td>
                  <td>
                    <input
                      type='text'
                      className='form-control'
                      id='email'
                      name='email'
                      value={email}
                      onChange={onChange}
                      placeholder='Ingrese correo'
                      disabled={isCustomerFound}
                    />

                  </td>
                </tr>

                <tr>
                  <td>
                    <label htmlFor="name">Dirección ..:</label>
                  </td>
                  <td>
                    <input
                      type='text'
                      className='form-control'
                      id='address'
                      name='address'
                      value={address}
                      onChange={onChange}
                      placeholder='Ingrese dirección'
                      disabled={isCustomerFound}
                    />

                  </td>
                </tr>

                <tr>
                  <td>
                    <label htmlFor="name">Celular ..:</label>
                  </td>
                  <td>
                    <input
                      type='text'
                      className='form-control'
                      id='cellphone'
                      name='cellphone'
                      value={cellphone}
                      onChange={onChange}
                      placeholder='Ingrese celular'
                      disabled={isCustomerFound}
                    />

                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-block" onClick={cleanDataCustomer}>Reiniciar búsqueda</button>
              <button className="btn btn-block" onClick={assignCustomer}>{customers.length === 0 ? 'Registrar y Asignar' : 'Asignar'}</button>
            </div>
          </div>
        </section>

      </Modal>

      <Modal
        isOpen={modalCierreIsOpen}
        onRequestClose={() => setModalCierreIsOpen(false)}
        style={customStyles}
        contentLabel="Arqueo y Cierre de Caja"
      >
        {/* ========== PASO 1: ARQUEO - Cajero ingresa montos reales ========== */}
        {pasoArqueo === 1 && (
          <>
            <div style={{
              backgroundColor: "#d4edda",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
              border: "1px solid #c3e6cb",
              textAlign: "center"
            }}>
              <strong>💰 PASO 1: Cuente el dinero e ingrese los montos</strong>
            </div>
            
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px", textAlign: "center" }}>
              Cuente todo el dinero físicamente y luego ingrese los montos. <br/>
              <b>No cierre esta ventana hasta terminar de contar.</b>
            </p>
            
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "8px", fontWeight: "bold" }}>💵 Efectivo en caja:</td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="text"
                      name="realCashAmount"
                      value={arqueoData.realCashAmount}
                      onChange={onChangeArqueo}
                      placeholder="0.00"
                      className="form-control"
                      style={{ textAlign: "right", fontWeight: "bold", fontSize: "16px" }}
                      autoFocus
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>💳 Vouchers de tarjeta:</td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="text"
                      name="realCardAmount"
                      value={arqueoData.realCardAmount}
                      onChange={onChangeArqueo}
                      placeholder="0.00"
                      className="form-control"
                      style={{ textAlign: "right" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>📱 Yape / Plin / Billeteras:</td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="text"
                      name="realDigitalWalletAmount"
                      value={arqueoData.realDigitalWalletAmount}
                      onChange={onChangeArqueo}
                      placeholder="0.00"
                      className="form-control"
                      style={{ textAlign: "right" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>🏦 Transferencias:</td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="text"
                      name="realTransferAmount"
                      value={arqueoData.realTransferAmount}
                      onChange={onChangeArqueo}
                      placeholder="0.00"
                      className="form-control"
                      style={{ textAlign: "right" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>📋 Otros:</td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="text"
                      name="realOtherAmount"
                      value={arqueoData.realOtherAmount}
                      onChange={onChangeArqueo}
                      placeholder="0.00"
                      className="form-control"
                      style={{ textAlign: "right" }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px", verticalAlign: "top" }}>📝 Observaciones:</td>
                  <td style={{ padding: "8px" }}>
                    <textarea
                      name="arqueoNotes"
                      value={arqueoData.arqueoNotes}
                      onChange={onChangeArqueo}
                      placeholder="Notas adicionales (opcional)"
                      className="form-control"
                      rows={2}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              justifyContent: "center"
            }}>
              <button
                className="btn"
                onClick={cancelarCierre}
                style={{ flex: 1, backgroundColor: "#6c757d", color: "white" }}
              >
                ❌ Cancelar
              </button>
              <button
                className="btn"
                onClick={continuarAlResumen}
                style={{ flex: 1, backgroundColor: "#007bff", color: "white" }}
              >
                ➡️ Continuar
              </button>
            </div>
          </>
        )}

        {/* ========== PASO 2: CONFIRMACIÓN - Mostrar diferencias ========== */}
        {pasoArqueo === 2 && resumenCierre && (
          <>
            <div style={{
              backgroundColor: "#fff3cd",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
              border: "1px solid #ffeaa7",
              textAlign: "center"
            }}>
              <strong>📊 PASO 2: Revise las diferencias antes de confirmar</strong>
            </div>

            {/* Resumen de ventas */}
            <div style={{ marginBottom: "15px" }}>
              <p><b>Total ventas:</b> {resumenCierre.totalSales}</p>
              <p><b>Monto inicial:</b> S/. {Number(resumenCierre.initialAmount).toFixed(2)}</p>
              <p><b>Monto total ventas:</b> S/. {Number(resumenCierre.totalAmount).toFixed(2)}</p>
              <p><b>Vueltos entregados:</b> S/. {Number(resumenCierre.totalChangeAmount).toFixed(2)}</p>
            </div>
            
            <hr />
            
            {/* Tabla de comparación */}
            <h4 style={{ marginBottom: "10px" }}>Comparación por método de pago:</h4>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th style={{ padding: "8px", textAlign: "left" }}>Método</th>
                  <th style={{ padding: "8px", textAlign: "right" }}>Esperado</th>
                  <th style={{ padding: "8px", textAlign: "right" }}>Contado</th>
                  <th style={{ padding: "8px", textAlign: "right" }}>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {/* Efectivo */}
                {(() => {
                  const esperado = Number(resumenCierre.expectedCash || resumenCierre.initialAmount + (resumenCierre.paymentMethods?.cash || 0) - (resumenCierre.totalChangeAmount || 0));
                  const contado = Number(arqueoData.realCashAmount) || 0;
                  const diff = contado - esperado;
                  return (
                    <tr>
                      <td style={{ padding: "8px" }}>💵 Efectivo</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>S/. {esperado.toFixed(2)}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>S/. {contado.toFixed(2)}</td>
                      <td style={{ 
                        padding: "8px", 
                        textAlign: "right", 
                        fontWeight: "bold",
                        color: diff < 0 ? "#dc3545" : diff > 0 ? "#28a745" : "#000"
                      }}>
                        {diff >= 0 ? "+" : ""}{diff.toFixed(2)}
                      </td>
                    </tr>
                  );
                })()}
                
                {/* Tarjeta */}
                {(() => {
                  const esperado = Number(resumenCierre.paymentMethods?.card || 0);
                  const contado = Number(arqueoData.realCardAmount) || 0;
                  const diff = contado - esperado;
                  return (
                    <tr>
                      <td style={{ padding: "8px" }}>💳 Tarjeta</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>S/. {esperado.toFixed(2)}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>S/. {contado.toFixed(2)}</td>
                      <td style={{ 
                        padding: "8px", 
                        textAlign: "right", 
                        fontWeight: "bold",
                        color: diff < 0 ? "#dc3545" : diff > 0 ? "#28a745" : "#000"
                      }}>
                        {diff >= 0 ? "+" : ""}{diff.toFixed(2)}
                      </td>
                    </tr>
                  );
                })()}
                
                {/* Billeteras digitales */}
                {(() => {
                  const esperado = Number(resumenCierre.paymentMethods?.digitalWallet || 0);
                  const contado = Number(arqueoData.realDigitalWalletAmount) || 0;
                  const diff = contado - esperado;
                  return (
                    <tr>
                      <td style={{ padding: "8px" }}>📱 Billeteras</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>S/. {esperado.toFixed(2)}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>S/. {contado.toFixed(2)}</td>
                      <td style={{ 
                        padding: "8px", 
                        textAlign: "right", 
                        fontWeight: "bold",
                        color: diff < 0 ? "#dc3545" : diff > 0 ? "#28a745" : "#000"
                      }}>
                        {diff >= 0 ? "+" : ""}{diff.toFixed(2)}
                      </td>
                    </tr>
                  );
                })()}
                
                {/* Transferencias */}
                {(() => {
                  const esperado = Number(resumenCierre.paymentMethods?.transfer || 0);
                  const contado = Number(arqueoData.realTransferAmount) || 0;
                  const diff = contado - esperado;
                  return (
                    <tr>
                      <td style={{ padding: "8px" }}>🏦 Transferencia</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>S/. {esperado.toFixed(2)}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>S/. {contado.toFixed(2)}</td>
                      <td style={{ 
                        padding: "8px", 
                        textAlign: "right", 
                        fontWeight: "bold",
                        color: diff < 0 ? "#dc3545" : diff > 0 ? "#28a745" : "#000"
                      }}>
                        {diff >= 0 ? "+" : ""}{diff.toFixed(2)}
                      </td>
                    </tr>
                  );
                })()}
                
                {/* TOTAL */}
                {(() => {
                  const esperadoEfectivo = Number(resumenCierre.expectedCash || resumenCierre.initialAmount + (resumenCierre.paymentMethods?.cash || 0) - (resumenCierre.totalChangeAmount || 0));
                  const esperadoTotal = esperadoEfectivo + 
                    Number(resumenCierre.paymentMethods?.card || 0) +
                    Number(resumenCierre.paymentMethods?.digitalWallet || 0) +
                    Number(resumenCierre.paymentMethods?.transfer || 0) +
                    Number(resumenCierre.paymentMethods?.others || 0);
                  const contadoTotal = 
                    (Number(arqueoData.realCashAmount) || 0) +
                    (Number(arqueoData.realCardAmount) || 0) +
                    (Number(arqueoData.realDigitalWalletAmount) || 0) +
                    (Number(arqueoData.realTransferAmount) || 0) +
                    (Number(arqueoData.realOtherAmount) || 0);
                  const diffTotal = contadoTotal - esperadoTotal;
                  return (
                    <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
                      <td style={{ padding: "10px" }}>📊 TOTAL</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>S/. {esperadoTotal.toFixed(2)}</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>S/. {contadoTotal.toFixed(2)}</td>
                      <td style={{ 
                        padding: "10px", 
                        textAlign: "right", 
                        fontSize: "16px",
                        color: diffTotal < 0 ? "#dc3545" : diffTotal > 0 ? "#28a745" : "#000"
                      }}>
                        {diffTotal >= 0 ? "+" : ""}S/. {diffTotal.toFixed(2)}
                        {diffTotal < 0 && " ⚠️"}
                        {diffTotal > 0 && " ✅"}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>

            {/* Observaciones */}
            {arqueoData.arqueoNotes && (
              <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px" }}>
                <b>📝 Observaciones:</b> {arqueoData.arqueoNotes}
              </div>
            )}

            <div style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              justifyContent: "center"
            }}>
              <button
                className="btn"
                onClick={volverAlArqueo}
                style={{ flex: 1, backgroundColor: "#6c757d", color: "white" }}
              >
                ⬅️ Corregir montos
              </button>
              <button
                className="btn"
                onClick={cancelarCierre}
                style={{ flex: 1, backgroundColor: "#ffc107", color: "#000" }}
              >
                ❌ Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmarCierre}
                style={{ flex: 1, backgroundColor: "#dc3545", color: "white" }}
              >
                ✅ Confirmar Cierre
              </button>
            </div>
          </>
        )}

        {/* Loading state */}
        {pasoArqueo === 2 && !resumenCierre && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Cargando resumen...</p>
          </div>
        )}
      </Modal>

      {ventaImprimir &&

        <div style={{ display: "none" }}>
          <BoletaPrint ref={boletaRef} venta={ventaImprimir} />
        </div>

      }

    </div>


  );

}

export default Ventas;
