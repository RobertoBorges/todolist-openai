using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoList.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusAndPosition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:priority", "low,medium,high,urgent")
                .Annotation("Npgsql:Enum:todo_status", "todo,in_progress,done")
                .OldAnnotation("Npgsql:Enum:priority", "low,medium,high,urgent");

            migrationBuilder.AddColumn<int>(
                name: "Position",
                table: "Todos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Todos",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Position",
                table: "Todos");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Todos");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:priority", "low,medium,high,urgent")
                .OldAnnotation("Npgsql:Enum:priority", "low,medium,high,urgent")
                .OldAnnotation("Npgsql:Enum:todo_status", "todo,in_progress,done");
        }
    }
}
