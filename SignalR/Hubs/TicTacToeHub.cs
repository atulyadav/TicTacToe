using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using SignalR.TicTacToeLib;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace SignalR.Hubs
{
    public class TicTacToeHub : Hub
    {
        #region Data Members

        static List<UserDetail> ConnectedUsers = new List<UserDetail>();
        static List<MessageDetail> CurrentMessage = new List<MessageDetail>();
        static List<string> groupNames = new List<string>();

        #endregion

        #region Methods
        public void Connect(string userName)
        {
            var id = Context.ConnectionId;


            if (ConnectedUsers.Count(x => x.ConnectionId == id) == 0)
            {
                ConnectedUsers.Add(new UserDetail { ConnectionId = id, UserName = userName, Status = "off" });

                // send to caller
                Clients.Caller.onConnected(id, userName, ConnectedUsers.Where(u=>u.ConnectionId != id));
                // Clients.All.onConnected(id, userName, ConnectedUsers);

                // send to all except caller client
               Clients.AllExcept(id).onNewUserConnected(id, userName, ConnectedUsers);

                // upadte connected user list
               // Clients.All.onlineUserList(ConnectedUsers);

            }

        }

        public void SendMessageToAll(string userName, string message)
        {
            // store last 100 messages in cache
            //AddMessageinCache(userName, message);

            // Broad cast message
            Clients.All.messageReceived(userName, message);
        }

        public void SendPrivateMessage(string toUserId, string message)
        {

            string fromUserId = Context.ConnectionId;

            var toUser = ConnectedUsers.FirstOrDefault(x => x.ConnectionId == toUserId);
            var fromUser = ConnectedUsers.FirstOrDefault(x => x.ConnectionId == fromUserId);

            if (toUser != null && fromUser != null)
            {
                // send to 
                Clients.Client(toUserId).sendPrivateMessage(fromUserId, fromUser.UserName, message);

                // send to caller user
                Clients.Caller.sendPrivateMessage(toUserId, fromUser.UserName, message);
            }

        }
        
        public override System.Threading.Tasks.Task OnConnected()
        {
            
            //    var item = ConnectedUsers.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            //    if (item != null)
            //    {
            //        ConnectedUsers.Remove(item);

            //        var id = Context.ConnectionId;
            //        Clients.All.onUserDisconnected(id, item.UserName);

            //    }

            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            if (ConnectedUsers.Any(c => c.ConnectionId == Context.ConnectionId))
            {
                var user = ConnectedUsers.First(u => u.ConnectionId == Context.ConnectionId);
                ConnectedUsers.Remove(user);
            }

            if (groupNames.Any(g => g.Contains(Context.ConnectionId)))
            {
                var groupToBeRemoved = groupNames.Where(g => g.Contains(Context.ConnectionId)).FirstOrDefault();
                groupNames.Remove(groupToBeRemoved);
            }
            return base.OnDisconnected(stopCalled);
        }

        //public override Task OnReconnected()
        //{
        //    string name = Context.User.Identity.Name;

        //    if (!ConnectedUsers.Any(c => c.ConnectionId == Context.ConnectionId))
        //    {
        //        var user = ConnectedUsers.First(u => u.ConnectionId == Context.ConnectionId);
        //        ConnectedUsers.Remove(user);
        //    }

        //    return base.OnReconnected();
        //}
        #endregion

        public void OnlineUserList()
        {
           Clients.All.onlineUserList(ConnectedUsers);
        }

        public void SetupStatus()
        {
            Clients.Caller.setupComplete();
        }

        public async Task<bool> RequestToConnectionId(string user)
        {
            try
            {
                UserDetail userDetail = JsonConvert.DeserializeObject<UserDetail>(user);
                string requestToConnectionId = userDetail.ConnectionId;
                if (groupNames != null && groupNames.Any(g => g.Contains(requestToConnectionId) && !g.Contains(Context.ConnectionId)))
                {
                    Clients.Caller.opponentIsOccupied();
                    return false;
                }

                // Call and await in separate statements.
                Task<bool> isSuccess = AddToGroup(requestToConnectionId);
                if (await isSuccess)
                {
                    var group = groupNames.Where(g => g.Contains(requestToConnectionId)).FirstOrDefault();
                    Clients.Group(group).playersReadyToPlay(userDetail, ConnectedUsers.Where(u => u.ConnectionId == Context.ConnectionId).FirstOrDefault().UserName, group);
                    Clients.Group(group, Context.ConnectionId).playYourFirstTurn();
                    return await isSuccess;
                }
                else
                {
                    Clients.Caller.opponentNotConnected();
                    return await isSuccess;
                }
            }
            catch(Exception ex)
            {
                return false;
            }
           
        }

        public async Task<bool> AddToGroup(string requestToConnectionId)
        {
            string id = Context.ConnectionId;
            string groupName = string.Format(id + "/" + requestToConnectionId);
            string rGroupName = string.Format(requestToConnectionId + "/" + id );
            bool isBothUserConnected;
            if (groupNames.Any(g => g.Contains(id) || g.Contains(requestToConnectionId)))
            {
                if(groupNames.Any(g => g.Contains(groupName) || g.Contains(rGroupName)))
                {
                    var duplicateName = groupNames.Where(g => g.Contains(groupName) || g.Contains(rGroupName));
                    if (duplicateName.Count() > 1)
                    {
                        groupNames.RemoveAll(g => g.Contains(groupName) || g.Contains(rGroupName));
                        groupNames.Add(groupName);
                    }
                }
            }
            
            if (this.CheckClientExist(requestToConnectionId))
            {
                try
                {
                    await Groups.Add(id, groupName);
                    await Groups.Add(requestToConnectionId, groupName);
                    isBothUserConnected = true;
                    if (groupNames != null && groupName.Count() > 0)
                    {
                        if(!groupNames.Any(g => g.Equals(groupName)))
                        {
                            groupNames.Add(groupName);
                        }
                    }
                    
                }
                catch(Exception ex)
                {
                    isBothUserConnected = false;
                }
            }
            else
            {
                // client is not connected
                isBothUserConnected = false;
            }
            return isBothUserConnected;
        }

        private bool CheckClientExist(string id)
        {   
            return ConnectedUsers.Any(u => u.ConnectionId == id);
        }

        public void PlayYourTurn(int index, int activePlayer, string groupName)
        {
            if (groupNames.Any(g => g.Contains(groupName)))
            {
                Clients.Group(groupName, Context.ConnectionId).playYourTurn(index, activePlayer);
            }
        }

        public void updateCellOfOpponent(int index, int activePlayer, string groupName)
        {
            if (groupNames.Any(g => g.Contains(groupName)))
            {
                Clients.Group(groupName, Context.ConnectionId).updateCellOfOpponent(index, activePlayer);
            }
        }

    }
}