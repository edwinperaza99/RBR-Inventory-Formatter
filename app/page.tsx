"use client";

import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/toggle-theme-button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
	const [file, setFile] = useState<File | null>(null);
	const [date, setDate] = useState<Date>();
	const [initials, setInitials] = useState<string>("");

	// Initialize states to default values without accessing localStorage directly
	const [removeAuthor, setRemoveAuthor] = useState(false);
	const [removeLocation, setRemoveLocation] = useState(false);
	const [removeISBN, setRemoveISBN] = useState(false);
	const [removeEdition, setRemoveEdition] = useState(false);
	const [removeAvailability, setRemoveAvailability] = useState(false);

	// useEffect to load initial values from localStorage on the client side
	useEffect(() => {
		if (typeof window !== "undefined") {
			// Ensure we're in the client
			setRemoveAuthor(localStorage.getItem("removeAuthor") === "true");
			setRemoveLocation(localStorage.getItem("removeLocation") === "true");
			setRemoveISBN(localStorage.getItem("removeISBN") === "true");
			setRemoveEdition(localStorage.getItem("removeEdition") === "true");
			setRemoveAvailability(
				localStorage.getItem("removeAvailability") === "true"
			);
			// Load date (if it exists) and parse it
			const storedDate = localStorage.getItem("endDate");
			if (storedDate) {
				setDate(new Date(JSON.parse(storedDate)));
			}

			// Load initials
			setInitials(localStorage.getItem("initials") || "");
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

	useEffect(() => {
		if (typeof window !== "undefined")
			localStorage.setItem("removeAvailability", removeAvailability.toString());
	}, [removeAvailability]);

	useEffect(() => {
		if (date) {
			localStorage.setItem("endDate", JSON.stringify(date.toISOString()));
		}
	}, [date]);

	useEffect(() => {
		if (typeof window !== "undefined")
			localStorage.setItem("initials", initials);
	}, [initials]);

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
		formData.append("initials", initials);
		formData.append("endDate", date?.toISOString() || "");
		if (date) {
			const formattedDate = format(date, "MM/dd/yyyy");
			formData.append("endDate", formattedDate);
			console.log(formattedDate);
		}

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
				RBR List Formatter
			</h1>
			<form
				className="space-y-3"
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
				<div className="flex flex-col gap-1">
					<Label>End Date:</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant={"outline"}
								className={cn(
									"w-[280px] justify-start text-left font-normal",
									!date && "text-muted-foreground"
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{date ? format(date, "PPP") : <span>Pick a date</span>}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={date}
								onSelect={setDate}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>
				<div className="flex flex-col gap-1">
					<Label>Initials:</Label>
					<Input
						type="text"
						placeholder="This field is optional"
						className="px-4"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<Label htmlFor="file-upload">Upload Excel File:</Label>
					<Input
						id="file-upload"
						type="file"
						accept=".xls"
						onChange={handleFileChange}
					/>
				</div>
				<div className="mt-4">
					<Button type="submit" disabled={!file}>
						Process File
					</Button>
				</div>
			</form>
		</main>
	);
}
