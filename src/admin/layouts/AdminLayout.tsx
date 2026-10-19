import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useUsers } from "../hooks/useUsers";

export default function AdminLayout() {
  const [search, setSearch] = useState("");
  const [university, setUniversity] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { users } = useUsers();
  const location = useLocation();
  const universities = [...new Set(users.map((user) => user.university).filter((name) => name.trim()))]
    .sort((left, right) => left.localeCompare(right));

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const exportUsers = () => {
    const csv = [
      ["Name", "University", "Major", "Instagram", "Bio", "Song", "Image Count"].join(","),
      ...users.map((user) => [user.name, user.university, user.major, user.instagram, user.bio ?? "", user.song ?? "", user.images.length].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "mylnder-users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#fbfdff]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen lg:pl-[272px]">
        <AdminHeader
          search={search}
          onSearch={setSearch}
          university={university}
          universities={universities}
          onUniversityChange={setUniversity}
          showUniversityFilter={location.pathname === "/admin/users"}
          onExport={exportUsers}
          onMenuClick={() => setSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
        />
        <div className="px-4 pb-10 pt-5 sm:px-7 lg:px-8">
          <Outlet context={{ search, university, setSearch, setUniversity, route: location.pathname }} />
        </div>
      </div>
    </div>
  );
}