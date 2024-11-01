import * as XLSX from "xlsx";
import ExcelJS, { BorderStyle } from "exceljs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const formData = await req.formData();
	const file = formData.get("file") as File;

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
		excelWorkbook.creator = "YourName";
		excelWorkbook.created = new Date();
		excelWorkbook.modified = new Date();

		// **Define Default Row and Column Heights**
		worksheet.properties.defaultRowHeight = 15;
		worksheet.properties.defaultColWidth = 10;

		// **Set Worksheet Views and Page Setup**
		worksheet.views = [{ state: "normal" }];
		worksheet.pageSetup = {
			orientation: "landscape",
			fitToPage: true,
			fitToWidth: 1,
			fitToHeight: 0,
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
		worksheet.getRow(2).getCell(lastColumnIndex + 1).value = "✓";
		worksheet.getRow(2).getCell(lastColumnIndex + 2).value = "tempValue"; // Leave initials blank

		// **Add 15 Extra Rows with "tempValue" for Manual Entries**
		const startRow = worksheet.rowCount - 1; // Start after the last populated row
		const endRow = startRow + 14; // Add up to 15 rows

		for (let i = startRow; i <= endRow; i++) {
			const row = worksheet.getRow(i);

			// Insert "tempValue" in cells to apply the border style
			row.getCell(lastColumnIndex).value = "tempValue"; // "Inventory Date" column
			row.getCell(lastColumnIndex + 1).value = "tempValue"; // "Checkmark" column
			row.getCell(lastColumnIndex + 2).value = "tempValue"; // "Initials" column
		}

		// **Column Deletion and Other Processing Steps**
		const columnsToDelete = [
			"Author",
			"Location",
			"ISBN/ISNN",
			"Imprint",
			"Edition",
			"Digital Availability",
			"Electronic Availability",
		];
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

		// **Add Blank Rows at the Top**
		worksheet.insertRow(1, []);
		worksheet.insertRow(1, []);

		// **Bold Formatting for the First Three Rows**
		for (let i = 1; i <= 3; i++) {
			worksheet.getRow(i).font = { bold: true };
		}

		// **Define Border Style**
		const borderStyle: Partial<ExcelJS.Borders> = {
			top: { style: "thin" as BorderStyle },
			left: { style: "thin" as BorderStyle },
			bottom: { style: "thin" as BorderStyle },
			right: { style: "thin" as BorderStyle },
		};

		// **Set Font for the Entire Document to Arial 12**
		worksheet.eachRow((row) => {
			row.eachCell((cell) => {
				cell.font = { name: "Arial", size: 12 };
				if (cell.value) {
					cell.border = borderStyle;
					// Clear "tempValue" after applying border
					if (cell.value === "tempValue") {
						cell.value = ""; // Clear the cell content
					}
				}
			});
		});

		// **Auto-Fit Columns for Printing**
		const columns = worksheet.columns as ExcelJS.Column[] | undefined;
		if (columns) {
			columns.forEach((column) => {
				let maxLength = 10; // Default width
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
