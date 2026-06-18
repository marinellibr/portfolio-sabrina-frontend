import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BuildingComponent } from './pages/building/building.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'building', component: BuildingComponent }
];
