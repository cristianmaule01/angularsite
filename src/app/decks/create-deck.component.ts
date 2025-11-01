import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DecksService, ScryfallCard, Commander } from './decks.service';
import { ToastService } from '../shared/toast.service';
import { NavigationComponent } from '../shared/navigation.component';

@Component({
  selector: 'app-create-deck',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  template: `
    <app-navigation></app-navigation>
    <div class="create-deck-container">
      <header class="create-header">
        <button (click)="goBack()" class="back-btn">← Back</button>
      </header>

      <div class="create-form-section">
        <div class="deck-form">
          <h4>Add Commanders</h4>
          <div class="search-section">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (input)="searchScryfallCards()"
              placeholder="Search for commanders..."
              class="search-input"
            >
            <div *ngIf="searchResults().length > 0" class="search-results">
              <div *ngFor="let card of searchResults()" class="card-result" (click)="addCommander(card)">
                <img [src]="card.imageUrl" [alt]="card.name" class="card-image">
                <span class="card-name">{{ card.name }}</span>
              </div>
            </div>
          </div>
          
          <div *ngIf="selectedCommanders().length > 0" class="selected-commanders">
            <h4>Selected Commanders ({{ selectedCommanders().length }})</h4>
            <div class="commanders-grid">
              <div *ngFor="let commander of selectedCommanders(); let i = index" class="commander-preview">
                <div class="commander-header">
                  <span class="commander-name">{{ commander.name }}</span>
                  <button (click)="removeCommander(i)" class="remove-btn">🗑️</button>
                </div>
                <img [src]="commander.imageUrl" [alt]="commander.name" class="preview-image">
              </div>
            </div>
            
            <h4>Description (Optional)</h4>
            <textarea 
              [(ngModel)]="newDeck.description" 
              placeholder="Deck description (optional)..."
              class="deck-textarea"
            ></textarea>
            
            <h4>Add Tags (Optional)</h4>
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
              <button (click)="createDeck()" [disabled]="creating() || selectedCommanders().length === 0" class="create-btn">
                {{ creating() ? 'Creating...' : 'Create Deck' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-deck-container { padding: 1rem; max-width: 800px; margin: 0 auto; }
    .create-header { margin-bottom: 2rem; }
    .back-btn { width: 100%; padding: 0.75rem 1rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; text-align: center; }
    .back-btn:hover { background: #5a6268; }
    .create-form-section { background: var(--bg-secondary); padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px var(--shadow); }
    .deck-form h4 { color: var(--text-primary); margin-bottom: 1rem; }
    .search-input, .deck-textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 1rem; box-sizing: border-box; background-color: var(--bg-tertiary); color: var(--text-primary); }
    .deck-textarea { min-height: 80px; resize: vertical; }
    .search-results { max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); background: var(--bg-tertiary); }
    .card-result { display: flex; align-items: center; padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--border-color); }
    .card-result:hover { background: var(--hover-bg); }
    .card-image { width: 30px; height: 42px; object-fit: cover; border-radius: 2px; margin-right: 0.5rem; }
    .selected-commanders { margin-top: 1rem; }
    .commanders-grid { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 1.5rem; }
    .commander-preview { display: flex; flex-direction: column; background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); width: 100%; }
    .commander-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .commander-name { font-weight: 500; font-size: 1rem; color: var(--text-primary); }
    .preview-image { width: 100%; height: auto; object-fit: cover; border-radius: 8px; }
    @media (min-width: 768px) {
      .preview-image { max-width: 300px; }
    }
    .remove-btn { padding: 0.25rem 0.5rem; background: #dc3545; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 0.875rem; }
    .tags-section { margin: 1rem 0; }
    .tag-input-section { position: relative; margin-bottom: 1rem; }
    .tag-search-input { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; box-sizing: border-box; background-color: var(--bg-tertiary); color: var(--text-primary); }
    .tag-suggestions { position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-top: none; max-height: 200px; overflow-y: auto; z-index: 10; }
    .tag-suggestion { padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
    .tag-suggestion:hover { background: var(--hover-bg); }
    .tag-suggestion.add-new { background: var(--hover-bg); color: #66b3ff; font-weight: 500; }
    .tag-suggestion.add-new:hover { background: var(--border-color); }
    .selected-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .selected-tag { display: inline-flex; align-items: center; background: #007bff; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; }
    .remove-tag-btn { background: none; border: none; color: white; margin-left: 0.25rem; cursor: pointer; font-size: 0.75rem; line-height: 1; }
    .form-actions { display: block; margin-top: 2rem; }

    .create-btn { width: 100% !important; box-sizing: border-box !important; padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 0 !important; }
    .create-btn:hover:not(:disabled) { background: #218838; }
    .create-btn:disabled { background: #6c757d; cursor: not-allowed; }
  `]
})
export class CreateDeckComponent implements OnInit {
  searchQuery = '';
  tagSearchQuery = '';
  newDeck = { name: '', description: '' };
  
  searchResults = signal<ScryfallCard[]>([]);
  selectedCommanders = signal<Commander[]>([]);
  availableTags = signal<string[]>([]);
  filteredTags = signal<string[]>([]);
  selectedTags = signal<string[]>([]);
  creating = signal(false);

  constructor(
    private decksService: DecksService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadAvailableTags();
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

  searchScryfallCards() {
    if (this.searchQuery.trim().length > 2) {
      this.decksService.searchCommanders(this.searchQuery).subscribe({
        next: (cards) => this.searchResults.set(cards),
        error: () => this.searchResults.set([])
      });
    } else {
      this.searchResults.set([]);
    }
  }

  addCommander(card: ScryfallCard) {
    const commanders = this.selectedCommanders();
    if (commanders.find(c => c.name === card.name)) {
      this.toastService.warning(`${card.name} is already selected as a commander`);
      this.searchResults.set([]);
      this.searchQuery = '';
      return;
    }

    const newCommander = {
      name: card.name,
      imageUrl: card.imageUrl,
      scryfallId: card.id,
      oracleText: card.oracleText,
      typeLine: card.typeLine,
      colorIdentity: card.colorIdentity
    };

    const newCommanders = [...commanders, newCommander];
    
    const validation = this.validateCommanderCombination(newCommanders);
    if (!validation.valid) {
      this.toastService.error(validation.error!);
      this.searchResults.set([]);
      this.searchQuery = '';
      return;
    }

    this.selectedCommanders.set(newCommanders);
    this.updateDeckName(newCommanders);
    this.toastService.success(`Added ${card.name} as commander`);
    this.searchResults.set([]);
    this.searchQuery = '';
  }

  removeCommander(index: number) {
    const commanders = this.selectedCommanders();
    const removedCommander = commanders[index];
    commanders.splice(index, 1);
    const newCommanders = [...commanders];
    this.selectedCommanders.set(newCommanders);
    this.updateDeckName(newCommanders);
    this.toastService.info(`Removed ${removedCommander.name} from deck`);
  }

  updateDeckName(commanders: Commander[]) {
    if (commanders.length === 0) {
      this.newDeck.name = '';
    } else if (commanders.length === 1) {
      this.newDeck.name = commanders[0].name;
    } else {
      this.newDeck.name = commanders.map(c => c.name).join(' / ');
    }
  }

  validateCommanderCombination(commanders: Commander[]): { valid: boolean; error?: string } {
    if (commanders.length === 0) {
      return { valid: false, error: 'At least one commander is required' };
    }

    if (commanders.length === 1) {
      return { valid: true };
    }

    if (commanders.length > 2) {
      return { valid: false, error: 'Maximum of 2 commanders allowed' };
    }

    const [cmd1, cmd2] = commanders;
    
    if (this.hasPartner(cmd1) && this.hasPartner(cmd2)) {
      return { valid: true };
    }

    if (this.hasPartnerWith(cmd1, cmd2.name) || this.hasPartnerWith(cmd2, cmd1.name)) {
      return { valid: true };
    }

    if (this.hasChooseBackground(cmd1) && this.isBackground(cmd2)) {
      return { valid: true };
    }
    if (this.hasChooseBackground(cmd2) && this.isBackground(cmd1)) {
      return { valid: true };
    }

    if (this.hasFriendsForever(cmd1) && this.hasFriendsForever(cmd2)) {
      return { valid: true };
    }

    if (this.isDoctorsCompanion(cmd1) && this.isDoctor(cmd2)) {
      return { valid: true };
    }
    if (this.isDoctorsCompanion(cmd2) && this.isDoctor(cmd1)) {
      return { valid: true };
    }

    return { valid: false, error: `${cmd1.name} and ${cmd2.name} cannot be paired together according to MTG commander rules` };
  }

  private hasPartner(card: Commander): boolean {
    return card.oracleText?.includes('Partner') && !card.oracleText?.includes('Partner with') || false;
  }

  private hasPartnerWith(card: Commander, partnerName: string): boolean {
    return card.oracleText?.includes(`Partner with ${partnerName}`) || false;
  }

  private hasChooseBackground(card: Commander): boolean {
    return card.oracleText?.includes('Choose a Background') || false;
  }

  private isBackground(card: Commander): boolean {
    return card.typeLine?.includes('Background') || false;
  }

  private hasFriendsForever(card: Commander): boolean {
    return card.oracleText?.includes('Friends forever') || false;
  }

  private isDoctorsCompanion(card: Commander): boolean {
    return card.oracleText?.includes("Doctor's companion") || false;
  }

  private isDoctor(card: Commander): boolean {
    return card.typeLine?.includes('Time Lord Doctor') || false;
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

  createDeck() {
    if (this.selectedCommanders().length === 0) {
      this.toastService.error('Please add at least one commander to your deck');
      return;
    }

    this.creating.set(true);
    
    const deckData = {
      name: this.newDeck.name.trim(),
      description: this.newDeck.description?.trim() || undefined,
      commanders: this.selectedCommanders(),
      tags: this.selectedTags()
    };

    this.decksService.createDeck(deckData).subscribe({
      next: () => {
        this.creating.set(false);
        this.toastService.success('Deck created successfully!');
        this.router.navigate(['/decks']);
      },
      error: (err) => {
        this.creating.set(false);
        this.toastService.error(err.error?.message || 'Failed to create deck');
      }
    });
  }

  goBack() {
    this.router.navigate(['/decks']);
  }
}