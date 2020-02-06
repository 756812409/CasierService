using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;


namespace CasierV2.Controllers
{
    public class AdminController : Controller
    {
        private CasierContents dataContext = new CasierContents();
        // GET: Admin
        public ActionResult Index()
        {
            return View();
        }


        public JsonResult getReservationSet()
        {
            var Items = dataContext.ReservationSet.ToList(); 


            return Json(JsonConvert.SerializeObject(Items, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }


        public JsonResult createReservationSet(ReservationSet reservationSet)
        {
            if (reservationSet != null)
            {
                using (CasierContents dataContext = new CasierContents())
                {
                    var findItem = dataContext.ItemSet.Where(x => x.Name.Equals(reservationSet.Phone)).FirstOrDefault();
                    if (findItem == null)
                    {
                        

                            dataContext.ReservationSet.Add(reservationSet);
                            dataContext.SaveChanges();
                            var results = new { Success = "True", Message = "Succesfull" };
                            return Json(results, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        var results = new { Success = "False", Message = "Error" };
                        return Json(results, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            var result = new { Success = "False", Message = "Error" };
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public JsonResult DeleteReservationSet()
        {
            var Items = dataContext.ReservationSet.ToList().FirstOrDefault();


            return Json(JsonConvert.SerializeObject(Items, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }

        public JsonResult EditReservationSet()
        {
            var Items = dataContext.ReservationSet.ToList().FirstOrDefault();


            return Json(JsonConvert.SerializeObject(Items, new JsonSerializerSettings()
            {
                ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            }), JsonRequestBehavior.AllowGet);
        }


        public JsonResult getAllItems()
        {
            using (CasierContents dataContext = new CasierContents())
            {

               

                List<ItemSet> ItemSet = dataContext.ItemSet.Include("CategorySet").ToList();
                return Json(JsonConvert.SerializeObject(ItemSet, new JsonSerializerSettings()
                {
                    ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
                }), JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult getAllCategory()
        {
            using (CasierContents dataContext = new CasierContents())

            {
               
                var Items = dataContext.CategorySet.Include("ItemSet").ToList();
                return Json(JsonConvert.SerializeObject(Items, new JsonSerializerSettings()
                {
                    ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
                }), JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult getItemsNumber(string numbers)
        {
            using (CasierContents dataContext = new CasierContents())

            {
                string number = numbers;
                var items = dataContext.ItemSet.Find(number);
                return Json(items, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpPost]
        public JsonResult UpdateItemSet(string Name, int ItemSetId, string Number, decimal Price, short Discount)
        {
            
            
                using (CasierContents dataContext = new CasierContents())
                {
                    ItemSet currentItemSet = dataContext.ItemSet.Where(b => b.ItemSetId ==ItemSetId).FirstOrDefault();

                // Category category = itemsetId.Category1;
                if (currentItemSet.Number.Equals(Number)) { 
                    currentItemSet.Name = Name;
                    currentItemSet.Number = Number;
                    currentItemSet.Price = Price;
                    currentItemSet.Discount = Discount;
                    dataContext.SaveChanges();
                


                }
            }

            var result = new { Success = "True", Message = "Succesfull" };
            return Json(result, JsonRequestBehavior.AllowGet);

        }
        [HttpPost]
        public JsonResult AddItems(ItemSet item)
        {
            if (item != null)
            {
                using (CasierContents dataContext = new CasierContents())
                {
                    var findItem = dataContext.ItemSet.Where(x => x.Number.Equals(item.Number)).FirstOrDefault();
                    if(findItem ==null)
                    {
                        var fintTheCategory = dataContext.CategorySet.Where(x => x.Name.Equals(item.CategorySet.Name)).FirstOrDefault();

                        if(fintTheCategory == null)
                        {
                            dataContext.ItemSet.Add(item);
                            fintTheCategory.ItemSet.Add(item);                     
                            dataContext.SaveChanges();
                            var results = new { Success = "True", Message = "Succesfull" };
                            return Json(results, JsonRequestBehavior.AllowGet);
                        }else if(fintTheCategory != null)
                        {
                            fintTheCategory.ItemSet.Add(item);
                            item.CategorySet = fintTheCategory;
                            dataContext.ItemSet.Add(item);
                            dataContext.SaveChanges();
                            var results = new { Success = "True", Message = "Succesfull" };
                            return Json(results, JsonRequestBehavior.AllowGet);
                        }
                    }              
                }
            }

            var result = new { Success = "False", Message = "Error" };
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult AddCategory(CategorySet categorySet)
        {
            if (categorySet != null)
            {
                using (CasierContents dataContext = new CasierContents())
                {
                    if (!dataContext.CategorySet.Any(o => o.Name == categorySet.Name))
                    dataContext.CategorySet.Add(categorySet);
                    dataContext.SaveChanges();
                    var result = new { Success = "True", Message = "Succesfull" };
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
            }
            else
            {
                var result = new { Success = "False", Message = "Error" };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult DeleteItem(ItemSet items)
        {
            if (items != null)
            {
                using (CasierContents dataContext = new CasierContents())
                {
                    dataContext.Configuration.ProxyCreationEnabled = false;
                    dataContext.Configuration.LazyLoadingEnabled = false;
                    dataContext.Configuration.ValidateOnSaveEnabled = false;

                    //var category = items.CategorySet;
                    //var fintTheCategory = dataContext.CategorySet.Where(x => x.CategoryId == category.CategoryId).FirstOrDefault();

                    //if (fintTheCategory != null)
                    {
                        var findItem = dataContext.ItemSet.Include("InvoiceHeaderDetailsSet").Where(x => x.ItemSetId == items.ItemSetId).FirstOrDefault();



                        dataContext.ItemSet.Attach(findItem);
                        dataContext.Entry(findItem).Collection("InvoiceHeaderDetailsSet").Load();
                      //  findItem.CategorySet.ItemSet.Remove(findItem);
                        findItem.InvoiceHeaderDetailsSet.ToList().ForEach(I => dataContext.InvoiceHeaderDetailsSet.Remove(I));           
                        dataContext.ItemSet.Remove(findItem);
                        dataContext.SaveChanges();



                        dataContext.SaveChanges();
                        var results = new { Success = "True", Message = "Succesfull" };
                        return Json(results, JsonRequestBehavior.AllowGet);
                    }

                
                    var result = new { Success = "True", Message = "Succesfull" };
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
            }
            else
            {
                var result = new { Success = "True", Message = "Error" };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpPost]
        public JsonResult DeleteCategory(CategorySet category)
        {
            if (category != null)
            {
             
                {
                    var FindCategory = dataContext.CategorySet.Where(x => x.CategoryId == category.CategoryId).FirstOrDefault();
                    dataContext.CategorySet.Remove(FindCategory);
                    dataContext.SaveChanges();
                    var result = new { Success = "True", Message = "Succesfull" };
                    return Json(result, JsonRequestBehavior.AllowGet);
                }
            }
            else
            {
                var result = new { Success = "True", Message = "Error" };
                return Json(result, JsonRequestBehavior.AllowGet);
            }
        }

 

        //[HttpPost]
        //public ActionResult SaveCreator(CreatorSet creator)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        //db.CreatorSet.Add(creator);
        //        //db.SaveChanges();
        //    }
        //    return View(creator);
        //}
        //[HttpPost]
        //public JsonResult GetMenu()
        //{
        //    using (CasierContentEntities context = new CasierContentEntities())
        //    {
        //        context.Configuration.ProxyCreationEnabled = false;
        //        context.Configuration.LazyLoadingEnabled = false;
        //        context.Configuration.ValidateOnSaveEnabled = false;
        //        //     Include("Category")
        //        List<ItemSet> invoiceHeader = context.ItemSet.Include("Category").ToList();
        //        return Json(JsonConvert.SerializeObject(invoiceHeader, new JsonSerializerSettings()
        //        {
        //            ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
        //        }), JsonRequestBehavior.AllowGet);
        //    }
        //}
        //[HttpPost]
        //public void Create(ItemSet itemsetId)
        //{
        //    if (itemsetId != null)
        //    {
        //        using (CasierContentEntities context = new CasierContentEntities())
        //        {
        //            context.ItemSet.Add(itemsetId);
        //            context.SaveChanges(); 
        //        }
        //    }

        //}
        //public JsonResult GetCategory()
        //{
        //    using (CasierContentEntities context = new CasierContentEntities())
        //    {
        //        context.Configuration.ProxyCreationEnabled = false;
        //        context.Configuration.LazyLoadingEnabled = false;
        //        context.Configuration.ValidateOnSaveEnabled = false;
        //        List<CategorySet> invoiceHeader = context.CategorySet.ToList();
        //        return Json(JsonConvert.SerializeObject(invoiceHeader, new JsonSerializerSettings()
        //        {
        //            ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
        //        }), JsonRequestBehavior.AllowGet);
        //    }
        //}
        //[HttpPost]
        //public void UpdateItemSet(ItemSet itemsetId)
        //{
        //    if (itemsetId != null)
        //    {
        //        using (CasierContentEntities context = new CasierContentEntities())
        //        {

        //            ItemSet currentItemSet = context.ItemSet.Where(b => b.ItemSetId == itemsetId.ItemSetId).FirstOrDefault();
        //            //    currentItemSet = itemsetId;
        //            string name = itemsetId.Name;
        //            string itemSetNumbe = itemsetId.Number;
        //            decimal price = (decimal)itemsetId.Price;
        //            short rabat =(short)itemsetId.Discount;
        //            // Category category = itemsetId.Category1;
        //            currentItemSet.Name = name;
        //            currentItemSet.Number = itemSetNumbe;
        //            currentItemSet.Price = price;
        //            currentItemSet.Discount = rabat;
        //            context.SaveChanges();
        //            ItemSet tryagain = context.ItemSet.Where(b => b.ItemSetId == itemsetId.ItemSetId).FirstOrDefault();

        //        }
        //    }
        //}

        //public ActionResult EditCreator(CreatorSet creator)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        //db.CreatorSet.Add(creator);
        //        //db.SaveChanges();
        //    }
        //    return View(creator);
        //    }

    }
}