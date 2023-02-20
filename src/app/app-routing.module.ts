import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SkeletonComponent } from './templates/skeleton/skeleton.component';
import { AuthGuard } from '@guards/auth.guard';


const routes: Routes = [
  {
    path: '', component: SkeletonComponent ,children: [
      { path: 'home', component: HomeComponent, canActivate: [AuthGuard], data: { permissions: [] } },
      { path: '', redirectTo: '/home', pathMatch: 'full' }
    ]
  },

  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
