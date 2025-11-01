import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DecksService, Deck, ScryfallCard, Commander } from './decks.service';
import { ToastService } from '../shared/toast.service';
import { ConfirmationService } from '../shared/confirmation.service';
import { NavigationComponent } from '../shared/navigation.component';


@Component({
  selector: 'app-decks-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="decks-container">
      <!-- My Decks -->
      <div class="decks-section">
        <div class="header-with-action">
          <h3>My Decks</h3>
          <button (click)="goToCreateDeck()" class="create-icon-btn" title="Create Deck">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div *ngIf="loading()" class="loading">Loading decks...</div>
        
        <div *ngIf="decks().length === 0 && !loading() && !error()" class="no-decks">
          You haven't created any decks yet.
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
                <img *ngFor="let color of getCombinedColorIdentity(deck.commanders)" 
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
              <div *ngIf="deck.tags && deck.tags.length > 0" class="deck-tags">
                <span *ngFor="let tag of deck.tags" class="tag-chip">{{ tag.availableTag.name }}</span>
              </div>
              <p *ngIf="deck.description" class="deck-description">{{ deck.description }}</p>
              <div class="deck-actions">
                <button (click)="editDeck(deck.id)" class="edit-btn">✏️</button>
                <button (click)="deleteDeck(deck.id, deck.name)" class="delete-btn">🗑️</button>
              </div>
            </div>
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
    .decks-container { padding: 1rem; max-width: 1200px; margin: 0 auto; }

    .decks-section { background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px var(--shadow); margin-bottom: 2rem; }

    .header-with-action { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0; }
    .header-with-action h3 { margin: 0; }
    .create-icon-btn { background: #28a745; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background-color 0.2s; }
    .create-icon-btn:hover { background-color: #218838; }
    .decks-section h3 { color: var(--text-primary); border-bottom: 2px solid #007bff; padding-bottom: 0.5rem; }
    .decks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    @media (max-width: 768px) {
      .decks-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    }
    .deck-card { background: var(--bg-tertiary); border-radius: 8px; padding: 0.75rem; box-shadow: 0 2px 4px var(--shadow); display: flex; flex-direction: column; }
    .deck-info { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; cursor: pointer; transition: background-color 0.2s; }
    .deck-info:hover { background-color: var(--hover-bg); border-radius: 4px; }
    .deck-title { margin: 0; color: var(--text-primary); font-size: 0.85rem; font-weight: 600; line-height: 1.3; }
    .color-identity { display: flex; gap: 2px; align-items: center; flex-shrink: 0; }
    .deck-details { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; flex: 1; }
    .deck-actions { display: flex; gap: 0.5rem; margin-top: auto; padding-top: 0.75rem; justify-content: flex-end; }
    .deck-actions { display: flex; gap: 0.5rem; }
    .edit-btn, .delete-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; }
    .edit-btn:hover, .delete-btn:hover { opacity: 0.7; }
    .deck-description { color: var(--text-secondary); margin-bottom: 1rem; font-style: italic; line-height: 1.4; }
    .commanders-preview { margin-bottom: 1rem; }
    .commander-mini { display: flex; align-items: center; margin-bottom: 0.5rem; }
    .mini-image { width: 24px; height: 34px; object-fit: cover; border-radius: 2px; margin-right: 0.5rem; }
    .mini-name { font-size: 0.875rem; color: var(--text-primary); }
    .created-date { color: #666; font-size: 0.875rem; margin: 0; }
    .loading, .error, .no-decks { text-align: center; padding: 2rem; color: var(--text-secondary); }
    .error { color: #dc3545; }

    .deck-tags { margin: 0.5rem 0; }
    .tag-chip { display: inline-block; background: var(--hover-bg); color: var(--text-primary); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; margin-right: 0.25rem; margin-bottom: 0.25rem; }
    .mana-symbol { display: inline-block; width: 20px; height: 20px; margin-right: 2px; }
    .mini-image { cursor: pointer; }
    .hints { text-align: center; margin-bottom: 1rem; }
    .mobile-hint, .image-hint { font-size: 0.8rem; color: var(--text-muted); }
    .mobile-hint { margin-bottom: 0.25rem; }
    .image-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; cursor: pointer; }
    .overlay-box { position: relative; background: var(--bg-tertiary); border-radius: 12px; padding: 1rem 1.5rem 1rem 1rem; box-shadow: 0 8px 32px var(--shadow); }
    .close-btn { position: absolute; top: -10px; right: 0px; background: none; border: none; font-size: 28px; font-weight: bold; cursor: pointer; color: var(--text-primary); z-index: 1002; }
    .close-btn:hover { color: var(--text-primary); }
    .overlay-image { max-width: 80vw; max-height: 80vh; border-radius: 8px; display: block; }
  `]
})
export class DecksListComponent implements OnInit {
  decks = signal<Deck[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  expandedDeckId = signal<string | null>(null);
  isDesktop = signal(false);
  overlayImageUrl = signal<string | null>(null);

  constructor(
    private decksService: DecksService,
    private router: Router,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadDecks();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  loadDecks() {
    this.loading.set(true);
    this.error.set(null);
    
    this.decksService.getUserDecks().subscribe({
      next: (decks) => {
        this.decks.set(decks);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('error');
        this.toastService.error('Failed to load decks');
        this.loading.set(false);
      }
    });
  }

  goToCreateDeck() {
    this.router.navigate(['/decks/create']);
  }

  async deleteDeck(deckId: string, deckName: string) {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Deck',
      message: `Are you sure you want to delete "${deckName}"?`,
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      this.decksService.deleteDeck(deckId).subscribe({
        next: () => {
          this.toastService.success(`Successfully deleted "${deckName}"`);
          this.loadDecks();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to delete deck');
        }
      });
    }
  }



  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  editDeck(deckId: string) {
    this.router.navigate(['/decks/edit', deckId]);
  }

  getCombinedColorIdentity(commanders: Commander[]): string[] {
    const colors = new Set<string>();
    commanders.forEach(commander => {
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
}