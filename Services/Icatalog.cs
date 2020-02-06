using CasierV2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public interface Icatalog 
    {
        Task<IEnumerable<InvoiceHeaderSet>> getInvoiceHeaderByDate(DateTime searchDate);
    }
}
