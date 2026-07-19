using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ajir.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIssueTypeAndPriority : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "Issues",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Issues",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Issues");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Issues");
        }
    }
}
