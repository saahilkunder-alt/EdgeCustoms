import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PpfComponent } from './pages/ppf/ppf.component';
import { CeramicComponent } from './pages/ceramic/ceramic.component';
import { GrapheneComponent } from './pages/graphene/graphene.component';
import { WrappingComponent } from './pages/wrapping/wrapping.component';
import { DetailingComponent } from './pages/detailing/detailing.component';
import { SunfilmsComponent } from './pages/sunfilms/sunfilms.component';
import { CodingComponent } from './pages/coding/coding.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'services/ppf', component: PpfComponent },
  { path: 'services/ceramic', component: CeramicComponent },
  { path: 'services/graphene', component: GrapheneComponent },
  { path: 'services/wrapping', component: WrappingComponent },
  { path: 'services/detailing', component: DetailingComponent },
  { path: 'services/sunfilms', component: SunfilmsComponent },
  { path: 'services/coding', component: CodingComponent },
  {
    path: 'edge-staff',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  { path: 'admin', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' }
];
