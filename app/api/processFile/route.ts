import ExcelJS, { BorderStyle } from "exceljs";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
	const formData = await req.formData();
	const file = formData.get("file") as File;

	// Retrieve toggle states from formData
	const removeAuthor = formData.get("removeAuthor") === "true";
	const removeLocation = formData.get("removeLocation") === "true";
	const removeISBN = formData.get("removeISBN") === "true";
	const removeEdition = formData.get("removeEdition") === "true";
	const removeAvailability = formData.get("removeAvailability") === "true";
	const initials = formData.get("initials") as string;
	const endDate = formData.get("endDate");

	if (!file) {
		return new NextResponse("No file uploaded", { status: 400 });
	}

	try {
		// Step 1: Read .xls and Convert to .xlsx Buffer
		const buffer = Buffer.from(await file.arrayBuffer());
		const workbook = XLSX.read(buffer, { type: "buffer" });
		const xlsxBuffer = XLSX.write(workbook, {
			bookType: "xlsx",
			type: "buffer",
		});

		// Step 2: Load .xlsx into ExcelJS for further processing
		const excelWorkbook = new ExcelJS.Workbook();
		await excelWorkbook.xlsx.load(xlsxBuffer);
		const worksheet = excelWorkbook.worksheets[0];

		// **Set Workbook Metadata** (Creator, created date, modified date)
		excelWorkbook.creator = "Edwin Peraza";
		excelWorkbook.created = new Date();
		excelWorkbook.modified = new Date();

		// **Define Default Row and Column Heights**
		worksheet.properties.defaultRowHeight = 15;
		worksheet.properties.defaultColWidth = 10;

		// **Set Worksheet Views and Page Setup**
		worksheet.views = [{ state: "normal" }];
		worksheet.pageSetup = {
			orientation: "landscape",
			// fitToPage: true,
			// fitToWidth: 1,
			// fitToHeight: 0,
		};

		// **Add New Columns for Inventory at the End of Existing Columns Before Deletion**
		const lastColumnIndex = worksheet.columns.length + 1;

		// Add headers for "Inventory Date," "Checkmark," and "Initials" at the end
		worksheet.getRow(1).getCell(lastColumnIndex).value = "Inventory Date";
		worksheet.getRow(1).getCell(lastColumnIndex + 1).value = "✓";
		worksheet.getRow(1).getCell(lastColumnIndex + 2).value = "Initials";

		// Get current date in MM/DD/YYYY format for "Inventory Date"
		const currentDate = new Date();
		const formattedDate = `${
			currentDate.getMonth() + 1
		}/${currentDate.getDate()}/${currentDate.getFullYear()}`;

		// Populate only the first row of the new columns
		worksheet.getRow(2).getCell(lastColumnIndex).value = formattedDate;
		worksheet.getRow(2).getCell(lastColumnIndex).alignment = {
			horizontal: "center",
			vertical: "middle",
		};
		worksheet.getRow(2).getCell(lastColumnIndex + 1).value = "✓";
		worksheet.getRow(2).getCell(lastColumnIndex + 1).alignment = {
			horizontal: "center",
			vertical: "middle",
		};
		const defaultInitials = initials || "tempValue";
		worksheet.getRow(2).getCell(lastColumnIndex + 2).value = defaultInitials;
		worksheet.getRow(2).getCell(lastColumnIndex + 2).alignment = {
			horizontal: "center",
			vertical: "middle",
		};

		// **Add 15 Extra Rows with "tempValue" for Manual Entries**
		const startRow = 3; // Start after the last populated row
		const endRow = 15; // Add up to 15 rows

		for (let i = startRow; i <= endRow; i++) {
			// Insert "tempValue" in cells to apply the border style
			worksheet.getRow(i).getCell(lastColumnIndex).value = "tempValue"; // "Inventory Date" column
			worksheet.getRow(i).getCell(lastColumnIndex + 1).value = "tempValue"; // "Checkmark" column
			worksheet.getRow(i).getCell(lastColumnIndex + 2).value = "tempValue"; // "Initials" column
		}

		// **Column Deletion and Other Processing Steps**
		const columnsToDelete = [
			"Imprint",
			"Digital Availability",
			"Electronic Availability",
		];

		// Remove columns based on toggle states
		if (removeAuthor) columnsToDelete.push("Author");
		if (removeLocation) columnsToDelete.push("Location");
		if (removeISBN) columnsToDelete.push("ISBN/ISSN");
		if (removeEdition) columnsToDelete.push("Edition");
		if (removeAvailability) columnsToDelete.push("Availability");

		const headerRow = worksheet.getRow(1);

		const columnsIndicesToDelete: number[] = [];
		headerRow.eachCell((cell, colNumber) => {
			if (columnsToDelete.includes(cell.value as string)) {
				columnsIndicesToDelete.push(colNumber);
			}
		});

		// Delete columns by their indices, starting from the last to avoid shifting issues
		columnsIndicesToDelete.sort((a, b) => b - a);
		columnsIndicesToDelete.forEach((colIndex) => {
			worksheet.spliceColumns(colIndex, 1);
		});

		// Apply wrapText to all columns in the worksheet
		worksheet.columns.forEach((column) => {
			column.alignment = { wrapText: true };
		});

		// **Add Blank Rows at the Top**
		worksheet.insertRow(1, []);
		worksheet.insertRow(1, []);

		// Enable wrap text for the first two rows
		worksheet.getRow(1).alignment = { wrapText: true };
		worksheet.getRow(2).alignment = { wrapText: true };

		// **Bold Formatting for the First Three Rows**
		for (let i = 1; i <= 3; i++) {
			worksheet.getRow(i).font = { bold: true, name: "Arial", size: 11 };
		}

		// **Define Border Style**
		const borderStyle: Partial<ExcelJS.Borders> = {
			top: { style: "thin" as BorderStyle },
			left: { style: "thin" as BorderStyle },
			bottom: { style: "thin" as BorderStyle },
			right: { style: "thin" as BorderStyle },
		};

		const defaultFont = { name: "Arial", size: 11 };
		// **Set Font for the Entire Document to Arial 11**
		worksheet.eachRow((row) => {
			row.eachCell({ includeEmpty: true }, (cell) => {
				if (row.number === 3) {
					cell.font = { bold: true, name: "Arial", size: 11 };
				} else {
					cell.font = defaultFont;
				}
				if (cell.value) {
					cell.border = borderStyle;
					// Clear "tempValue" after applying border
					if (cell.value === "tempValue") {
						cell.value = ""; // Clear the cell content
					}
				}
			});
		});

		// add end date message
		if (endDate) {
			const initialsColumnHeader = "Initials";

			// Find the index of the "Initials" column by searching the first row
			const headerRow = worksheet.getRow(3);
			let initialsColumnIndex: number | undefined;

			headerRow.eachCell((cell, colNumber) => {
				if (cell.value === initialsColumnHeader) {
					initialsColumnIndex = colNumber;
				}
			});

			if (initialsColumnIndex) {
				const message = `End date updated to ${endDate} - ${initials || "N/A"}`;
				worksheet.getRow(1).getCell(initialsColumnIndex).value = message;
				worksheet.getRow(1).getCell(initialsColumnIndex).alignment = {
					horizontal: "right",
				};
			}
		}

		// **Clear Header/Footer to Avoid Extra Print Page**
		worksheet.headerFooter = {
			oddHeader: "", // Clear header for odd pages
			oddFooter: "", // Clear footer for odd pages
			evenHeader: "", // Clear header for even pages, if duplex printing
			evenFooter: "", // Clear footer for even pages, if duplex printing
		};

		// **Auto-Fit Columns for Printing**
		const columns = worksheet.columns as ExcelJS.Column[] | undefined;
		if (columns) {
			columns.forEach((column) => {
				let maxLength = 5; // Default width
				if (column) {
					column.eachCell({ includeEmpty: true }, (cell) => {
						if (cell.value) {
							const length = cell.value.toString().length;
							if (length > maxLength) maxLength = length;
						}
					});
					column.width = maxLength;
				}
			});
		} else {
			console.warn("Worksheet columns are undefined.");
		}

		// **Save Workbook to Buffer**
		const outputBuffer = await excelWorkbook.xlsx.writeBuffer();

		// **Send Processed File as Response**
		return new NextResponse(outputBuffer, {
			headers: {
				"Content-Disposition": "attachment; filename=ProcessedFile.xlsx",
				"Content-Type":
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			},
		});
	} catch (error) {
		console.error("Error processing file:", error);
		return new NextResponse("Error processing file", { status: 500 });
	}
}
