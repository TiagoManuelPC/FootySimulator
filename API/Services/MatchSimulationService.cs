using System;
using API.Hubs;
using API.Models;
using Microsoft.AspNetCore.SignalR;

namespace API.Services;

public class MatchSimulator
{
    private readonly IHubContext<MatchHub> _hub;
    private Timer? _timer;
    private readonly Random _rng = new();
    private readonly List<string> _teamAPlayers = new()
    {
        "Ederson",
        "Kyle Walker",
        "Rúben Dias",
        "John Stones",
        "Joško Gvardiol",
        "Rodri",
        "Kevin De Bruyne",
        "Bernardo Silva",
        "Phil Foden",
        "Erling Haaland",
        "Jack Grealish"
    };
    private readonly List<string> _teamBPlayers = new() 
    {
        "Alisson Becker",
        "Trent Alexander-Arnold",
        "Virgil van Dijk",
        "Ibrahima Konaté",
        "Andrew Robertson",
        "Alexis Mac Allister",
        "Dominik Szoboszlai",
        "Curtis Jones",
        "Mohamed Salah",
        "Darwin Núñez",
        "Luis Díaz"
    };
    public bool IsRunning { get; private set; } = false;

    public MatchSimulator(IHubContext<MatchHub> hub)
    {
        _hub = hub;
    }

    public void Start()
    {
        if (IsRunning) return;
        IsRunning = true;
        // every 600ms -> generate an event
        _timer = new Timer(async _ => await Tick(), null, 0, 1000);
    }

    public void Stop()
    {
        if (!IsRunning) return;
        _timer?.Dispose();
        IsRunning = false;
    }

    private async Task Tick()
    {
        // Choose team, player, event type probabilistically
        var teamIsA = _rng.NextDouble() > 0.48; // slight randomness
        var team = teamIsA ? "Manchester City" : "Liverpool FC";
        var players = teamIsA ? _teamAPlayers : _teamBPlayers;
        var player = players[_rng.Next(players.Count)];

        // pick position depending on attack/defense random
        var x = (_rng.NextDouble() * 104) - 52; // -52..52
        var y = (_rng.NextDouble() * 68) - 34;  // -34..34

        // choose event type weighted
        var r = _rng.NextDouble();
        EventType type;
        if (r < 0.55) type = EventType.Pass;
        else if (r < 0.75) type = EventType.Possession;
        else if (r < 0.92) type = EventType.Tackle;
        else type = (_rng.NextDouble() > 0.55) ? EventType.Shot : EventType.Clearance;

        var ev = new MatchEvent
        {
            EventTypeString = type.ToString(),
            Team = team,
            PlayerId = player,
            X = x,
            Y = y,
            IsAttacking = teamIsA ? (x > 0) : (x < 0)
        };

        if (type == EventType.Shot)
        {
            ev.ShotDistance = Math.Sqrt((52 - Math.Abs(x)) * (52 - Math.Abs(x)) + (34 - Math.Abs(y)) * (34 - Math.Abs(y)));
            ev.ShotSpeed = _rng.Next(50, 95); // km/h or arbitrary
            ev.ShotOnTarget = _rng.NextDouble() > 0.4;
            // small chance of goal
            if (_rng.NextDouble() < CalculateShotGoalProbability(ev)) // server side probability
            {
                ev.EventTypeString = EventType.Goal.ToString();
            }
        }

        // broadcast
        await _hub.Clients.All.SendAsync("ReceiveEvent", ev);
    }

    // Simple server-side model (distance + shot speed)
    private double CalculateShotGoalProbability(MatchEvent ev)
    {
        if (!ev.ShotDistance.HasValue) return 0.0;
        // closer -> higher probability. At 6m ~0.5, at 25m -> 0.02
        var d = ev.ShotDistance.Value;
        var baseProb = Math.Max(0.01, 0.5 * Math.Exp(-0.12 * d));
        // speed modifier
        var speedMod = ev.ShotSpeed.HasValue ? Math.Min(1.6, 0.6 + (ev.ShotSpeed.Value / 120.0)) : 1.0;
        return Math.Min(0.95, baseProb * speedMod);
    }
}
