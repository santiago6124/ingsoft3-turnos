using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Turnos.Api.Controllers;
using Turnos.Api.Data;
using Turnos.Api.Dtos;
using Turnos.Api.Models;
using Turnos.Api.Options;
using Turnos.Api.Services;
using Xunit;

namespace Turnos.Api.Tests.Controllers;

// What the citizen sees when picking a time: the day's grid, with the slots already
// taken marked as unavailable. A bug here shows a slot as free when it isn't, and the
// citizen only finds out when the booking is rejected (or worse, when two people show up).
public class AvailableSlotsControllerTests
{
    // 2026-07-09 is a Thursday; 2026-07-11 is a Saturday. This controller never reads
    // the clock, so fixed dates are safe here.
    private static readonly DateOnly Thursday = new(2026, 7, 9);
    private static readonly DateOnly Saturday = new(2026, 7, 11);

    private static AppointmentsDbContext CreateDb() =>
        new(new DbContextOptionsBuilder<AppointmentsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static AvailableSlotsController CreateController(AppointmentsDbContext db)
    {
        var options = Microsoft.Extensions.Options.Options.Create(new BusinessHoursOptions
        {
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(16, 0),
            SlotDurationMinutes = 15,
            BusinessDays = new[]
            {
                DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
                DayOfWeek.Thursday, DayOfWeek.Friday,
            },
        });

        return new AvailableSlotsController(db, new ScheduleService(options));
    }

    private static void Seed(AppointmentsDbContext db, int hour, int minute, AppointmentStatus status,
        string serviceType = "Pasaporte")
    {
        db.Appointments.Add(new Appointment
        {
            CitizenName = "Valeria Selviz",
            NationalId = "12345678",
            ScheduledAt = Thursday.ToDateTime(new TimeOnly(hour, minute)),
            ServiceType = serviceType,
            Status = status,
        });
        db.SaveChanges();
    }

    private static async Task<List<AvailableSlotDto>> ListSlots(AvailableSlotsController controller,
        DateOnly date, string serviceType = "Pasaporte")
    {
        var result = await controller.List(date, serviceType);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        return Assert.IsAssignableFrom<IEnumerable<AvailableSlotDto>>(ok.Value).ToList();
    }

    private static bool IsAvailable(List<AvailableSlotDto> slots, int hour, int minute) =>
        slots.Single(s => s.StartTime == new TimeOnly(hour, minute)).Available;

    [Fact]
    public async Task List_EmptyDay_ReturnsTheWholeGridAvailable()
    {
        using var db = CreateDb();
        var controller = CreateController(db);

        var slots = await ListSlots(controller, Thursday);

        Assert.Equal(28, slots.Count);
        Assert.All(slots, s => Assert.True(s.Available));
    }

    [Fact]
    public async Task List_ConfirmedAppointment_TakesItsSlot()
    {
        using var db = CreateDb();
        Seed(db, 10, 0, AppointmentStatus.Confirmed);
        var controller = CreateController(db);

        var slots = await ListSlots(controller, Thursday);

        Assert.False(IsAvailable(slots, 10, 0));
        Assert.True(IsAvailable(slots, 10, 15)); // only that slot, not its neighbours
    }

    // Only a CONFIRMED appointment takes the slot: several people can request the same
    // time, and the admin confirms one. Pending and cancelled ones must not hide it.
    [Theory]
    [InlineData(AppointmentStatus.Pending)]
    [InlineData(AppointmentStatus.Cancelled)]
    public async Task List_AppointmentNotConfirmed_LeavesTheSlotAvailable(AppointmentStatus status)
    {
        using var db = CreateDb();
        Seed(db, 10, 0, status);
        var controller = CreateController(db);

        var slots = await ListSlots(controller, Thursday);

        Assert.True(IsAvailable(slots, 10, 0));
    }

    [Fact]
    public async Task List_ConfirmedForAnotherService_DoesNotTakeTheSlot()
    {
        // Each service has its own desk: a confirmed Pasaporte at 10:00 doesn't
        // take the 10:00 Cédula slot.
        using var db = CreateDb();
        Seed(db, 10, 0, AppointmentStatus.Confirmed, serviceType: "Pasaporte");
        var controller = CreateController(db);

        var slots = await ListSlots(controller, Thursday, serviceType: "Cédula de identidad");

        Assert.True(IsAvailable(slots, 10, 0));
    }

    [Fact]
    public async Task List_NonBusinessDay_ReturnsNoSlots()
    {
        using var db = CreateDb();
        var controller = CreateController(db);

        var slots = await ListSlots(controller, Saturday);

        Assert.Empty(slots);
    }
}
