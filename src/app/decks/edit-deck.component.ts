import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DecksService, Deck, ScryfallCard, Commander } from './decks.service';
import { ToastService } from '../shared/toast.service';
import { NavigationComponent } from '../shared/navigation.component';

@Component({
  selector: 'app-edit-deck',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="edit-deck-container">
      <header class="edit-header">
        <button (click)="goBack()" class="back-btn">← Back</button>
      </header>

      <div *ngIf="loading()" class="loading">Loading deck...</div>

      <div *ngIf="deck() && !loading()" class="edit-form-section">
        <div class="deck-form">
          <h4>Commanders</h4>
          <div class="commanders-display">
            <div *ngFor="let commander of deck()!.commanders" class="commander-card">
              <div class="commander-header">
                <span class="commander-name">{{ commander.name }}</span>
              </div>
              <img [src]="commander.imageUrl" [alt]="commander.name" class="commander-image">
            </div>
          </div>
          
          <h4>Description (Optional)</h4>
          <textarea 
            [(ngModel)]="deck()!.description" 
            placeholder="Deck description (optional)..."
            class="deck-textarea"
          ></textarea>
          
          <h4>Tags</h4>
          <div class="tags-section">
            <div class="tag-input-section">
              <input 
                type="text" 
                [(ngModel)]="tagSearchQuery" 
                (input)="filterTags()"
                (keydown.enter)="addCustomTag()"
                placeholder="Search and add tags... (Press Enter to add new)"
                class="tag-search-input"
              >
              <div *ngIf="tagSearchQuery" class="tag-suggestions">
                <div *ngFor="let tag of filteredTags()" class="tag-suggestion" (click)="addTag(tag)">
                  {{ tag }}
                </div>
                <div *ngIf="filteredTags().length === 0" class="tag-suggestion add-new" (click)="addCustomTag()">
                  + Add "{{ tagSearchQuery }}" as new tag
                </div>
              </div>
            </div>
            <div *ngIf="selectedTags().length > 0" class="selected-tags">
              <span *ngFor="let tag of selectedTags()" class="selected-tag">
                {{ tag }}
                <button (click)="removeTag(tag)" class="remove-tag-btn">🗑️</button>
              </span>
            </div>
          </div>
          
          <div class="form-actions">
            <button (click)="updateDeck()" [disabled]="updating()" class="update-btn">
              {{ updating() ? 'Updating...' : 'Update Deck' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .edit-deck-container { padding: 1rem; max-width: 800px; margin: 0 auto; }
    .edit-header { margin-bottom: 2rem; }
    .back-btn { width: 100%; padding: 0.75rem 1rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; text-align: center; }
    .back-btn:hover { background: #5a6268; }
    .loading { text-align: center; padding: 2rem; color: var(--text-secondary); }
    .edit-form-section { background: var(--bg-secondary); padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px var(--shadow); }
    .deck-form h4 { color: var(--text-primary); margin-bottom: 1rem; }
    .deck-input, .deck-textarea, .tag-search-input { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 1rem; box-sizing: border-box; background-color: var(--bg-tertiary); color: var(--text-primary); }
    .deck-textarea { min-height: 80px; resize: vertical; }
    .tags-section { margin: 1rem 0; }
    .tag-input-section { position: relative; margin-bottom: 1rem; }
    .tag-suggestions { position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-top: none; max-height: 200px; overflow-y: auto; z-index: 10; }
    .tag-suggestion { padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
    .tag-suggestion:hover { background: var(--hover-bg); }
    .tag-suggestion.add-new { background: var(--hover-bg); color: #66b3ff; font-weight: 500; }
    .tag-suggestion.add-new:hover { background: var(--border-color); }
    .selected-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .selected-tag { display: inline-flex; align-items: center; background: #007bff; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; }
    .remove-tag-btn { background: none; border: none; color: white; margin-left: 0.25rem; cursor: pointer; font-size: 0.75rem; line-height: 1; }
    .form-actions { display: block; margin-top: 2rem; }

    .update-btn { width: 100% !important; box-sizing: border-box !important; padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 0 !important; }
    .update-btn:hover:not(:disabled) { background: #218838; }
    .update-btn:disabled { background: #6c757d; cursor: not-allowed; }
    .commanders-display { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .commander-card { display: flex; flex-direction: column; background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); }
    .commander-header { margin-bottom: 1rem; }
    .commander-name { font-weight: 500; font-size: 1rem; color: var(--text-primary); }
    .commander-image { width: 100%; max-width: 300px; height: auto; object-fit: cover; border-radius: 8px; }

  `]
})
export class EditDeckComponent implements OnInit {
  deckId: string = '';
  tagSearchQuery = '';
  
  deck = signal<Deck | null>(null);
  availableTags = signal<string[]>([]);
  filteredTags = signal<string[]>([]);
  selectedTags = signal<string[]>([]);
  loading = signal(false);
  updating = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private decksService: DecksService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.deckId = this.route.snapshot.paramMap.get('id') || '';
    if (this.deckId) {
      this.loadDeck();
      this.loadAvailableTags();
    }
  }

  loadDeck() {
    this.loading.set(true);
    this.decksService.getDeck(this.deckId).subscribe({
      next: (deck) => {
        this.deck.set(deck);
        this.selectedTags.set(deck.tags?.map(tag => tag.availableTag.name) || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.toastService.error('Failed to load deck');
        this.loading.set(false);
        this.goBack();
      }
    });
  }

  loadAvailableTags() {
    this.decksService.getAvailableTags().subscribe({
      next: (tags) => {
        this.availableTags.set(tags);
      },
      error: (err) => {
        this.toastService.error('Failed to load available tags');
      }
    });
  }

  filterTags() {
    if (!this.tagSearchQuery.trim()) {
      this.filteredTags.set([]);
      return;
    }
    const query = this.tagSearchQuery.toLowerCase();
    const filtered = this.availableTags()
      .filter(tag => 
        tag.toLowerCase().includes(query) && 
        !this.selectedTags().includes(tag)
      )
      .slice(0, 3);
    this.filteredTags.set(filtered);
  }

  addTag(tag: string) {
    if (!this.selectedTags().includes(tag)) {
      this.selectedTags.set([...this.selectedTags(), tag]);
      this.tagSearchQuery = '';
      this.filteredTags.set([]);
      this.toastService.success(`Added tag: ${tag}`);
    }
  }

  addCustomTag() {
    const customTag = this.tagSearchQuery.trim();
    if (customTag && !this.selectedTags().includes(customTag)) {
      this.selectedTags.set([...this.selectedTags(), customTag]);
      this.tagSearchQuery = '';
      this.filteredTags.set([]);
      this.toastService.success(`Added new tag: ${customTag}`);
    }
  }

  removeTag(tag: string) {
    this.selectedTags.set(this.selectedTags().filter(t => t !== tag));
    this.toastService.info(`Removed tag: ${tag}`);
  }



  updateDeck() {
    const currentDeck = this.deck();
    if (!currentDeck) return;

    this.updating.set(true);
    
    const updateData = {
      name: currentDeck.name.trim(),
      description: currentDeck.description?.trim() || undefined,
      commanders: currentDeck.commanders,
      tags: this.selectedTags()
    };

    this.decksService.updateDeck(this.deckId, updateData).subscribe({
      next: () => {
        this.updating.set(false);
        this.toastService.success('Deck updated successfully!');
        this.router.navigate(['/decks']);
      },
      error: (err) => {
        this.updating.set(false);
        this.toastService.error(err.error?.message || 'Failed to update deck');
      }
    });
  }

  goBack() {
    this.router.navigate(['/decks']);
  }
}