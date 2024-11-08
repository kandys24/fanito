import React, { useEffect, useState } from 'react';
import setCurrencyFormat from '../../../constant/setCurrencyFormat';
import { API_URL } from '../../../constant/config';
import formatDate from '../../../constant/formatDate';
import calculateNewDate from '../../../constant/calculateNewDate';
import taxExemptionCodes from '../../../constant/taxExemptionCodes';

const ReceiptComponent = ({ invoice, items, companyDetails, bankAccounts, docCustomizations, receipt, cancellationReason }) => {
    const [exemptionReasons, setexemptionReasons] = useState(null);
    const [totalsArray, setTotalsArray] = useState([]);
    // Dynamic data from props
    const company = {
      company: companyDetails.companyName,
      address: companyDetails.address,
      telefone: companyDetails.phone,
      email: companyDetails.email,
      contribuinte: companyDetails.taxpayerNumber,
    };
  
    const formData = {
      clientname: invoice.client_name,
      clientphone: invoice.client_phone, // Assuming this is a field in invoice
      nif: invoice.client_tax_id,
    };
  
    const cart = items.map(item => ({
      code: item.item_code, // Assuming item_code is used as ID
      description: item.description,
      unit_price: item.unit_price,
      quantity: item.quantity,
      discount: item.discount_amount?.toFixed(2),
      tax_rate: item.tax_rate,
      exemption_reason: item.exemption_reason,
      exemption_code: taxExemptionCodes.find(code => code.name === item.exemption_reason)?.code,
    }));
  
    useEffect(() => {
      // Calculate totals whenever the carts change
      const calculateTotals = () => {
          let sum = 0;
          let discount = 0;
          let retention = 0;
          let withoutTax = 0;
          let tax = 0;
  
          // New object to store the incidence and corresponding tax for each tax rate (Taxa14, Isento)
          const totalsArray = {};
  
          items.forEach(item => {
              const price = parseFloat(item.unit_price) || 0;
              const quantity = parseFloat(item.quantity) || 0;
              const itemTotal = price * quantity;
              
              const itemDiscount = ((parseFloat(item.discount_amount) || 0) / 100) * itemTotal;
              const itemTaxRate = parseFloat(item.tax_rate) || 0;
              const itemIncidence = itemTotal - itemDiscount;
              const itemTax = (itemTaxRate / 100) * itemIncidence;
  
              sum += itemTotal;
              discount += itemDiscount;
              withoutTax += itemTotal;
              tax += itemTax;
  
              // Identify the tax category (Taxa14, Isento) and accumulate the values
              const taxCategory = itemTaxRate > 0 ? `Taxa${itemTaxRate} (${itemTaxRate}%)` : `Isento (0%)`;
  
              if (!totalsArray[taxCategory]) {
                  totalsArray[taxCategory] = {
                      incidence: 0,
                      taxAmount: 0
                  };
              }
  
              totalsArray[taxCategory].incidence += itemIncidence;
              totalsArray[taxCategory].taxAmount += itemTax;
          });
  
          // Convert totalsArray into a proper array with formatted numbers (without currency symbols)
          const formattedTotalsArray = Object.keys(totalsArray).map(taxCategory => ({
              taxRate: taxCategory,
              incidence: totalsArray[taxCategory].incidence, // Incidência (total without tax)
              taxAmount: totalsArray[taxCategory].taxAmount // Valor (tax amount)
          }));
  
          const totalWithTax = withoutTax + tax - discount;
  
          // Set the totals for the entire cart
          // setTotal({
          //     sum: sum,
          //     discount: discount,
          //     withoutTax: withoutTax - discount,
          //     tax: tax,
          //     totalWithTax: totalWithTax,
          //     totalTax: tax
          // });
  
          // Log or store the formatted totals array
          // console.log(formattedTotalsArray);
          setTotalsArray(formattedTotalsArray); // If you want to store the array in state
      };
  
      calculateTotals();
  }, [items]);
  
  
  
    const total = cart.reduce((sum, product) => sum + product.unit_price * product.quantity, 0);
  
    const changeIfenData = () => new Date().toLocaleDateString();
    const lastSalesId = invoice.invoice_id; // Using the invoice ID
    const uname = 'Operador XYZ'; // This may need to be dynamic based on your context
    const invotype = invoice?.document_type === 'Proforma' ? 'Factura Proforma' : invoice?.document_type === 'Invoice' ? 'Factura' : 'Factura/Recibo';
  
    
  
    useEffect(()=>{
      const exemptionReason = [];
  
      cart.forEach(item => {
        // Check if an item with the same exemption_reason and exemption_code already exists in the exemptionReason array
        const exists = exemptionReason.some(existingItem => 
          existingItem.exemption_reason === item.exemption_reason &&
          existingItem.exemption_code === item.exemption_code
        );
  
        // If it doesn't exist, add the item to the exemptionReason array
        if (!exists) {
          
          if(Number(item.tax_rate) === 0){
            exemptionReason.push({
              exemption_reason: item.exemption_reason,
              exemption_code: item.exemption_code
            });
          }
        }
      });
  
      setexemptionReasons(exemptionReason)
    },[invoice]);
    
    // console.log(exemptionReasons);
  
    return (
        <div className='dark:text-black' style={{ minWidth: '210mm', minHeight: '297mm', padding: '20mm', boxSizing: 'border-box', fontSize: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor:'white' }}>
            {/* Main content */}
            <div style={{ flexGrow: 1, position: 'relative' }}>
                <div 
                    className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl text-red-300 z-0'
                    style={{ transform: 'translate(-50%, -50%) rotate(-30deg)' }}
                >
                    {receipt.status === 'canceled' && 'Canceled'}
                </div>
                {/* Header */}
                <div className='mb-5'>
                    <img src={API_URL+docCustomizations.logoUrl} width={200} alt="logo" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <div className='max-w-[45%]'>
                        <div>
                            <strong className='text-sm font-bold'>{company.company}</strong>
                            {company.address&&<p>{company.address}</p>}
                            {company.telefone&&<p><span className='font-semibold'>Contact:</span> {company.telefone}</p>}
                            {company.email&&<p><span className='font-semibold'>Email:</span> {company.email}</p>}
                            {company.contribuinte&&<p><span className='font-semibold'>Tax ID:</span> {company.contribuinte}</p>}
                        </div>
                    </div>
                    <div className='max-w-[45%]'>
                        {<strong className='text-sm font-bold'>{'Receipt'}: {receipt.receipt_code}</strong>}
                        <p>Honorable Mr.(s),</p>
                        <strong className='text-sm font-bold'>{formData.clientname}</strong>
                        {formData.clientphone&&<p>Contact: {formData.clientphone}</p>}
                        <p>{formData.nif ? `Tax ID: ${formData.nif}` : 'Final consumer'}</p>
                        {invoice.client_city&&<p>{invoice.client_city}</p>}
                        {invoice.client_address&&<p>{invoice.client_address}</p>}
                    </div>
                </div>
    
                <div className='flex gap-[5%] my-1 text-xs text-black '>
                    <div className='w-[20%]'>
                        <div className="flex gap-2 border-b-[1px] border-black">
                            {/* Header Row */}
                            <div className="flex-1 py-[5px]">Date</div>
                        </div>
                        <div className={`mb-2`}>
                            {/* Product Details Row */}
                            <div className="flex text-gray-700 flex-row gap-2 py-0 rounded">
                                <div className="flex-1 py-[5px]">{formatDate(receipt.created_at)}</div>
                            </div>
                        </div>
                    </div>
                    <div className='w-[25%]'>
                        <div className="flex gap-2 border-b-[1px] border-black">
                            {/* Header Row */}
                            <div className="flex-1 py-[5px]">Due Date</div>
                        </div>
                        <div className={`mb-2`}>
                            {/* Product Details Row */}
                            <div className="flex text-gray-700 flex-row gap-2 py-0 rounded">
                                <div className="flex-1 py-[5px]">{formatDate(receipt.document_date)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Product Table */}
                <table className='relative z-10' style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #000' }}>
                            <th style={{ textAlign: 'left', padding: '5px 0' }}>Document</th>
                            <th style={{ textAlign: 'left', padding: '5px 5px' }}>Number</th>
                            <th style={{ textAlign: 'right', padding: '5px 0' }}>Invoiced</th>
                            <th style={{ textAlign: 'right', padding: '5px 5px' }}>Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '5px 0' }}>{'Factura'}</td>
                            <td style={{ padding: '5px 5px' }}>{invoice.invoice_code}</td>
                            <td style={{ textAlign: 'right', padding: '5px 0' }}>{setCurrencyFormat(invoice.total_amount)}</td>
                            <td style={{ textAlign: 'right', padding: '5px 5px' }}>{setCurrencyFormat(receipt.paid)}</td>
                        </tr>
                    </tbody>
                </table>
    
                {/* Summary */}
                <div className='flex items-start justify-between relative z-10'>
                    <div className='text-xs text-black mt-5 w-1/2'>
                        <div className="flex gap-2 border-b-[2px] border-black">
                            {/* Header Row */}
                            <div className="flex-1 py-[5px]">Tax/VAT</div>
                            <div className="flex-1 py-[5px] text-center">Incidence</div>
                            <div className="flex-1 py-[5px] text-end">Amount</div>
                        </div>
                        {totalsArray&&<div className={`mb-2`}>
                            {/* Product Details Row */}
                            {totalsArray?.map((item, i)=><div key={i} className="flex text-gray-900 flex-row gap-2 py-0 rounded">
                                <div className="flex-1 py-[5px]">{item.taxRate}</div>
                                <div className="flex-1 py-[5px] text-center">{setCurrencyFormat(item.incidence)}</div>
                                <div className="flex-1 py-[5px] text-end">{setCurrencyFormat(item.taxAmount)}</div>
                            </div>)}
                        </div>}
                    </div>
                    <table className='mt-5 w-2/5' style={{ borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <thead>
                            <tr style={{ borderBottom: '0px solid #000' }}>
                                <th className='font-bold text-left py-[5px]'>Summary</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className='font-bold' style={{ borderTop: '2px solid #000' }}>
                                <td className='py-[5px]'>Total:</td>
                                <td style={{ textAlign: 'right', padding: '5px 0' }}>{setCurrencyFormat(invoice.total_amount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {cancellationReason && <div className='text-xs text-black mt-5 w-1/2 relative z-10'>
                    <div className="flex gap-2 border-b-[2px] border-black">
                        {/* Header Row */}
                        <div className="flex-1 py-[5px]">Cancellation reason</div>
                    </div>
                    <div className={`mb-2 text-gray-900`}>
                        {/* Product Details Row */}
                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className=" py-[5px]">{cancellationReason.cancellation_reason}</div>
                        </div>
                    </div>
                </div>}
            
                {receipt && <div className='text-xs text-black mt-5 w-1/2 relative z-10'>
                    <div className="flex gap-2 border-b-[2px] border-black">
                        {/* Header Row */}
                        <div className="flex-1 py-[5px]">Payment method</div>
                    </div>
                    <div className={`mb-2 text-gray-900`}>
                        {/* Product Details Row */}

                        <div className="flex flex-row gap-2 py-0 rounded">
                            <div className=" py-[5px]">{receipt.payment_method}</div>
                        </div>
                    </div>
                </div>}
            </div>
  
            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
                <h3 className='text-gray-800'>{docCustomizations.footer}</h3>
                <p className='text-[#999999]'>Processed by validated program no. 144/AGT/2019 | Fanito</p>
                {/* <p className='text-[#999999]'>This document does not serve as an invoice</p> */}
            </div>
        </div>
    );
};
  

export default ReceiptComponent