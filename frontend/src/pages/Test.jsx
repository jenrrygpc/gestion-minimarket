import { useReactToPrint } from "react-to-print";
import { useRef, useEffect } from "react";
import Print from "../components/Print";

function Test() {
  const contentRef = useRef(null);

  const reactToPrintFn = useReactToPrint({
    contentRef,
  });

  const total = 111.50; // Example total amount
  const productos = [
    { nombre: "Galletas", cantidad: 12, precio: 17.00 },
    { nombre: "Leche", cantidad: 11, precio: 14.50 },
  ];

  // Ejecutar impresión automática después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Ejecutando impresión automática...");
      reactToPrintFn();
    }, 5000); // 5000ms = 5 segundos

    // Cleanup: limpiar el timer si el componente se desmonta
    return () => clearTimeout(timer);
  }, []); // Array vacío = solo se ejecuta una vez al montar

  return (
    <div className="container">
      <h1>Prueba</h1>
      <p>Está aplicación está encargada de gestionar el funcionamiento del minimarket.</p>
      <Print ref={contentRef} productos={productos} />
      <button onClick={reactToPrintFn} className="btn btn-primary">
        Print
      </button>

    </div>

  );
}

export default Test;