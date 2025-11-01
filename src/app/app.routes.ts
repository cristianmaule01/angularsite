import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupsListComponent } from './groups/groups-list.component';
import { CreateGroupComponent } from './groups/create-group.component';
import { JoinGroupComponent } from './groups/join-group.component';
import { GroupDetailComponent } from './groups/group-detail.component';
import { GroupInviteComponent } from './groups/group-invite.component';
import { GroupInvitesComponent } from './groups/group-invites.component';
import { SentInvitesComponent } from './groups/sent-invites.component';
import { DecksListComponent } from './decks/decks-list.component';
import { CreateDeckComponent } from './decks/create-deck.component';
import { EditDeckComponent } from './decks/edit-deck.component';
import { UserDecksComponent } from './decks/user-decks.component';
import { ProfileComponent } from './profile/profile.component';
import { SearchGroupsComponent } from './groups/search-groups.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'invite/:referrerId/:groupId', component: GroupInviteComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'groups', component: GroupsListComponent, canActivate: [AuthGuard] },
  { path: 'groups/create', component: CreateGroupComponent, canActivate: [AuthGuard] },
  { path: 'groups/search', component: SearchGroupsComponent, canActivate: [AuthGuard] },
  { path: 'groups/join/:id', component: JoinGroupComponent, canActivate: [AuthGuard] },
  { path: 'groups/:id', component: GroupDetailComponent, canActivate: [AuthGuard] },
  { path: 'invites', component: GroupInvitesComponent, canActivate: [AuthGuard] },
  { path: 'sent-invites', component: SentInvitesComponent, canActivate: [AuthGuard] },
  { path: 'decks', component: DecksListComponent, canActivate: [AuthGuard] },
  { path: 'decks/create', component: CreateDeckComponent, canActivate: [AuthGuard] },
  { path: 'decks/edit/:id', component: EditDeckComponent, canActivate: [AuthGuard] },
  { path: 'decks/user/:userId', component: UserDecksComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];