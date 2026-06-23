import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./pages/building/building.component").then((m) => m.BuildingComponent),
    data: { titleKey: "TITLES.HOME" },
  },
  {
    path: "building",
    loadComponent: () => import("./pages/building/building.component").then((m) => m.BuildingComponent),
    data: { titleKey: "TITLES.HOME" },
  },
  {
    path: "projects",
    loadComponent: () => import("./pages/projects/projects.component").then((m) => m.ProjectsComponent),
    data: { titleKey: "TITLES.PROJECTS" },
  },
  {
    path: "project/:id",
    loadComponent: () =>
      import("./pages/project/project-details/project-details.component").then((m) => m.ProjectDetailsComponent),
    data: { titleKey: "TITLES.PROJECT" },
  },
  {
    path: "about",
    loadComponent: () => import("./pages/about/about.component").then((m) => m.AboutComponent),
    data: { titleKey: "TITLES.ABOUT" },
  },
  {
    path: "contact",
    loadComponent: () => import("./pages/contact/contact.component").then((m) => m.ContactComponent),
    data: { titleKey: "TITLES.CONTACT" },
  },
  {
    path: "login",
    loadComponent: () => import("./pages/login/login.component").then((m) => m.LoginComponent),
    data: { titleKey: "TITLES.LOGIN" },
  },
  {
    path: "admin",
    loadComponent: () => import("./pages/admin/admin.component").then((m) => m.AdminComponent),
    canActivate: [authGuard],
    data: { titleKey: "TITLES.ADMIN" },
  },
];
