using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalR.TicTacToeLib
{
    public class UserDetail
    {
        public string ConnectionId { get; set; }
        public string UserName { get; set; }
        public string Status { get; set; }
    }
}