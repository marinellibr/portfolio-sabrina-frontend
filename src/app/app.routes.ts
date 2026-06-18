import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BuildingComponent } from './pages/building/building.component';
import { ProjectComponent } from './pages/project/project.component';
import { ProjectDetailsComponent } from './pages/project/project-details/project-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'building', component: BuildingComponent },
  { path: 'project', component: ProjectComponent },
  { path: 'project/:id', component: ProjectDetailsComponent }
];
