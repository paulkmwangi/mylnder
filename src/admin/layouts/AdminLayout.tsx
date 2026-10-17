import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useUsers } from "../hooks/useUsers";

export default function AdminLayout() {
  const [search, setSearch] = useState("");
  const { users } = useUsers();
  const location = useLocation();

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
      <AdminSidebar />
      <div className="min-h-screen lg:pl-[272px]">
        <AdminHeader search={search} onSearch={setSearch} onExport={exportUsers} />
        <div className="px-4 pb-10 pt-5 sm:px-7 lg:px-8">
          <Outlet context={{ search, setSearch, route: location.pathname }} />
        </div>
      </div>
    </div>
  );
}