import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Commander {
  name: string;
  imageUrl?: string;
  scryfallId?: string;
  oracleText?: string;
  typeLine?: string;
  colorIdentity?: string;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  commanders: Commander[];
  tags?: { availableTag: { name: string } }[];
  createdAt: string;
  updatedAt: string;
}

export interface ScryfallCard {
  id: string;
  name: string;
  imageUrl?: string;
  oracleText?: string;
  typeLine?: string;
  colorIdentity?: string;
}

export interface CreateDeckData {
  name: string;
  description?: string;
  commanders: Commander[];
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DecksService {
  private apiUrl = `${environment.nestUrl}/decks`;

  constructor(private http: HttpClient) {}

  createDeck(data: CreateDeckData): Observable<Deck> {
    return this.http.post<Deck>(this.apiUrl, data);
  }

  getUserDecks(): Observable<Deck[]> {
    return this.http.get<Deck[]>(`${this.apiUrl}/my-decks`);
  }

  getDeck(deckId: string): Observable<Deck> {
    return this.http.get<Deck>(`${this.apiUrl}/${deckId}`);
  }

  searchCommanders(query: string): Observable<ScryfallCard[]> {
    return this.http.get<ScryfallCard[]>(`${this.apiUrl}/search-commanders?q=${encodeURIComponent(query)}`);
  }

  deleteDeck(deckId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${deckId}`);
  }

  getAvailableTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/available-tags`);
  }

  updateDeck(deckId: string, data: CreateDeckData): Observable<Deck> {
    return this.http.put<Deck>(`${this.apiUrl}/${deckId}`, data);
  }

  getUserDecksById(userId: string): Observable<Deck[]> {
    return this.http.get<Deck[]>(`${this.apiUrl}/user/${userId}`);
  }
}