import { AppInfoDialog } from "@/components/app-info-dialog";
import { ModeToggle } from "@/components/toggle-theme-button";

export default function Navbar() {
	return (
		<nav className="absolute top-5 right-5 max-w-screen-2xl flex gap-2  justify-end">
			<AppInfoDialog />
			<ModeToggle />
		</nav>
	);
}
