export interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  images?: string[];
  videos?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PostSummary {
  _id: string;
  title: string;
  images?: string[];
}
