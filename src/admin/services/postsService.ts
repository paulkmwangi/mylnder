import { mockPosts } from "../data/mockPosts";
export async function getPosts() { return Promise.resolve(mockPosts); }