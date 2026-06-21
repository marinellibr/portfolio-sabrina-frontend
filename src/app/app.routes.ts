import { Routes } from "@angular/router";
import { BuildingComponent } from "./pages/building/building.component";
import { ProjectsComponent } from "./pages/projects/projects.component";
import { ProjectDetailsComponent } from "./pages/project/project-details/project-details.component";
import { AboutComponent } from "./pages/about/about.component";
import { ContactComponent } from "./pages/contact/contact.component";

export const routes: Routes = [
  { path: "", component: BuildingComponent, data: { titleKey: "TITLES.HOME" } },
  { path: "building", component: BuildingComponent, data: { titleKey: "TITLES.HOME" } },
  { path: "projects", component: ProjectsComponent, data: { titleKey: "TITLES.PROJECTS" } },
  { path: "project/:id", component: ProjectDetailsComponent, data: { titleKey: "TITLES.PROJECT" } },
  { path: "about", component: AboutComponent, data: { titleKey: "TITLES.ABOUT" } },
  { path: "contact", component: ContactComponent, data: { titleKey: "TITLES.CONTACT" } },
];
