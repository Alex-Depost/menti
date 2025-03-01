import { Link } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function Navbar() {
  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="text-xl font-bold flex items-center gap-2">
            Name
          </div>
          <Link to="/profile" className="flex items-center gap-1 hover:text-indigo-200">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
              Профиль
            </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;