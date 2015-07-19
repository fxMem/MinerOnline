using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nancy;

namespace OwinHost
{
    public class MinerModule : NancyModule
    {
        public MinerModule()
        {
            Get["/"] = _ => 
            { 
                return View["miner.html"]; 
            };
        }
    }
}
