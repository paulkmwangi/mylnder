import { useEffect, useState } from "react";
import { getReports } from "../services/reportsService";
export function useReports() { const [reports, setReports] = useState<Awaited<ReturnType<typeof getReports>>>([]); useEffect(() => { getReports().then(setReports); }, []); return reports; }