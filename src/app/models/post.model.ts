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
  titleEn: string;
  description: string;
  descriptionEn: string;
  content?: string;
  button: ProjectPostButton;
  buttonEn: ProjectPostButton;
  categories: string[];
  categoriesEn: string[];
  year: string;
  projectType: string[];
  projectTypeEn: string[];
  images: ProjectPostImage[];
  video: string;
}

export interface Post {
  _id: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  content?: string;
  author: string;
  coverImage?: string;
  images?: string[] | ProjectPostImage[];
  video?: string;
  videos?: string[];
  categories?: string[];
  categoriesEn?: string[];
  tags: string[];
  year?: string;
  projectType?: string | string[];
  projectTypeEn?: string | string[];
  button?: Partial<ProjectPostButton>;
  buttonEn?: Partial<ProjectPostButton>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PostSummary {
  _id: string;
  title: string;
  titleEn?: string;
  coverImage?: string;
  categories?: string[];
  categoriesEn?: string[];
  projectType?: string | string[];
  projectTypeEn?: string | string[];
  images?: string[] | ProjectPostImage[];
}
