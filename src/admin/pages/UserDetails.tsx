import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/shared/LoadingState";
import UserDetailsModal from "../components/UserDetailsModal";
import { useUser } from "../hooks/useUsers";

export default function UserDetails() {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const { data: user, isPending, error } = useUser(userId);
  if (isPending) return <LoadingState/>;
  if (error && !user) return <p role="alert" className="py-10 text-center text-red-600">{error.message}</p>;
  if (!user) return <div className="py-10 text-center">User not found.</div>;
  return <>{error && <p role="alert" className="mb-4 text-sm text-amber-700">Showing cached user data; refresh failed: {error.message}</p>}<Button variant="secondary" onClick={() => navigate("/admin/users")}><ArrowLeft size={17}/> Back to users</Button><UserDetailsModal user={user} onClose={() => navigate("/admin/users")}/></>;
}