using Microsoft.Extensions.Options;
using Turnos.Api.Options;
using Turnos.Api.Services;
using Xunit;

namespace Turnos.Api.Tests.Services;

public class ScheduleServiceTests
{
    private static IScheduleService CreateService()
    {
        var options = new BusinessHoursOptions
        {
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(16, 0),
            SlotDurationMinutes = 15,
            BusinessDays = new[]
            {
                DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
                DayOfWeek.Thursday, DayOfWeek.Friday,
            },
        };

        return new ScheduleService(Microsoft.Extensions.Options.Options.Create(options));
    }

    // 2026-07-09 is a Thursday. Business hours 9:00-16:00 in 15-minute slots.
    // Each row is one edge of the grid: moving a comparison from <= to < (or the
    // other way around) turns at least one of them red.
    [Theory]
    [InlineData(8, 45, 0, false)]  // before opening
    [InlineData(9, 0, 0, true)]    // first slot of the day
    [InlineData(9, 5, 0, false)]   // not aligned to the 15-minute grid
    [InlineData(9, 15, 0, true)]   // aligned, mid-morning
    [InlineData(9, 15, 30, false)] // aligned minute, but seconds != 0
    [InlineData(15, 45, 0, true)]  // last slot: 15:45 + 15 = 16:00 exactly
    [InlineData(16, 0, 0, false)]  // would end at 16:15, after closing
    public void IsSlotValid_BusinessDay_RespectsTheGridEdges(int hour, int minute, int second, bool expected)
    {
        var service = CreateService();
        var dateTime = new DateTime(2026, 7, 9, hour, minute, second);

        var isValid = service.IsSlotValid(dateTime);

        Assert.Equal(expected, isValid);
    }

    [Fact]
    public void IsSlotValid_Weekend_IsNotValid()
    {
        var service = CreateService();
        // 2026-07-11 is a Saturday, at a time that would be valid on a weekday.
        var dateTime = new DateTime(2026, 7, 11, 9, 0, 0);

        var isValid = service.IsSlotValid(dateTime);

        Assert.False(isValid);
    }

    [Fact]
    public void GetDaySlots_BusinessDay_ReturnsFullGrid()
    {
        var service = CreateService();

        // 2026-07-09 is a Thursday. From 09:00 to 16:00 in 15-min steps: 28 slots.
        var slots = service.GetDaySlots(new DateOnly(2026, 7, 9));

        Assert.Equal(28, slots.Count);
        Assert.Equal(new TimeOnly(9, 0), slots[0]);
        Assert.Equal(new TimeOnly(15, 45), slots[^1]);
    }

    [Fact]
    public void GetDaySlots_Weekend_ReturnsEmpty()
    {
        var service = CreateService();

        // 2026-07-11 is a Saturday.
        var slots = service.GetDaySlots(new DateOnly(2026, 7, 11));

        Assert.Empty(slots);
    }
}
