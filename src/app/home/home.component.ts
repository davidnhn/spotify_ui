import {Component, effect, inject, OnInit} from '@angular/core';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {SongService} from "../service/song.service";
import {ToastService} from "../service/toast.service";
import {ReadSong} from "../service/model/song.model";
import {SongCardComponent} from "./song-card/song-card.component";
import {SongContentService} from "../service/song-content.service";
import {SmallSongCardComponent} from "../shared/small-song-card/small-song-card.component";
import {FavoriteSongCardComponent} from "./favorite-song-card/favorite-song-card.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FontAwesomeModule,
    SongCardComponent,
    SmallSongCardComponent,
    FavoriteSongCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent{

  private songService: SongService = inject(SongService);
  private toastService: ToastService = inject(ToastService);
  private songContentService: SongContentService = inject(SongContentService);
  isLoading: boolean = false;

  allSongs: Array<ReadSong> | undefined;

  constructor() {
    effect(() => {
      this.isLoading = true;
      let allSongsResponse  = this.songService.getAllSongsSig();
      if (allSongsResponse.status === "OK") {
        this.allSongs = allSongsResponse.value;
      }else if(allSongsResponse.status === "ERROR") {
        this.toastService.showToast('An error occured when fetching all songs',"DANGER");
      }
      this.isLoading = false;
    });
  }


  onPlaySong(songToPlayFirst: ReadSong) {
    this.songContentService.createNewQueue(songToPlayFirst, this.allSongs!)
  }
}
