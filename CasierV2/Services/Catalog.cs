using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CasierV2;
using System.Data.Entity.Migrations;
using System.Data.Entity;
using CasierV2.Models;

namespace Services
{
    public class Catalog : ICatalog
    {
        public async Task<IEnumerable<CategorySet>> getCategoryAndMenuAsync()
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {

                    var items = context.CategorySet.Include(m => m.ItemSet).ToList();

                    return items;
                }
            });
        }
        public async Task<IEnumerable<InvoiceHeaderSet>> getOrderInvoiceHeaderByDateAsync(DateTime searchDate)
        {

            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {


                    var result = context.InvoiceHeaderSet.Include("InvoiceHeaderDetailsSet.ItemSet").Include("ReservationSet").Where(u => u.PayDate == null && u.InvoiceHeaderDetailsSet.Count == 0 && u.Description == null && u.ReservationSet != null && searchDate.Month.Equals(u.CreateDate.Value.Month) && searchDate.Day.Equals(u.CreateDate.Value.Day) && searchDate.Year.Equals(u.CreateDate.Value.Year)).ToList();



                    return result;
                }
            });
        }
        // default
        public async Task<IEnumerable<InvoiceHeaderSet>> getInvoiceHeaderByDateAsync(DateTime searchDate)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    var result = context.InvoiceHeaderSet.Include("InvoiceHeaderDetailsSet.ItemSet").Where(u => u.Number != null && u.PayDate == null && u.InvoiceHeaderDetailsSet.Count != 0 && u.Description == null && searchDate.Month.Equals(u.CreateDate.Value.Month) && searchDate.Day.Equals(u.CreateDate.Value.Day) && searchDate.Year.Equals(u.CreateDate.Value.Year)).ToList();

                    return result;
                }
            });
        }
      

        public async Task<bool> DeleteEmpyItems(InvoiceHeaderSet invoiceHeaderSet)
        {
            await Task.Run(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    if (invoiceHeaderSet != null)
                    {

                        InvoiceHeaderSet CurrentInvoiceHeaderSet = context.InvoiceHeaderSet.Include("InvoiceHeaderDetailsSet.ItemSet").Include("ReservationSet").Where(x => x.InvoiceHeaderSetId == invoiceHeaderSet.InvoiceHeaderSetId).FirstOrDefault() ?? null;
                        if (CurrentInvoiceHeaderSet != null)
                        {


                            if (CurrentInvoiceHeaderSet.InvoiceHeaderDetailsSet.Count != 0)
                            {

                                foreach (var item in CurrentInvoiceHeaderSet.InvoiceHeaderDetailsSet.ToList())
                                {
                                    if (item.Quantity <= 0)
                                    {

                                        CurrentInvoiceHeaderSet.InvoiceHeaderDetailsSet.ToList().ForEach(p => p.InvoiceHeaderSet.InvoiceHeaderDetailsSet.Remove(item));
                                        context.Entry(item).State = EntityState.Deleted;

                                    }
                                }

                            }
                            else if (CurrentInvoiceHeaderSet.InvoiceHeaderDetailsSet.Count == 0 && CurrentInvoiceHeaderSet.ReservationSet == null)
                            {
                                context.InvoiceHeaderSet.Remove(CurrentInvoiceHeaderSet);
                            }
                            context.SaveChanges();
                        }

                    }
                }
            });
            return true;
        }


        public async Task<IEnumerable<ItemSet>> FindMenusById(int InputCategoryId)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    var invoiceDetails = context.ItemSet.Where(x => x.CategorySet.CategoryId == InputCategoryId).ToList();
                    return invoiceDetails;
                }
            });
        }
        public async Task<InvoiceHeaderSet> InsertInvoiceDeitails(int invoiceHeader, int quantity, string number)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    {
                        InvoiceHeaderSet findInvoiceHeaderSet = context.InvoiceHeaderSet.Include("InvoiceHeaderDetailsSet.ItemSet").Where(x => x.InvoiceHeaderSetId == invoiceHeader).FirstOrDefault() ?? null;
                        {

                            if (findInvoiceHeaderSet.InvoiceHeaderDetailsSet.Count == 0)
                            {
                                InvoiceHeaderDetailsSet CreateNewInvoiceHeaderDetailset = new InvoiceHeaderDetailsSet();
                                CreateNewInvoiceHeaderDetailset.OrderTime = DateTime.Now;
                                ItemSet itemSet = context.ItemSet.Where(x => x.Number == number).FirstOrDefault() ?? null;
                                CreateNewInvoiceHeaderDetailset.ItemSet = itemSet;
                                if (CreateNewInvoiceHeaderDetailset.Quantity == null)
                                {
                                    CreateNewInvoiceHeaderDetailset.Quantity = (short)quantity;
                                }
                                findInvoiceHeaderSet.InvoiceHeaderDetailsSet.Add(CreateNewInvoiceHeaderDetailset);
                            }
                            // hvis der er flere items så skal der lægges sammen.
                            else if (findInvoiceHeaderSet.InvoiceHeaderDetailsSet.Count > 0)
                            {
                                var findTheCOrrectOne = findInvoiceHeaderSet.InvoiceHeaderDetailsSet.Where(x => x.ItemSet.Number == number).FirstOrDefault();
                                if (findTheCOrrectOne != null)
                                {
                                    if (findTheCOrrectOne.Quantity != null)
                                    {
                                        findTheCOrrectOne.Quantity += (short)quantity;
                                    }
                                    else
                                    {
                                        findTheCOrrectOne.Quantity = (short)quantity;
                                    }
                                    if (findTheCOrrectOne.Quantity <= 0)
                                    {
                                        context.InvoiceHeaderDetailsSet.Remove(findTheCOrrectOne);
                                    }
                                }
                                else if (findTheCOrrectOne == null && quantity > 0)
                                {
                                    InvoiceHeaderDetailsSet CreateNewInvoiceHeaderDetailsets = new InvoiceHeaderDetailsSet();
                                    CreateNewInvoiceHeaderDetailsets.OrderTime = DateTime.Now;
                                    ItemSet itemSet = context.ItemSet.Where(x => x.Number == number).FirstOrDefault() ?? null;
                                    CreateNewInvoiceHeaderDetailsets.ItemSet = itemSet;
                                    itemSet.InvoiceHeaderDetailsSet.Add(CreateNewInvoiceHeaderDetailsets);
                                    CreateNewInvoiceHeaderDetailsets.Quantity = (short)quantity;
                                    findInvoiceHeaderSet.InvoiceHeaderDetailsSet.Add(CreateNewInvoiceHeaderDetailsets);
                                }
                            }
                        }
                        context.SaveChanges();
                        context.InvoiceHeaderSet.Add(findInvoiceHeaderSet);
                        return findInvoiceHeaderSet;
                    }
                }
            });
        }

        public async Task<InvoiceHeaderSet> splitUpForV(InvoiceHeaderSet invoiceHeaderSet, List<InvoiceHeaderDetailsSet> invoiceDetails, bool takeAway, int total)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {

                    int TakeAwayTotal = 0;
                    InvoiceHeaderSet currentInvoiceHeaderSet = new InvoiceHeaderSet();
                    currentInvoiceHeaderSet.PayDate = DateTime.Now;
                    currentInvoiceHeaderSet.Number = invoiceHeaderSet.Number;
                    //currentInvoiceHeaderSet.InvoiceHeaderDetailsSet = invoiceDetails;
                    foreach (var item in invoiceDetails)
                    {
                        InvoiceHeaderDetailsSet CreateNewInvoiceHeaderDetailsets = new InvoiceHeaderDetailsSet();
                        ItemSet itemSet = context.ItemSet.Where(x => x.Number == item.ItemSet.Number).FirstOrDefault() ?? null;
                        CreateNewInvoiceHeaderDetailsets.ItemSet = itemSet;
                        CreateNewInvoiceHeaderDetailsets.Quantity = item.Quantity;
                        CreateNewInvoiceHeaderDetailsets.OrderTime = DateTime.Now;
                        currentInvoiceHeaderSet.InvoiceHeaderDetailsSet.Add(CreateNewInvoiceHeaderDetailsets);
                        int quantity = (int)item.Quantity;
                        int price = (int)(item.ItemSet.Price);
                        int sum = quantity * price;
                        if (item.ItemSet.Discount != null)
                        {
                            int rabat = (int)item.ItemSet.Price * (int)item.ItemSet.Discount / 100;
                            sum = sum - rabat;
                        }

                        TakeAwayTotal += (int)sum;
                    }

                    if (takeAway)
                    {
                        currentInvoiceHeaderSet.Total = TakeAwayTotal;
                    }
                    else
                    {
                        currentInvoiceHeaderSet.Total = total;
                    }

                    context.InvoiceHeaderSet.Add(currentInvoiceHeaderSet);
                    //  context.SaveChanges();

                    // update newone


                    InvoiceHeaderSet currentInvoiceHeader = context.InvoiceHeaderSet.Include("InvoiceHeaderDetailsSet.ItemSet").Where(x => x.InvoiceHeaderSetId == invoiceHeaderSet.InvoiceHeaderSetId).FirstOrDefault() ?? null;
                    foreach (var item in invoiceHeaderSet.InvoiceHeaderDetailsSet)
                    {
                        context.InvoiceHeaderDetailsSet.AddOrUpdate(item);
                    }


                    context.SaveChanges();
                    return currentInvoiceHeader;
                }
            });
        }

        public async Task<IEnumerable<InvoiceHeaderSet>> GetDeleteItems(DateTime searchDate)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    var invoiceHeader = context.InvoiceHeaderSet.Include("InvoiceHeaderDetailsSet.ItemSet").Where(u => u.Description != null && searchDate.Month.Equals(u.CreateDate.Value.Month) && searchDate.Day.Equals(u.CreateDate.Value.Day) && searchDate.Year.Equals(u.CreateDate.Value.Year)).ToList() ?? null;
                    return invoiceHeader;
                }
            });
        }

        public async Task<InvoiceHeaderSet> StartCreateInvoiceOrfindexists(string number, DateTime searchDate)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {

                    InvoiceHeaderSet result = context.InvoiceHeaderSet.Include("InvoiceHeaderDetailsSet.ItemSet").Where(u => u.Number.Equals(number) && u.PayDate == null && u.Description == null && u.ReservationSet == null && searchDate.Month.Equals(u.CreateDate.Value.Month) && searchDate.Day.Equals(u.CreateDate.Value.Day) && searchDate.Year.Equals(u.CreateDate.Value.Year)).FirstOrDefault();
                    if (result != null)
                    {
                        return result;
                    }
                    else
                    {
                        InvoiceHeaderSet newOne = new InvoiceHeaderSet();
                        newOne.CreateDate = DateTime.Now;
                        newOne.Number = number;
                        newOne.Total = 0;
                        context.InvoiceHeaderSet.Add(newOne);
                        context.SaveChanges();
                        return newOne;
                    }


                }
            });
        }
        public async Task<bool> DeleteCurrentItem(InvoiceHeaderSet invoiceHeaderSet)
        {
            using (CasierContents context = new CasierContents())
            {

                await Task.Run(() =>
                {
                    if (invoiceHeaderSet != null)
                    {
                        var CurrentInvoiceHeaderSet = context.InvoiceHeaderSet.Where(x => x.InvoiceHeaderSetId == invoiceHeaderSet.InvoiceHeaderSetId).FirstOrDefault();
                        //context.InvoiceHeaderSet.Attach(CurrentInvoiceHeaderSet);
                        CurrentInvoiceHeaderSet.Description = "" + DateTime.Now + " blev slettet";
                        context.SaveChanges();

                    }

                });
                return true;
            }

        }

        public async Task<IEnumerable<InvoiceHeaderSet>> GetpaidItems(DateTime searchDate)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {

                    var invoiceHeaderItem = context.InvoiceHeaderSet.Include("InvoiceHeaderDetailsSet.ItemSet").Where(u => u.Number != null && u.PayDate != null && u.Description == null && searchDate.Month.Equals(u.PayDate.Value.Month) && searchDate.Day.Equals(u.PayDate.Value.Day) && searchDate.Year.Equals(u.PayDate.Value.Year)).ToList() ?? null;
                    return invoiceHeaderItem;
                }
            });
        }

        public async Task<InvoiceHeaderSet> CreateInvoiceAndReservation(InvoiceHeaderSet invoiceHeaderSet)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    // check the dubllicate date.
                    var existedItem = context.InvoiceHeaderSet.Include("ReservationSet").Where(u => u.InvoiceHeaderSetId == invoiceHeaderSet.InvoiceHeaderSetId).FirstOrDefault();
                    InvoiceHeaderSet addNewInvoiceHeader = null;
                    if (existedItem != null)
                    {
                        existedItem.ReservationSet.Name = invoiceHeaderSet.ReservationSet.Name;
                        existedItem.ReservationSet.Phone = invoiceHeaderSet.ReservationSet.Phone;
                        existedItem.ReservationSet.Description = invoiceHeaderSet.ReservationSet.Description;
                        existedItem.ReservationSet.Email = invoiceHeaderSet.ReservationSet.Email;
                        existedItem.ReservationSet.Amount = invoiceHeaderSet.ReservationSet.Amount;
                        existedItem.ReservationSet.DateTime = invoiceHeaderSet.ReservationSet.DateTime;
                        existedItem.Number = invoiceHeaderSet.Number;
                        context.SaveChanges();
                        return existedItem;
                    }
                    else
                    {
                        DateTime ResevationSearchDate = invoiceHeaderSet.CreateDate.Value;
                        var result = context.InvoiceHeaderSet.Include("ReservationSet").Where(u => u.Number == invoiceHeaderSet.Number && u.PayDate == null && u.Description == null && ResevationSearchDate.Date.Day == u.CreateDate.Value.Day && ResevationSearchDate.Date.Month == u.CreateDate.Value.Month && ResevationSearchDate.Date.Year == u.CreateDate.Value.Year).ToList() ?? null;
                        if (result.Count >= 1)
                        {
                            foreach (var invoiceHeaders in result)
                            {
                                DateTime reservationDate = invoiceHeaders.CreateDate.Value;

                                int one = reservationDate.TimeOfDay.Hours * 60 + reservationDate.Minute;
                                int two = ResevationSearchDate.TimeOfDay.Hours * 60 + ResevationSearchDate.Minute;

                                int diff = Math.Abs(one - two);

                                if (diff >= 180)
                                {
                                    addNewInvoiceHeader = context.InvoiceHeaderSet.Add(invoiceHeaderSet);
                                    context.SaveChanges();
                                }
                            }
                        }
                        else
                        {
                            addNewInvoiceHeader = context.InvoiceHeaderSet.Add(invoiceHeaderSet);
                            context.SaveChanges();

                        }
                    }
                    return addNewInvoiceHeader;
                }
            });

        }

        public async Task<IEnumerable<InvoiceHeaderSet>> getReservationDate(DateTime ResevationSearchDate)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {

                    var invoiceHeaderItem = context.InvoiceHeaderSet.Include("InvoiceHeaderDetailsSet").Include("ReservationSet").Where(u => u.PayDate == null && u.InvoiceHeaderDetailsSet.Count == 0 && u.ReservationSet != null && u.Description == null && ResevationSearchDate.Date.Day == u.CreateDate.Value.Day && ResevationSearchDate.Date.Month == u.CreateDate.Value.Month && ResevationSearchDate.Date.Year == u.CreateDate.Value.Year).ToList() ?? null;
                    return invoiceHeaderItem;
                }
            });

        }

        public async Task<IEnumerable<InvoiceHeaderDetailsSet>> getInvoiceHeaderDetails(DateTime searchDate)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    List<InvoiceHeaderDetailsSet> invoiceHeaderDetailsReport = new List<InvoiceHeaderDetailsSet>();


                    var justme = context.InvoiceHeaderDetailsSet.ToList() ?? null;
                    var ItemSets = context.ItemSet.Include("InvoiceHeaderDetailsSet.InvoiceHeaderSet").Where(u => u.InvoiceHeaderDetailsSet.Count != 0).ToList() ?? null; //searchDate.Date.Day == u.OrderTime.Value.Day && searchDate.Date.Month == u.OrderTime.Value.Month && searchDate.Date.Year == u.OrderTime.Value.Year).ToList() ?? null;

                    foreach (var itemSet in ItemSets)
                    {
                        //  int total = 0;
                        foreach (var invoiceDetails in itemSet.InvoiceHeaderDetailsSet)
                        {
                            if (invoiceDetails.OrderTime.Value.Date == searchDate.Date && invoiceDetails.InvoiceHeaderSet.Description == null && invoiceDetails.InvoiceHeaderSet.PayDate != null)
                            {



                                bool containsItem = invoiceHeaderDetailsReport.Any(u => u.ItemSet.ItemSetId == invoiceDetails.ItemSet.ItemSetId);

                                if (containsItem)
                                {
                                    var test = invoiceHeaderDetailsReport.Where(x => x.ItemSet.ItemSetId == invoiceDetails.ItemSet.ItemSetId).FirstOrDefault();
                                    test.Quantity += invoiceDetails.Quantity;
                                }
                                else
                                {
                                    invoiceHeaderDetailsReport.Add(invoiceDetails);
                                }

                            }
                        }

                        //bool containsItem = invoiceHeaderDetailsReport.Any(u => u.itemset.ItemSetId == item.ItemSet.ItemSetId);

                        //if(containsItem == true)
                        //{

                        //}

                        //if (containsItem == false)
                        //{

                        //    InvoiceHeaderDetailsReport report = new InvoiceHeaderDetailsReport();
                        //    report.itemset = item.ItemSet;


                        //}
                    }


                    return invoiceHeaderDetailsReport;
                }
            });

        }

        
        public async Task<bool> DeleteCreatorSet(CreatorSet creatorSet)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    var deleteItemReservationSet = context.CreatorSet.Find(creatorSet.CreatorId);
                    deleteItemReservationSet.CPR = null;
                    context.SaveChanges();
                    return true;
                }
            });
        }
        public async Task<bool> DeleteReservationSet(InvoiceHeaderSet invoiceHeaderSet)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    var deleteItemReservationSet = context.ReservationSet.Find(invoiceHeaderSet.ReservationSet.ReservationId);
                    context.ReservationSet.Remove(deleteItemReservationSet);


                    var deleteItemInvoiceHeader = context.InvoiceHeaderSet.Find(invoiceHeaderSet.InvoiceHeaderSetId);
                    context.InvoiceHeaderSet.Remove(deleteItemInvoiceHeader);
                    context.SaveChanges();



                    return true;
                }
            });
        }
        public async Task<WorkinghoursSet> CreatorsCheckIn(CreatorSet creator)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                   
                    var findCreator = context.CreatorSet.Where(x => x.CreatorId == creator.CreatorId).FirstOrDefault();

                    var findWorkingHourExist = context.WorkinghoursSet.Where(x => findCreator.CreatorId == x.CreatorSet.CreatorId).ToList();

                    WorkinghoursSet findToworkingHours = null;

               

                    foreach (var workinghours in findWorkingHourExist)
                    {
                        if(workinghours.StartHour != null)
                        {
                            if(workinghours.StartHour.Value.Date == DateTime.Now.Date)
                            {
                                findToworkingHours = workinghours;
                            }
                        }
                    }

                //    x.StartHour.Value.Date.Month == DateTime.Now.Date.Month && x.StartHour.Value.Year == DateTime.Now.Date.Year && x.StartHour.Value.Date.Day == DateTime.Now.Date.Day

                    if (findToworkingHours == null)
                    { 
                        WorkinghoursSet workingourset = new WorkinghoursSet();
                        workingourset.StartHour = DateTime.Now;                
                        findCreator.WorkinghoursSet.Add(workingourset);
                        context.SaveChanges();
                         return workingourset;
                        
                    }else if (findToworkingHours != null)
                    {
                        findToworkingHours.StartHour = DateTime.Now;
                        context.SaveChanges();
                        return findToworkingHours;
                    }
                    return null;

                }
            });
        }
        public async Task<CreatorSet> CreatorsCheckOut(CreatorSet creator, WorkinghoursSet workinghoursSet)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    /*  var findTheCurrentworkinghoursSet = context.WorkinghoursSet.Where(x => x.WorkingHoursId == creator.WorkinghoursSet.First()).FirstOrDefault();*/



                    var workinghour = context.WorkinghoursSet.Find(workinghoursSet.WorkingHoursId);
                    if(workinghour.EndHour == null && workinghour.StartHour.Value.Date == DateTime.Now.Date) { 
                    workinghour.EndHour = DateTime.Now;
                    context.SaveChanges();
                    }
                    return creator;
                }
            });
        }
        public async Task<CreatorSet> GetAndUpdateCreators(CreatorSet creator)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    // check the dubllicate date.
                    var existedItem = context.CreatorSet.Include("WorkinghoursSet").Where(u => u.CPR != null && u.CreatorId == creator.CreatorId).FirstOrDefault();
            
                    if (existedItem != null)
                    {                      
                        existedItem.BankInfo = creator.BankInfo;
                        existedItem.CPR = creator.CPR;
                        existedItem.Description = creator.Description;
                        existedItem.Evaluation = creator.Evaluation;
                        existedItem.HourSalary = creator.HourSalary;
                        existedItem.MonthSalary = creator.MonthSalary;
                        existedItem.Name = creator.Name;
                        existedItem.Phone = creator.Phone;
                        existedItem.WorkinghoursSet = creator.WorkinghoursSet;
                        context.SaveChanges();
                       return existedItem;
                    }
                    else
                    {
                        CreatorSet newCreatorSet = new CreatorSet();
                        newCreatorSet.BankInfo = creator.BankInfo;
                        newCreatorSet.CPR = creator.CPR;
                        newCreatorSet.Description = creator.Description;
                        newCreatorSet.Evaluation = creator.Evaluation;
                        newCreatorSet.HourSalary = creator.HourSalary;
                        newCreatorSet.MonthSalary = creator.MonthSalary;
                        newCreatorSet.Name = creator.Name;
                        newCreatorSet.Phone = creator.Phone;
                        newCreatorSet.WorkinghoursSet = creator.WorkinghoursSet;
                        context.CreatorSet.Add(newCreatorSet);
                        context.SaveChanges();
                        return newCreatorSet;
                    }
                }
            });
        }
        public async Task<IEnumerable<CreatorSet>> getAllCreators()
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                 
                    var getCreatorListItem = context.CreatorSet.Include("WorkinghoursSet").Where(u => u.CPR != null).ToList();

                    foreach (var creatorListItem in getCreatorListItem.ToList())
                    {
                        foreach (var item in creatorListItem.WorkinghoursSet.ToList())
                        {
                            if(item.StartHour.Value.Date != DateTime.Now.Date)
                            {
                                creatorListItem.WorkinghoursSet.Remove(item);
                            }
                        }
                    }

                    return getCreatorListItem;
                    //&& u.WorkinghoursSet.(y => y.StartHour.Value.Date == DateTime.Now.Date)
                }
            });
        }

        public async Task<CreatorSet> addCreatorWorkingHours(CreatorSet creatorSet, DateTime workinghoursSet,DateTime addStartWorkingHourSet, DateTime addEndWorkingHourSet)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                   
                 //   DateTime saveNow = 

                    WorkinghoursSet workingHourset = new WorkinghoursSet();

                    workingHourset.StartHour = new DateTime(workinghoursSet.Year, workinghoursSet.Month, workinghoursSet.Day, addStartWorkingHourSet.Hour, addStartWorkingHourSet.Minute,0);

                    workingHourset.EndHour = new DateTime(workinghoursSet.Year, workinghoursSet.Month, workinghoursSet.Day, addEndWorkingHourSet.Hour, addEndWorkingHourSet.Minute, 0); ;

                    var findCreatorSet = context.CreatorSet.Include("WorkinghoursSet").Where(x => x.CreatorId == creatorSet.CreatorId).FirstOrDefault();

                    foreach (var workinghours in findCreatorSet.WorkinghoursSet.ToList())
                    {
                        if(workinghours.StartHour.Value.Date != workingHourset.StartHour.Value.Date)
                        {
                              findCreatorSet.WorkinghoursSet.Add(workingHourset);
                                context.SaveChanges();
                                break;
                         }
                    }

                    return findCreatorSet;
                    //&& u.WorkinghoursSet.(y => y.StartHour.Value.Date == DateTime.Now.Date)
                }
            });
        }

        public async Task<IEnumerable<WorkinghoursSet>> GetWorkinghours(CreatorSet creator, DateTime WorkinghoursSetStartDate, DateTime WorkinghoursSetEndDate)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {               
                    if (creator == null)
                    {
                        var getItems = context.WorkinghoursSet.Include("CreatorSet").Where(u => u.StartHour.Value.Date <= WorkinghoursSetStartDate.Date && u.StartHour.Value.Date >= WorkinghoursSetEndDate.Date).ToList();
                        return getItems;
                    }else
                    {
                        var getItems = context.WorkinghoursSet.Include("CreatorSet").Where(u => u.StartHour.Value.Date <= WorkinghoursSetStartDate.Date && u.StartHour.Value.Date >= WorkinghoursSetEndDate.Date && creator.CreatorId == u.CreatorSet.CreatorId).ToList();
                        return getItems;
                    }                
                }
            });
        }

        public async Task<IEnumerable<WorkinghoursSet>> CreatorsEvents(DateTime inputDate, string options)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                   
                    DateTime start = DateTime.MinValue;
                    DateTime end = DateTime.MinValue;
                    if (options.Equals("agendaWeek"))
                    {
                        DayOfWeek day = inputDate.DayOfWeek;
                        int days = day - DayOfWeek.Monday;
                        start = inputDate.AddDays(-days);
                        end = start.AddDays(6);
                    }
                    else if (options.Equals("month"))
                    {
                        start = new DateTime(inputDate.Year, inputDate.Month, 1);
                        end = start.AddMonths(1).AddDays(-1);
                    }

                    var getItems = context.WorkinghoursSet.Include("CreatorSet").ToList();
                    return getItems;
                }
            });
        }

        public async Task<IEnumerable<CreatorSet>> GeneretRapport(DateTime creatorStartDate, DateTime creatorEndDate)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    var getItems = context.CreatorSet.Include("WorkinghoursSet").Where(u => u.WorkinghoursSet.Count != 0 && u.CPR != null).ToList();

                    foreach (var creatorSet in getItems)
                    {
                        foreach (var workingHourSet in creatorSet.WorkinghoursSet.ToList())
                        {
                            if(workingHourSet.StartHour != null && workingHourSet.EndHour != null && workingHourSet.StartHour.Value.Date <= creatorStartDate.Date && workingHourSet.StartHour.Value.Date >= creatorEndDate)
                            {
                                creatorSet.WorkinghoursSet.Remove(workingHourSet);
                            }

                        }//u => u.StartHour.Value.Date <= WorkinghoursSetStartDate.Date && u.StartHour.Value.Date >= WorkinghoursSetEndDate.Date
                    }

                
                    return getItems;
                    //  .Where(p => p.Children.All(c => !c.Gender && c.GrandChildren.All(g => !g.Gender))       EntityFunctions.TruncateTime(x.DateTimeStart)
                }
            });
            
        }


        public async Task<WorkinghoursSet> SaveTimeReg(WorkinghoursSet workinghoursSet)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    var getItems = context.WorkinghoursSet.Where(x => x.WorkingHoursId == workinghoursSet.WorkingHoursId).FirstOrDefault();
                    getItems.StartHour = workinghoursSet.StartHour;
                    getItems.EndHour = workinghoursSet.EndHour;
                    context.SaveChanges();
                    return getItems;
                }
            });
        }
        public async Task<WorkinghoursSet> RemoveTimeReg(WorkinghoursSet workinghoursSet)
        {
            return await Task.Factory.StartNew(() =>
            {
                using (CasierContents context = new CasierContents())
                {
                    var tester = context.WorkinghoursSet.ToList();

                    var getItems = context.WorkinghoursSet.Where(x => x.WorkingHoursId == workinghoursSet.WorkingHoursId).FirstOrDefault();

                    context.WorkinghoursSet.Remove(getItems);
                    context.SaveChanges();
                    return getItems;
                }
            });
        }

        //public Task<IEnumerable<WorkinghoursSet>> CreatorsEvents()
        //{
        //    throw new NotImplementedException();
        //}
    }

}
