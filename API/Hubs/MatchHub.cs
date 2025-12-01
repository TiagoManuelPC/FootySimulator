using API.Models;
using Microsoft.AspNetCore.SignalR;
using System;

namespace API.Hubs;

public class MatchHub : Hub
{
    public async Task SendEvent(MatchEvent ev)
    {
        await Clients.All.SendAsync("ReceiveEvent", ev);
    }
}
