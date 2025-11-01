import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Group {
  id: string;
  name: string;
  passwordHash?: string;
  creatorId: string;
  creator: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
}

export interface GroupMember {
  id: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  role: string;
  joinedAt: string;
}

export interface CreateGroupData {
  name: string;
  password?: string;
}

export interface JoinGroupData {
  groupId: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private apiUrl = `${environment.nestUrl}/groups`;

  constructor(
    private http: HttpClient
  ) {}

  createGroup(data: CreateGroupData): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, data);
  }

  joinGroup(data: JoinGroupData): Observable<any> {
    return this.http.post(`${this.apiUrl}/join`, data);
  }

  getUserGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/my-groups`);
  }

  searchGroups(query: string): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
  }

  getGroupMembers(groupId: string): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${this.apiUrl}/${groupId}/members`);
  }

  leaveGroup(groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/leave`, {});
  }

  kickMember(groupId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/kick/${userId}`, {});
  }

  updateMemberRole(groupId: string, userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${groupId}/members/${userId}/role`, { role });
  }

  getInviteInfo(referrerId: string, groupId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/invite/${referrerId}/${groupId}`);
  }

  acceptInvite(referrerId: string, groupId: string, password?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/invite/${referrerId}/${groupId}/accept`, { password });
  }

  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search-users?q=${encodeURIComponent(query)}`);
  }

  sendInvite(groupId: string, inviteeId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/invite`, { inviteeId });
  }

  getUserInvites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/invites/received`);
  }

  getSentInvites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/invites/sent`);
  }

  updateInviteStatus(inviteId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/invites/${inviteId}/status`, { status });
  }
}