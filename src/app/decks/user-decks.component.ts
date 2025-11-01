import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DecksService, Deck } from './decks.service';
import { NavigationComponent } from '../shared/navigation.component';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-user-decks',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="user-decks-container">
      <header class="decks-header">
        <button (click)="goBack()" class="back-btn">← Back</button>
      </header>
      
      <div class="user-title">
        <h1>{{ userName }}'s Decks</h1>
      </div>

      <div *ngIf="loading()" class="loading">Loading decks...</div>

      <div *ngIf="decks().length === 0 && !loading()" class="no-decks">
        This user has no decks yet.
      </div>

      <div *ngIf="decks().length > 0" class="hints">
        <div *ngIf="!isDesktop()" class="mobile-hint">💡 Tap a deck to expand details</div>
        <div class="image-hint">💡 Click card images for larger view</div>
      </div>

      <div class="decks-grid">
        <div *ngFor="let deck of decks()" class="deck-card">
          <div class="deck-info" (click)="toggleDeckDetails(deck.id)">
            <h4 class="deck-title">{{ deck.name }}</h4>
            <div class="color-identity">
              <img *ngFor="let color of getDeckColorIdentity(deck)" 
                   [src]="getManaSymbolUrl(color)" 
                   [alt]="color" 
                   class="mana-symbol">
            </div>
          </div>
          
          <div *ngIf="expandedDeckId() === deck.id || isDesktop()" class="deck-details">
            <div class="commanders-preview">
              <div *ngFor="let commander of deck.commanders" class="commander-mini">
                <img [src]="commander.imageUrl" [alt]="commander.name" class="mini-image" (click)="commander.imageUrl && showImageOverlay(commander.imageUrl)">
                <span class="mini-name">{{ commander.name }}</span>
              </div>
            </div>
            <div *ngIf="getDeckTags(deck).length > 0" class="deck-tags">
              <span *ngFor="let tag of getDeckTags(deck)" class="tag-chip">{{ tag }}</span>
            </div>
            <p *ngIf="deck.description" class="deck-description">{{ deck.description }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div *ngIf="overlayImageUrl()" class="image-overlay" (click)="closeImageOverlay()">
      <div class="overlay-box" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="closeImageOverlay()">×</button>
        <img [src]="overlayImageUrl()" class="overlay-image">
      </div>
    </div>
  `,
  styles: [`
    .user-decks-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .decks-header {
      margin-bottom: 1rem;
    }

    .back-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-align: center;
    }

    .back-btn:hover {
      background-color: #5a6268;
    }

    .user-title {
      text-align: center;
      margin-bottom: 2rem;
    }

    .user-title h1 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.5rem;
    }

    .decks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    @media (max-width: 768px) {
      .decks-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    }

    .deck-card {
      background: var(--bg-tertiary);
      border-radius: 8px;
      box-shadow: 0 2px 4px var(--shadow);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
    }

    .deck-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .deck-info:hover {
      background-color: var(--hover-bg);
      border-radius: 4px;
    }

    .deck-details {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .deck-description {
      color: var(--text-secondary);
      margin-bottom: 1rem;
      font-style: italic;
      line-height: 1.4;
    }

    .deck-tags {
      margin: 0.5rem 0;
    }

    .tag-chip {
      display: inline-block;
      background: var(--hover-bg);
      color: var(--text-primary);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      margin-right: 0.25rem;
      margin-bottom: 0.25rem;
    }

    .commanders-preview {
      margin-bottom: 1rem;
    }

    .commander-mini {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .mini-image {
      width: 24px;
      height: 34px;
      object-fit: cover;
      border-radius: 2px;
      margin-right: 0.5rem;
    }

    .mini-name {
      font-size: 0.875rem;
      color: var(--text-primary);
    }

    .created-date {
      color: #666;
      font-size: 0.875rem;
      margin: 0;
    }

    .deck-title {
      font-size: 0.85rem;
      color: var(--text-primary);
      margin: 0;
      font-weight: 600;
      line-height: 1.3;
      flex: 1;
    }

    .color-identity {
      display: flex;
      gap: 2px;
      align-items: center;
      flex-shrink: 0;
    }

    .mana-symbol {
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 2px;
    }

    .mini-image {
      cursor: pointer;
    }

    .image-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      cursor: pointer;
    }

    .overlay-box {
      position: relative;
      background: var(--bg-tertiary);
      border-radius: 12px;
      padding: 1rem 1.5rem 1rem 1rem;
      box-shadow: 0 8px 32px var(--shadow);
    }

    .close-btn {
      position: absolute;
      top: -10px;
      right: 0px;
      background: none;
      border: none;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      color: var(--text-primary);
      z-index: 1002;
    }

    .close-btn:hover {
      color: var(--text-primary);
    }

    .overlay-image {
      max-width: 80vw;
      max-height: 80vh;
      border-radius: 8px;
      display: block;
    }

    .hints {
      text-align: center;
      margin-bottom: 1rem;
    }

    .mobile-hint, .image-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .mobile-hint {
      margin-bottom: 0.25rem;
    }

    .loading, .no-decks {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .user-decks-container {
        padding: 0.5rem;
      }
      
      .decks-grid {
        grid-template-columns: 1fr;
      }
      
      .deck-card {
        padding: 1rem;
      }
    }
  `]
})
export class UserDecksComponent implements OnInit {
  userId: string = '';
  userName: string = '';
  groupId: string = '';
  decks = signal<Deck[]>([]);
  loading = signal(false);
  expandedDeckId = signal<string | null>(null);
  isDesktop = signal(false);
  overlayImageUrl = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private decksService: DecksService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    this.userName = this.route.snapshot.queryParamMap.get('userName') || 'User';
    this.groupId = this.route.snapshot.queryParamMap.get('groupId') || '';
    
    if (this.userId) {
      this.loadUserDecks();
    }
    
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  loadUserDecks() {
    this.loading.set(true);
    
    this.decksService.getUserDecksById(this.userId).subscribe({
      next: (decks) => {
        this.decks.set(decks);
        this.loading.set(false);
      },
      error: (err) => {
        this.toastService.error('Failed to load user decks');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    if (this.groupId) {
      this.router.navigate(['/groups', this.groupId]);
    } else {
      this.router.navigate(['/groups']);
    }
  }

  getDeckColorIdentity(deck: Deck): string[] {
    const colors = new Set<string>();
    deck.commanders.forEach(commander => {
      if (commander.colorIdentity) {
        commander.colorIdentity.split('').forEach(color => colors.add(color));
      }
    });
    const colorArray = Array.from(colors).sort();
    return colorArray.length > 0 ? colorArray : ['C'];
  }

  getManaSymbolUrl(color: string): string {
    const symbolMap: { [key: string]: string } = {
      'W': 'https://svgs.scryfall.io/card-symbols/W.svg',
      'U': 'https://svgs.scryfall.io/card-symbols/U.svg',
      'B': 'https://svgs.scryfall.io/card-symbols/B.svg',
      'R': 'https://svgs.scryfall.io/card-symbols/R.svg',
      'G': 'https://svgs.scryfall.io/card-symbols/G.svg',
      'C': 'https://svgs.scryfall.io/card-symbols/C.svg'
    };
    return symbolMap[color] || '';
  }

  toggleDeckDetails(deckId: string) {
    if (!this.isDesktop()) {
      this.expandedDeckId.set(this.expandedDeckId() === deckId ? null : deckId);
    }
  }

  checkScreenSize() {
    this.isDesktop.set(window.innerWidth > 768);
  }

  showImageOverlay(imageUrl: string | undefined) {
    if (imageUrl) {
      this.overlayImageUrl.set(imageUrl);
    }
  }

  closeImageOverlay() {
    this.overlayImageUrl.set(null);
  }

  getDeckTags(deck: Deck): string[] {
    return deck.tags?.map(tag => tag.availableTag.name) || [];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }




}