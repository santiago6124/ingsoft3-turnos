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

// GET /api/turnos — the admin panel's list and its filters. The admin decides what to
// confirm by looking at this list: a filter that silently lets the wrong rows through
// (or drops the right ones) makes them confirm the wrong appointment.
public class AppointmentsListTests
{
    private static readonly DateTime Thursday10 = new(2026, 7, 9, 10, 0, 0);
    private static readonly DateTime Friday10 = new(2026, 7, 10, 10, 0, 0);

    private static AppointmentsController CreateControllerWith(params Appointment[] appointments)
    {
        var db = new AppointmentsDbContext(new DbContextOptionsBuilder<AppointmentsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);
        db.Appointments.AddRange(appointments);
        db.SaveChanges();

        var options = Microsoft.Extensions.Options.Options.Create(new BusinessHoursOptions());
        return new AppointmentsController(db, new ScheduleService(options));
    }

    private static Appointment Appt(string name, string nationalId, DateTime at,
        AppointmentStatus status = AppointmentStatus.Pending, string serviceType = "Pasaporte") => new()
    {
        CitizenName = name,
        NationalId = nationalId,
        ScheduledAt = at,
        ServiceType = serviceType,
        Status = status,
    };

    private static List<AppointmentResponseDto> Rows(ActionResult<IEnumerable<AppointmentResponseDto>> result)
    {
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        return Assert.IsAssignableFrom<IEnumerable<AppointmentResponseDto>>(ok.Value).ToList();
    }

    [Fact]
    public async Task List_UnknownStatus_ReturnsBadRequestWithTheAllowedValues()
    {
        var controller = CreateControllerWith();

        var result = await controller.List(status: "Expired", date: null, serviceType: null, search: null);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        var error = Assert.IsType<ErrorResponseDto>(badRequest.Value);
        Assert.Contains("Pending, Confirmed, Cancelled", error.Error);
    }

    [Fact]
    public async Task List_StatusFilter_IsCaseInsensitiveAndKeepsOnlyThatStatus()
    {
        var controller = CreateControllerWith(
            Appt("Ana", "1", Thursday10, AppointmentStatus.Pending),
            Appt("Beto", "2", Thursday10, AppointmentStatus.Confirmed));

        var rows = Rows(await controller.List(status: "confirmed", date: null, serviceType: null, search: null));

        var only = Assert.Single(rows);
        Assert.Equal("Beto", only.CitizenName);
    }

    [Fact]
    public async Task List_DateFilter_KeepsTheWholeDayAndNothingFromTheNext()
    {
        var controller = CreateControllerWith(
            Appt("Ana", "1", new DateTime(2026, 7, 9, 0, 0, 0)),    // first instant of the day
            Appt("Beto", "2", new DateTime(2026, 7, 9, 23, 59, 0)), // last minute of the day
            Appt("Caro", "3", new DateTime(2026, 7, 10, 0, 0, 0))); // next day at midnight: out

        var rows = Rows(await controller.List(status: null, date: new DateOnly(2026, 7, 9), serviceType: null, search: null));

        Assert.Equal(new[] { "Ana", "Beto" }, rows.Select(r => r.CitizenName));
    }

    [Fact]
    public async Task List_ServiceTypeFilter_KeepsOnlyThatService()
    {
        var controller = CreateControllerWith(
            Appt("Ana", "1", Thursday10, serviceType: "Pasaporte"),
            Appt("Beto", "2", Thursday10, serviceType: "Radicación"));

        var rows = Rows(await controller.List(status: null, date: null, serviceType: "Radicación", search: null));

        Assert.Equal("Beto", Assert.Single(rows).CitizenName);
    }

    // The search box looks in the name OR the national id, ignoring case.
    [Theory]
    [InlineData("valeria", "Valeria Selviz")] // name, different case
    [InlineData("SELV", "Valeria Selviz")]    // part of the name
    [InlineData("3045", "Martín Ruiz")]       // part of the national id
    public async Task List_Search_MatchesNameOrNationalId(string term, string expectedName)
    {
        var controller = CreateControllerWith(
            Appt("Valeria Selviz", "12345678", Thursday10),
            Appt("Martín Ruiz", "30451234", Thursday10));

        var rows = Rows(await controller.List(status: null, date: null, serviceType: null, search: term));

        Assert.Equal(expectedName, Assert.Single(rows).CitizenName);
    }

    [Fact]
    public async Task List_NoFilters_ReturnsEverythingOrderedByTime()
    {
        var controller = CreateControllerWith(
            Appt("Tarde", "1", Friday10),
            Appt("Temprano", "2", Thursday10));

        var rows = Rows(await controller.List(status: null, date: null, serviceType: null, search: null));

        Assert.Equal(new[] { "Temprano", "Tarde" }, rows.Select(r => r.CitizenName));
    }
}
