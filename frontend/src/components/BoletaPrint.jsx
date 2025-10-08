import React, { forwardRef } from "react";

const BoletaPrint = forwardRef(({ venta }, ref) => {

    console.log('BoletaPrint venta ...:', venta);
    console.log('BoletaPrint ref ...:', ref);

    return (

        <div ref={ref} style={{ width: "280px", fontFamily: "monospace", padding: "10px" }}>
            <h2 style={{ textAlign: "center" }}>MINIMARKET</h2>
            <hr />
            <div>
                <b>Fecha:</b> {new Date(venta.date).toLocaleString()}<br />
                <b>Cliente:</b> {venta.customerSale?.names || "Consumidor Final"}
            </div>
            <hr />
            <table style={{ width: "100%", fontSize: "12px" }}>
                <thead>
                    <tr>
                        <th>Cant</th>
                        <th>Desc</th>
                        <th>Precio</th>
                        <th>Subt</th>
                    </tr>
                </thead>
                <tbody>
                    {venta.products.map((p, idx) => (
                        <tr key={idx}>
                            <td>{p.quantity}</td>
                            <td>{p.description}</td>
                            <td>{Number(p.price).toFixed(2)}</td>
                            <td>{(Number(p.price) * Number(p.quantity)).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr />
            <div>
                <b>SubTotal:</b> S/. {venta.subtotalAmount.toFixed(2)}<br />
                <b>IGV:</b> S/. {venta.taxAmount.toFixed(2)}<br />
                <b>Total:</b> S/. {venta.totalAmount.toFixed(2)}<br />
                <b>Pagos:</b>
                <ul>
                    {venta.payments.map((p, idx) => (
                        <li key={idx}>{p.metodoPago}: S/. {Number(p.montoPago).toFixed(2)}</li>
                    ))}
                </ul>
                <b>Vuelto:</b> S/. {Number(venta.changeAmount).toFixed(2)}
            </div>
            <hr />
            <div style={{ textAlign: "center" }}>¡Gracias por su compra!</div>
        </div>
    );
});

export default BoletaPrint;