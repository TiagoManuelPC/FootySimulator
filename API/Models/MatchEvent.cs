using System;

namespace API.Models;

public enum EventType { Pass, Shot, Goal, Tackle, Clearance, Possession }

public class MatchEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public EventType Type { get; set; }
    public string EventTypeString { get; set; } = "";
    public string Team { get; set; } = "";
    public string PlayerId { get; set; } = "";
    // Pitch coordinates in meters: x = -52(left) .. 52(right), y = -34 .. 34
    public double X { get; set; }
    public double Y { get; set; }
    public bool IsAttacking { get; set; } = false; // towards opponent goal
                                                   // Additional fields for shots
    public double? ShotSpeed { get; set; }
    public double? ShotDistance { get; set; }
    public bool? ShotOnTarget { get; set; }
}
