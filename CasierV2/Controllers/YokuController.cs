using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CasierV2.Controllers
{
    [AllowAnonymous]
    public class YokuController : Controller
    {
        [AllowAnonymous]
        // GET: Index
        public ActionResult Index()
        {
            return View();
        }
    }
}