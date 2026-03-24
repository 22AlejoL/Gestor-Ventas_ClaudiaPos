import React from 'react';
import { Sale } from '../../types';

interface InvoiceReceiptProps {
  sale: Sale;
  businessName?: string;
}

const InvoiceReceipt = React.forwardRef<HTMLDivElement, InvoiceReceiptProps>(({ sale, businessName = "Mi Negocio" }, ref) => {
  return (
    <div ref={ref} className="p-6 bg-white max-w-sm mx-auto text-black font-sans" style={{ width: '300px' }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold uppercase">{businessName}</h2>
        <p className="text-sm text-gray-500">Ticket de Venta</p>
        <p className="text-xs text-gray-400 mt-1">Fecha: {new Date(sale.date).toLocaleString()}</p>
        <p className="text-xs text-gray-400">ID Venta: {sale.id}</p>
      </div>

      <div className="border-t border-b border-gray-300 py-3 mb-4">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span className="w-1/2">Cant x Artículo</span>
          <span className="w-1/4 text-right">Precio</span>
          <span className="w-1/4 text-right">Total</span>
        </div>
          {sale.items?.map((item, index) => (
            <div key={index} className="flex justify-between items-start text-sm mb-2">
              <div className="flex-1 pr-3 min-w-0">
                <div className="font-bold break-words whitespace-normal leading-tight">
                  {item.quantity} x {item.productName || 'Producto'}
                </div>
              </div>
              <div className="text-right whitespace-nowrap pl-2">
                <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                {item.quantity > 1 && (
                  <div className="text-xs text-slate-500 mt-0.5">${item.price.toFixed(2)} c/u</div>
                )}
              </div>
            </div>
          ))}
      </div>

      <div className="flex justify-between font-bold text-lg mb-4">
        <span>TOTAL</span>
        <span>${sale.total.toFixed(2)}</span>
      </div>

      <div className="text-xs space-y-1 mb-6">
        <div className="flex justify-between">
          <span>Método de Pago:</span>
          <span>{sale.paymentMethod}</span>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-8 border-t border-gray-300 pt-4">
        <p>¡Gracias por su compra!</p>
        <p className="mt-1">Vuelva pronto</p>
      </div>
      
      {/* Hide printing instructions when printed */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-receipt-container, .print-receipt-container * {
              visibility: visible;
            }
            .print-receipt-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
            }
          }
        `}
      </style>
    </div>
  );
});

export default InvoiceReceipt;
