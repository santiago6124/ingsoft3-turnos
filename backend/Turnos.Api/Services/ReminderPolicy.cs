using Turnos.Api.Models;

namespace Turnos.Api.Services;

/// <summary>
/// Decides when to remind a citizen about their appointment. A reminder too early is
/// forgotten; one too late is useless (they can't get to the office in time).
/// </summary>
public class ReminderPolicy
{
    private static readonly TimeSpan DayBefore = TimeSpan.FromHours(24);
    private static readonly TimeSpan HourBefore = TimeSpan.FromHours(1);
    private static readonly TimeSpan TooLateToBeUseful = TimeSpan.FromMinutes(30);

    /// <summary>
    /// When the next reminder should go out, or null if none should.
    /// <paramref name="now"/> comes in as a parameter so the rule doesn't read the clock.
    /// </summary>
    public DateTime? NextReminderAt(Appointment appointment, DateTime now)
    {
        if (appointment.Status == AppointmentStatus.Cancelled)
            return null;

        var timeLeft = appointment.ScheduledAt - now;
        if (timeLeft <= TooLateToBeUseful)
            return null;

        if (timeLeft > DayBefore)
            return appointment.ScheduledAt - DayBefore;

        // Pending appointments only get the day-before reminder: the hour-before one
        // is for people who already have a confirmed slot.
        if (appointment.Status != AppointmentStatus.Confirmed)
            return null;

        if (timeLeft > HourBefore)
            return appointment.ScheduledAt - HourBefore;

        return now;
    }
}
