"use client";

import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/toggle-theme-button";
import { Switch } from "@/components/ui/switch";

export default function Home() {
	const [file, setFile] = useState<File | null>(null);

	// Initialize states to default values without accessing localStorage directly
	const [removeAuthor, setRemoveAuthor] = useState(false);
	const [removeLocation, setRemoveLocation] = useState(false);
	const [removeISBN, setRemoveISBN] = useState(false);
	const [removeEdition, setRemoveEdition] = useState(false);

	// useEffect to load initial values from localStorage on the client side
	useEffect(() => {
		if (typeof window !== "undefined") {
			// Ensure we're in the client
			setRemoveAuthor(localStorage.getItem("removeAuthor") === "true");
			setRemoveLocation(localStorage.getItem("removeLocation") === "true");
			setRemoveISBN(localStorage.getItem("removeISBN") === "true");
			setRemoveEdition(localStorage.getItem("removeEdition") === "true");
		}
	}, []);

	// Individual useEffects to update localStorage whenever toggle state changes
	useEffect(() => {
		if (typeof window !== "undefined")
			localStorage.setItem("removeAuthor", removeAuthor.toString());
	}, [removeAuthor]);

	useEffect(() => {
		if (typeof window !== "undefined")
			localStorage.setItem("removeLocation", removeLocation.toString());
	}, [removeLocation]);

	useEffect(() => {
		if (typeof window !== "undefined")
			localStorage.setItem("removeISBN", removeISBN.toString());
	}, [removeISBN]);

	useEffect(() => {
		if (typeof window !== "undefined")
			localStorage.setItem("removeEdition", removeEdition.toString());
	}, [removeEdition]);
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const uploadedFile = e.target.files?.[0];
		if (uploadedFile) setFile(uploadedFile);
	};

	const handleFileUpload = async () => {
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		// Append toggle states to formData to send to backend
		formData.append("removeAuthor", removeAuthor.toString());
		formData.append("removeLocation", removeLocation.toString());
		formData.append("removeISBN", removeISBN.toString());
		formData.append("removeEdition", removeEdition.toString());
		formData.append("removeAvailability", removeAvailability.toString());

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
		<main className="container mx-auto flex flex-col justify-center items-center min-h-screen">
			<ModeToggle />
			<h1 className="text-center text-3xl sm:text-5xl my-5">
				RBR Inventory Formatter
			</h1>
			<form
				className="mt-4 space-y-2 "
				onSubmit={(e) => {
					e.preventDefault(); // Prevents default form submission
					handleFileUpload(); // Calls your custom upload function
				}}
			>
				<div className="flex items-center space-x-2">
					<Switch
						id="author"
						checked={removeAuthor}
						onCheckedChange={(checked) => setRemoveAuthor(checked)}
					/>
					<Label htmlFor="author">Delete &quot;Author&quot; Column</Label>
				</div>
				<div className="flex items-center space-x-2">
					<Switch
						id="location"
						checked={removeLocation}
						onCheckedChange={(checked) => setRemoveLocation(checked)}
					/>
					<Label htmlFor="location">Delete &quot;Location&quot; Column</Label>
				</div>
				<div className="flex items-center space-x-2">
					<Switch
						id="ISBN/ISSN"
						checked={removeISBN}
						onCheckedChange={(checked) => setRemoveISBN(checked)}
					/>
					<Label htmlFor="ISBN/ISSN">Delete &quot;ISBN/ISSN&quot; Column</Label>
				</div>
				<div className="flex items-center space-x-2">
					<Switch
						id="Edition"
						checked={removeEdition}
						onCheckedChange={(checked) => setRemoveEdition(checked)}
					/>
					<Label htmlFor="Edition">Delete &quot;Edition&quot; Column</Label>
				</div>
				<div className="flex items-center space-x-2">
					<Switch
						id="Availability"
						checked={removeAvailability}
						onCheckedChange={(checked) => setRemoveAvailability(checked)}
					/>
					<Label htmlFor="Availability">
						Delete &quot;Availability&quot; Column
					</Label>
				</div>
				<Label htmlFor="file-upload" className="mt-4 block">
					Upload Excel File:
				</Label>
				<Input
					id="file-upload"
					type="file"
					accept=".xls"
					onChange={handleFileChange}
				/>
				<div className="mt-4">
					<Button type="submit" disabled={!file}>
						Process File
					</Button>
				</div>
			</form>
		</main>
	);
}
