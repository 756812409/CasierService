using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace CasierV2
{
    public class Noti : Hub
    {
        public void Hello()
        {
            Clients.All.hello();
        }
    }
}