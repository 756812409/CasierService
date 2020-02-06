using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Newtonsoft.Json;
using CasierV2.Models;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Web.Script.Serialization;
using CasierV2.Controllers;
using Services;
using System.Web.Security;
using Microsoft.AspNet.SignalR;

namespace CasierV2.Controllers
{
    //[System.Web.Mvc.Authorize]
    public class CasierController : Controller
    {
        private static IHubContext _hubContext = GlobalHost.ConnectionManager.GetHubContext<Noti>();

        ////_cusomters.Add(new InvoiceHeaderSet() {Number= number });
        ////_hubContext.Clients.All.CustomerAdded("succes", _cusomters);
        // var trans = DatabaseContext.BeginTransaction();
        protected override JsonResult Json(object data, string contentType, System.Text.Encoding contentEncoding, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType = contentType,
                ContentEncoding = contentEncoding,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue // Use this value to set your maximum size for all of your Requests
            };
        }

        public ICatalog catalog = new Catalog();
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async System.Threading.Tasks.Task<ActionResult> CreatorsEvents(DateTime WorkinghoursSetDate, string options)
        {
            var results = await catalog.CreatorsEvents(WorkinghoursSetDate, options);
            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);

        }
        


        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> GetDeleteItems(DateTime searchDate)
        {
            var result = await catalog.GetDeleteItems(searchDate);
            return Json(JsonConvert.SerializeObject(result, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        
        }


        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> GetpaidItems(DateTime searchDate)
        {
            var results = await catalog.GetpaidItems(searchDate);
            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);

        }

        // defaults
        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> getAllItems(DateTime searchDate)
        {

            var results = await catalog.getInvoiceHeaderByDateAsync(searchDate);
            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);



        }
        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> getOrderAllItems(DateTime searchDate)
        {
            var results = await catalog.getOrderInvoiceHeaderByDateAsync(searchDate);
            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public async System.Threading.Tasks.Task<JsonResult> getAllCategory()
        {

            var results = await catalog.getCategoryAndMenuAsync();

            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> getInvoiceHeaderDetails(DateTime searchDate)
        {

            var results = await catalog.getInvoiceHeaderDetails(searchDate);

            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> DeleteCurrentItem(InvoiceHeaderSet invoiceHeaderSet)
        {
            bool result =  await catalog.DeleteCurrentItem(invoiceHeaderSet);           
            return Json(result, JsonRequestBehavior.AllowGet);
        }



        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> CreateReservationSetOrUpdate(InvoiceHeaderSet invoiceHeaderSet, DateTime searchDate)
        {

            invoiceHeaderSet.CreateDate = invoiceHeaderSet.ReservationSet.DateTime;
            var result = await catalog.CreateInvoiceAndReservation(invoiceHeaderSet);

            var searchByDate = await catalog.getOrderInvoiceHeaderByDateAsync(searchDate);

            var initSearchByDate = Json(JsonConvert.SerializeObject(searchByDate, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);


            _hubContext.Clients.All.newReservations(initSearchByDate);

            return Json(JsonConvert.SerializeObject(result, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> DeleteReservationSet(InvoiceHeaderSet invoiceHeaderSet)
        {
 
            var result = await catalog.DeleteReservationSet(invoiceHeaderSet);

            return Json(JsonConvert.SerializeObject(result, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }
        
        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> DeleteCreatorSet(CreatorSet creator)
        {

            var result = await catalog.DeleteCreatorSet(creator);

            return Json(JsonConvert.SerializeObject(result, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> StartCreateInvoiceOrfindexists(string number, DateTime searchDate)
        {

            //HERE YOU ARE
            var result = await catalog.StartCreateInvoiceOrfindexists(number, searchDate);

            return Json(JsonConvert.SerializeObject(result, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> DeleteEmpyItems(InvoiceHeaderSet invoiceHeaderSet, DateTime searchDate)
        {
           var result = await catalog.DeleteEmpyItems(invoiceHeaderSet);


            var searchByDate = await catalog.getInvoiceHeaderByDateAsync(searchDate);

            var initSearchByDate = Json(JsonConvert.SerializeObject(searchByDate, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);


            _hubContext.Clients.All.NewInvoiceHeader(initSearchByDate);

            return Json(JsonConvert.SerializeObject(result, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> InsertInvoiceDeitails(int invoiceHeader, int quantity, string number)
        {
            var result = await catalog.InsertInvoiceDeitails(invoiceHeader, quantity, number);
            return Json(JsonConvert.SerializeObject(result, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> FindMenusById(int InputCategoryId)
        {
            using (CasierContents context = new CasierContents())
            {
                var result = await catalog.FindMenusById(InputCategoryId);
                return Json(JsonConvert.SerializeObject(result, new JsonSerializerSettings()
                {
                    ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
                }), JsonRequestBehavior.AllowGet);
            }
        }
        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> splitUpForV(InvoiceHeaderSet invoiceHeaderSet, List<InvoiceHeaderDetailsSet> invoiceDetails, bool takeAway, int total)
        {

            var result = await catalog.splitUpForV(invoiceHeaderSet, invoiceDetails, takeAway, total);
            return Json(JsonConvert.SerializeObject(result, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> getReservationDate(DateTime searchDate)
        {
            //var results = await catalog.getInvoiceHeaderByDateAsync(searchDate);
            var results = await catalog.getReservationDate(searchDate);

            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> GetAndUpdateCreators(CreatorSet creator)
        {

            var results = await catalog.GetAndUpdateCreators(creator);

            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> CreatorsCheckIn(CreatorSet creator)
        {

            var results = await catalog.CreatorsCheckIn(creator);

            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> CreatorsCheckOut(CreatorSet creator, WorkinghoursSet workinghoursSet)
        {

            var results = await catalog.CreatorsCheckOut(creator, workinghoursSet);

            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public async System.Threading.Tasks.Task<ActionResult> GetCreators()
        {
            var results = await catalog.getAllCreators();
            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);

        }
        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> GetWorkinghours(CreatorSet creator, DateTime WorkinghoursSetStartDate, DateTime WorkinghoursSetEndDate)
        {

            var results = await catalog.GetWorkinghours(creator, WorkinghoursSetStartDate, WorkinghoursSetEndDate);

            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> addCreatorWorkingHours(CreatorSet creatorSet, DateTime workingHourDate, DateTime addStartWorkingHourSet, DateTime addEndWorkingHourSet)
        {
            var results = await catalog.addCreatorWorkingHours(creatorSet, workingHourDate , addStartWorkingHourSet, addEndWorkingHourSet);

            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }
       
        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> GeneretRapport( DateTime creatorStartDate, DateTime creatorEndDate)
        {
            var results = await catalog.GeneretRapport(creatorStartDate, creatorEndDate);

            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            sb.Append("<div id=printContent>");
            foreach (var item in results)
            {
                
            sb.Append("<table><thead><tr><th>Navn : " + item.Name + " </th><th> CPR : " + item.CPR + " </th><th>BANK : " + item.BankInfo + " </th></tr></thead> <tbody>");


                int totalprice = 0;

                TimeSpan total = new TimeSpan();
               
                foreach (var workinghour in item.WorkinghoursSet)
                {
                    if(workinghour.StartHour != null && workinghour.EndHour != null) { 
                    TimeSpan difference = workinghour.EndHour.Value - workinghour.StartHour.Value;
                    total += difference; 

                    sb.AppendFormat("<tr><td>Start :</td><td>{0}</td></tr>", workinghour.StartHour);
                    sb.AppendFormat("<tr><td>Slut :</td><td>{0}</td></tr>", workinghour.EndHour);
                    sb.AppendFormat("<tr><td>Total : </td><td>{0}</td></tr>", string.Format("{0:00}:{1:00}", difference.Hours, difference.Minutes));
                    sb.AppendFormat("<tr><td>--------</td><td>--------</td></tr>");

                    }
                }
                sb.Append("</tbody> <tfoot><tr><td>Total Hours : "+ string.Format("{0:00}:{1:00}", total.Hours, total.Minutes) + " </td><td> Total TimeLøn : " + totalprice + "</td></tr></tfoot><table>");

            }
            sb.Append("</div>");
            return Content(sb.ToString(), "text/plain");
        }


        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> SaveTimeReg(WorkinghoursSet workinghoursSet)
        {
            var results = await catalog.SaveTimeReg(workinghoursSet);

            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async System.Threading.Tasks.Task<ActionResult> RemoveTimeReg(WorkinghoursSet workinghoursSet)
        {
            var results = await catalog.RemoveTimeReg(workinghoursSet);

            return Json(JsonConvert.SerializeObject(results, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }
    }

}
