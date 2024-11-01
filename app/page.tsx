"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/toggle-theme-button";

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
		<main className="container mx-auto flex justify-center items-center min-h-screen">
			<ModeToggle />
			<div>
				<h1 className="text-center text-4xl">RBR Inventory Formatter</h1>
				<div className="mt-4">
					<Label htmlFor="file-upload">Upload Excel File:</Label>
					<Input
						id="file-upload"
						type="file"
						accept=".xls"
						onChange={handleFileChange}
					/>
					<div className="mt-4">
						<Button onClick={handleFileUpload} disabled={!file}>
							Process File
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}
