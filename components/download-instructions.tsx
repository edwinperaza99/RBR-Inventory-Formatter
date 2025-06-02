"use client";

import * as React from "react";
import { Info, Download } from "lucide-react";
import { HiArrowLeft } from "react-icons/hi";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogClose,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

export function DownloadInstructionsDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Download className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Download Instructions</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-center text-3xl">
						Setup Guide
					</DialogTitle>
					<DialogDescription>
						Follow these steps to install and run the app.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					{/* Instructions */}
					<section>
						<h3 className="text-lg font-semibold">Instructions</h3>
						<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
							<li>
								Click the button below to download the app:
								<div className="mt-2">
									<Button
										variant="outline"
										className="flex items-center space-x-2"
										asChild
									>
										<Link
											href="https://github.com/edwinperaza99/rbr-inventory-formatter-electron/releases/download/win-1.0.0/RBR-Inventory-Formatter.zip"
											download
										>
											<Download className="h-4 w-4" />
											<span>Download App</span>
										</Link>
									</Button>
								</div>
							</li>
							<li>
								If Windows shows a warning that the app is &quot;not safe&quot;
								or &quot;from an unknown publisher,&quot; click{" "}
								<strong>More info</strong> and then click{" "}
								<strong>Run anyway</strong>.
							</li>
							<li>
								Once the download is complete, extract the compressed folder.
								You can right-click the file and choose{" "}
								<strong>Extract All</strong>.
							</li>
							<li>
								Open the extracted folder, then double-click the file named{" "}
								<code className="bg-muted text-accent-foreground px-1 rounded">
									run setup
								</code>
								. The app should launch immediately.
							</li>
							<li>
								After the app opens, right-click the icon on the taskbar and
								select <strong>Pin to taskbar</strong> for quick access in the
								future.
							</li>
						</ol>
					</section>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" className="w-full">
							<HiArrowLeft className="h-5 w-5" />
							<span>Back to App</span>
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
