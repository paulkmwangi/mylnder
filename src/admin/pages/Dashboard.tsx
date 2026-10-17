import { UsersRound, Image, GraduationCap, University } from "lucide-react";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import { useUsers } from "../hooks/useUsers";
import LoadingState from "../../components/shared/LoadingState";

export default function Dashboard() {
  const { users, loading } = useUsers();
  if (loading) return <LoadingState/>;
  return <main>
    <div className="mb-7"><h1 className="text-3xl font-extrabold text-myinder-navy">Overview</h1><p className="mt-1 text-sm text-myinder-muted">Welcome to your Myinder campus community dashboard.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Saved Users" value={users.length} Icon={UsersRound}/>
      <StatCard title="Universities" value={new Set(users.map((user) => user.university)).size} Icon={University}/>
      <StatCard title="Study Areas" value={new Set(users.map((user) => user.major)).size} Icon={GraduationCap}/>
      <StatCard title="Uploaded Images" value={users.reduce((sum, user) => sum + user.images.length, 0)} Icon={Image}/>
    </div>
    <div className="mb-4 mt-8"><h2 className="text-lg font-bold text-myinder-navy">Recently Saved Users</h2><p className="mt-1 text-sm text-myinder-muted">A quick view of submitted campus community profiles.</p></div>
    <DataTable users={users.slice(0, 6)}/>
  </main>;
}