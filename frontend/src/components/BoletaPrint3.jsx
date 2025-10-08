import React, { forwardRef } from "react";

const BoletaPrint = forwardRef(({ venta }, ref) => {
  if (!venta) return null;
  
  const {
    products = [],
    payments = [],
    customerSale = {},
    date = new Date(),
    subtotalAmount = 0,
    taxAmount = 0,
    totalAmount = 0,
    changeAmount = 0,
    documentType = "BOLETA"
  } = venta;

  return (
    <div ref={ref}>
      {/* Cabecera */}
      <div style={{ textAlign: "center", marginBottom: "3mm" }}>
        <div style={{ fontSize: "14px", fontWeight: "bold" }}>MINIMARKET XYZ</div>
        <div style={{ fontSize: "10px" }}>RUC: 20123456789</div>
        <div style={{ fontSize: "10px" }}>Av. Principal 123</div>
        <div style={{ fontSize: "10px" }}>Tel: (01) 234-5678</div>
        <div style={{ borderTop: "1px dashed #000", margin: "2mm 0" }}></div>
        <div style={{ fontSize: "12px", fontWeight: "bold" }}>{documentType} DE VENTA</div>
      </div>

      {/* Información de venta */}
      <div style={{ fontSize: "10px", marginBottom: "3mm" }}>
        <div>Fecha: {new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}</div>
        {customerSale.names && (
          <>
            <div>Cliente: {customerSale.names}</div>
            <div>Doc: {customerSale.documentNumber}</div>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "2mm 0" }}></div>

      {/* Productos */}
      <div style={{ fontSize: "10px" }}>
        {products.map((product, index) => (
          <div key={index} style={{ marginBottom: "1mm" }}>
            <div style={{ fontWeight: "bold" }}>{product.description}</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{product.quantity} x S/. {Number(product.price).toFixed(2)}</span>
              <span>S/. {(Number(product.price) * Number(product.quantity)).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "2mm 0" }}></div>

      {/* Totales */}
      <div style={{ fontSize: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Sub Total:</span>
          <span>S/. {Number(subtotalAmount).toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>IGV (18%):</span>
          <span>S/. {Number(taxAmount).toFixed(2)}</span>
        </div>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          fontWeight: "bold",
          borderTop: "1px solid #000",
          paddingTop: "1mm",
          marginTop: "1mm"
        }}>
          <span>TOTAL:</span>
          <span>S/. {Number(totalAmount).toFixed(2)}</span>
        </div>
      </div>

      {/* Pagos */}
      {payments.length > 0 && (
        <>
          <div style={{ borderTop: "1px dashed #000", margin: "2mm 0" }}></div>
          <div style={{ fontSize: "10px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "1mm" }}>PAGOS:</div>
            {payments.map((payment, index) => (
              <div key={index} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{payment.metodoPago}:</span>
                <span>S/. {Number(payment.montoPago).toFixed(2)}</span>
              </div>
            ))}
            {changeAmount > 0 && (
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                fontWeight: "bold" 
              }}>
                <span>VUELTO:</span>
                <span>S/. {Number(changeAmount).toFixed(2)}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Pie de página */}
      <div style={{ 
        textAlign: "center", 
        marginTop: "4mm", 
        fontSize: "10px",
        borderTop: "1px dashed #000",
        paddingTop: "2mm"
      }}>
        <div>¡Gracias por su compra!</div>
        <div>Vuelva pronto</div>
      </div>
    </div>
  );
});

BoletaPrint.displayName = 'BoletaPrint';
export default BoletaPrint;