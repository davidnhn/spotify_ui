import {Component, inject} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {SmallSongCardComponent} from "../shared/small-song-card/small-song-card.component";
import {SongService} from "../service/song.service";
import {SongContentService} from "../service/song-content.service";
import {ToastService} from "../service/toast.service";
import {ReadSong} from "../service/model/song.model";
import {debounceTime, filter, of, switchMap, tap} from "rxjs";
import {State} from "../service/model/state.model";
import {HttpErrorResponse} from "@angular/common/http";
import {FavoriteSongBtnComponent} from "../shared/favorite-song-btn/favorite-song-btn.component";

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    FormsModule,
    FontAwesomeModule,
    SmallSongCardComponent,
    FavoriteSongBtnComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {

  searchTerm: string = '';

  private songService: SongService = inject(SongService);
  private songContentService: SongContentService = inject(SongContentService);
  private toastService: ToastService = inject(ToastService);

  songsResult: Array<ReadSong> = [];

  isSearching: boolean = false;

  onSearch(newSearchTerm: string) {
    this.searchTerm = newSearchTerm;
    of(newSearchTerm).pipe(
      tap(newSearchTerm => this.resetResultIfEmptyTerm(newSearchTerm)),
      filter(newSearchTerm => newSearchTerm.length > 0),
      debounceTime(300),
      tap(() => this.isSearching = true),
      switchMap(newSearchTerm => this.songService.search(newSearchTerm))
    ).subscribe({
      next: searchState => this.onNext(searchState),
    })
  }

  private resetResultIfEmptyTerm(newSearchTerm: string) {
    if (newSearchTerm.length === 0) {
      this.songsResult = [];
    }
  }

  onPlaySong(songToPlayFirst: ReadSong) {
    this.songContentService.createNewQueue(songToPlayFirst, this.songsResult)
  }

  private onNext(searchState: State<Array<ReadSong>, HttpErrorResponse>) {
    this.isSearching = false;
    if (searchState.status === "OK") {
      this.songsResult = searchState.value!;
    } else if (searchState.status === "ERROR") {
      this.toastService.showToast('An error occured while searching', 'DANGER');
    }

  }
}
