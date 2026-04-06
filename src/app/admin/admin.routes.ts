import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobFormComponent } from './pages/job-form/job-form.component';
import { JobListComponent } from './pages/job-list/job-list.component';
import { JobDetailComponent } from './pages/job-detail/job-detail.component';
import { CustomerListComponent } from './pages/customer-list/customer-list.component';
import { CustomerDetailComponent } from './pages/customer-detail/customer-detail.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'jobs/new', component: JobFormComponent },
      { path: 'jobs/:id', component: JobDetailComponent },
      { path: 'jobs', component: JobListComponent },
      { path: 'customers/:id', component: CustomerDetailComponent },
      { path: 'customers', component: CustomerListComponent },
    ]
  }
];
