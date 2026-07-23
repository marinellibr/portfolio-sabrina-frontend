export interface ProjectPostImage {
  url: string;
  cover: boolean;
}

export interface ProjectPostButton {
  label: string;
  link: string;
}

export interface ProjectPostPayload {
  coverImage: string;
  title: string;
  content: string;
  button: ProjectPostButton;
  categories: string[];
  year: string;
  projectType: string[];
  images: ProjectPostImage[];
  video: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  coverImage?: string;
  images?: string[] | ProjectPostImage[];
  video?: string;
  videos?: string[];
  categories?: string[];
  tags: string[];
  year?: string;
  projectType?: string | string[];
  button?: Partial<ProjectPostButton>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PostSummary {
  _id: string;
  title: string;
  images?: string[];
}
