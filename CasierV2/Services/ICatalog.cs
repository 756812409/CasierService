using CasierV2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public interface ICatalog 
    {
        Task<IEnumerable<InvoiceHeaderDetailsSet>> getInvoiceHeaderDetails(DateTime searchDate);  
        Task<IEnumerable<InvoiceHeaderSet>> getInvoiceHeaderByDateAsync(DateTime searchDate);
        Task<IEnumerable<InvoiceHeaderSet>> getOrderInvoiceHeaderByDateAsync(DateTime searchDate);
        
        Task<IEnumerable<CategorySet>> getCategoryAndMenuAsync();

        Task<IEnumerable<InvoiceHeaderSet>> GetpaidItems(DateTime searchDate);
        Task<InvoiceHeaderSet> InsertInvoiceDeitails(int invoiceHeader, int quantity, string number);
        Task<bool> DeleteEmpyItems(InvoiceHeaderSet invoiceHeaderSet);

        Task<IEnumerable<ItemSet>> FindMenusById(int InputCategoryId);

        Task<InvoiceHeaderSet> splitUpForV(InvoiceHeaderSet invoiceHeaderSet, List<InvoiceHeaderDetailsSet> invoiceDetails, bool takeAway, int total);
        Task<IEnumerable<InvoiceHeaderSet>> GetDeleteItems(DateTime searchDate);
        Task<InvoiceHeaderSet> StartCreateInvoiceOrfindexists(string number, DateTime searchDate);
        Task<bool> DeleteCurrentItem(InvoiceHeaderSet invoiceHeaderSet);
        Task<InvoiceHeaderSet> CreateInvoiceAndReservation(InvoiceHeaderSet invoiceHeaderSet);
        Task<IEnumerable<InvoiceHeaderSet>> getReservationDate(DateTime searchDate);
        Task<bool> DeleteReservationSet(InvoiceHeaderSet invoiceHeaderSet);
        Task<bool> DeleteCreatorSet(CreatorSet creatorSet);
        Task<IEnumerable<WorkinghoursSet>> CreatorsEvents(DateTime WorkinghoursSetStartDate, string options);
        Task<WorkinghoursSet> CreatorsCheckIn(CreatorSet creator);
        Task<CreatorSet> GetAndUpdateCreators(CreatorSet creator);
        
        Task<CreatorSet> CreatorsCheckOut(CreatorSet creator, WorkinghoursSet workinghoursSet);
        Task<IEnumerable<CreatorSet>> getAllCreators();
        Task<IEnumerable<WorkinghoursSet>> GetWorkinghours(CreatorSet creator, DateTime WorkinghoursSetStartDate, DateTime WorkinghoursSetEndDate);
        Task<CreatorSet> addCreatorWorkingHours(CreatorSet creatorSet,DateTime workinghoursSet, DateTime addStartWorkingHourSet, DateTime addEndWorkingHourSet);
        Task<IEnumerable<CreatorSet>>GeneretRapport(DateTime creatorStartDate, DateTime creatorEndDate);
        Task<WorkinghoursSet> SaveTimeReg(WorkinghoursSet workinghoursSet);
        Task<WorkinghoursSet> RemoveTimeReg(WorkinghoursSet workinghoursSet);
    }
}
