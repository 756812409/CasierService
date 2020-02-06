using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace CasierV2.Controllers
{
    public class UserController : Controller
    {
        // GET: User
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Login()
        {
            return View();
        }
        [HttpPost]
        public ActionResult login(string userName, string userPassword)
        {
            if (FormsAuthentication.Authenticate(userName, userPassword))
            {
                FormsAuthentication.SetAuthCookie(userName, false);
                //return RedirectToAction("Index", "Casier");
                 return Json("Casier");
             //   return RedirectToAction("AnotherAction");
            }
            else
            {
                return View("login");
            }
        }

        [HttpPost]
        public ActionResult logout()
        {
            FormsAuthentication.SignOut();
            return View();
        }
    }
}