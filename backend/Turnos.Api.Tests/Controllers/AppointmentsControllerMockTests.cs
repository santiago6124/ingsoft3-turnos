using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Turnos.Api.Controllers;
using Turnos.Api.Data;
using Turnos.Api.Dtos;
using Turnos.Api.Services;
using Xunit;

namespace Turnos.Api.Tests.Controllers;

// The controller depends on IScheduleService (the business-hours grid). The other
// controller tests use the REAL ScheduleService, so they test the controller and the
// grid together. Here the grid is replaced by a Moq double: the test controls what the
// grid answers, and checks HOW the controller talks to it.
//
// Why this is a mock and not just a stub: a stub only returns canned answers (the
// Setup). This test also VERIFIES the interaction — that the controller asked the grid,
// once, about the exact date it received — and that nothing reached the database.
public class AppointmentsControllerMockTests
{
    [Fact]
    public async Task Create_GridRejectsTheSlot_ReturnsBadRequestAndSavesNothing()
    {
        // Arrange
        var db = new AppointmentsDbContext(new DbContextOptionsBuilder<AppointmentsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

        var grid = new Mock<IScheduleService>();
        grid.Setup(g => g.IsSlotValid(It.IsAny<DateTime>())).Returns(false);

        var controller = new AppointmentsController(db, grid.Object);
        var scheduledAt = DateTime.Today.AddDays(3).AddHours(10); // future: passes the first check
        var dto = new CreateAppointmentDto
        {
            CitizenName = "Valeria Selviz",
            NationalId = "12345678",
            ScheduledAt = scheduledAt,
            ServiceType = "Pasaporte",
        };

        // Act
        var result = await controller.Create(dto);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("The chosen time doesn't correspond to an available slot.",
            Assert.IsType<ErrorResponseDto>(badRequest.Value).Error);
        grid.Verify(g => g.IsSlotValid(scheduledAt), Times.Once);
        Assert.Empty(db.Appointments);
    }
}
