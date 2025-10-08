import React, { forwardRef } from 'react';

const Print = forwardRef(({ productos, total }, ref) => {

  const [producto1, producto2] = productos;


  console.log('Print venta ...:', productos);
  console.log('Print ref ...:', ref);


  return (

    <div ref={ref}>
      <h1>Contenido para imprimir</h1>
      <p>Este es el contenido que se imprimirá cuando se active la función de impresión.</p>

      {/* Puedes agregar más contenido aquí */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Producto</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Cantidad</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Precio</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px' }}>{producto1.nombre}</td>
            <td style={{ border: '1px solid #000', padding: '8px' }}>{producto1.cantidad}</td>
            <td style={{ border: '1px solid #000', padding: '8px' }}>S/. {producto1.precio}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px' }}>{producto2.nombre}</td>
            <td style={{ border: '1px solid #000', padding: '8px' }}>{producto2.cantidad}</td>
            <td style={{ border: '1px solid #000', padding: '8px' }}>S/. {producto2.precio}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <p><strong>Total: S/. {total}</strong></p>
      </div>

    </div>

  );
});

export default Print;