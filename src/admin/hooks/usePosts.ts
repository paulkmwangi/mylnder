import { useEffect, useState } from "react";
import { getPosts } from "../services/postsService";
export function usePosts() { const [posts, setPosts] = useState<Awaited<ReturnType<typeof getPosts>>>([]); useEffect(() => { getPosts().then(setPosts); }, []); return posts; }