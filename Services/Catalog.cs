using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CasierV2;

namespace Services
{
    public class Catalog : Icatalog
    {
        async public Task<IEnumerable<InvoiceHeaderSet>> getInvoiceHeaderByDate(DateTime searchDate)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    context.Configuration.ProxyCreationEnabled = false;
                    context.Configuration.LazyLoadingEnabled = false;
                    context.Configuration.ValidateOnSaveEnabled = false;

                    return context.InvoiceHeaderSet.Include("InvoiceHeaderDetailsSet.ItemSet").Where(u => u.Number != null && u.PayDate == null && u.Description == null && u.ReservationSet == null && searchDate.Month.Equals(u.CreateDate.Value.Month) && searchDate.Day.Equals(u.CreateDate.Value.Day) && searchDate.Year.Equals(u.CreateDate.Value.Year)).Select(x => x);



                }
            });
        }

        Task<IEnumerable<InvoiceHeaderSet>> Icatalog.getInvoiceHeaderByDate(DateTime searchDate)
        {
            throw new NotImplementedException();
        }
    }
}
