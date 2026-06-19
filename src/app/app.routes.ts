import { Routes } from "@angular/router";
import { BuildingComponent } from "./pages/building/building.component";
import { ProjectsComponent } from "./pages/projects/projects.component";
import { ProjectDetailsComponent } from "./pages/project/project-details/project-details.component";
import { AboutComponent } from "./pages/about/about.component";
import { ContactComponent } from "./pages/contact/contact.component";

export const routes: Routes = [
  { path: "", component: BuildingComponent },
  { path: "building", component: BuildingComponent },
  { path: "projects", component: ProjectsComponent },
  { path: "project/:id", component: ProjectDetailsComponent },
  { path: "about", component: AboutComponent },
  { path: "contact", component: ContactComponent },
];
