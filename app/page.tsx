"use client";

import { useState } from "react";
import { saveAs } from "file-saver";

export default function Home() {
	const [file, setFile] = useState<File | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const uploadedFile = e.target.files?.[0];
		if (uploadedFile) setFile(uploadedFile);
	};

	const handleFileUpload = async () => {
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch("/api/processFile", {
			method: "POST",
			body: formData,
		});

		if (response.ok) {
			const blob = await response.blob();
			saveAs(blob, "ProcessedFile.xlsx");
		} else {
			alert("Failed to process file");
		}
	};

	return (
		<div>
			<h1>Excel File Processor</h1>
			<label htmlFor="file-upload">Upload Excel File:</label>
			<input
				id="file-upload"
				type="file"
				accept=".xls"
				onChange={handleFileChange}
			/>
			<button onClick={handleFileUpload} disabled={!file}>
				Process File
			</button>
		</div>
	);
}
