import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/shared/LoadingState";
import UserDetailsModal from "../components/UserDetailsModal";
import { getUserById } from "../services/usersService";
import type { SavedUser } from "../types/admin.types";

export default function UserDetails() {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<SavedUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getUserById(userId).then((result) => setUser(result ?? null)).finally(() => setLoading(false));
  }, [userId]);
  if (loading) return <LoadingState/>;
  if (!user) return <div className="py-10 text-center">User not found.</div>;
  return <><Button variant="secondary" onClick={() => navigate("/admin/users")}><ArrowLeft size={17}/> Back to users</Button><UserDetailsModal user={user} onClose={() => navigate("/admin/users")}/></>;
}