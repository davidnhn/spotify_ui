import {Component, effect, inject, OnInit} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {RouterLink} from "@angular/router";
import {SongService} from "../../service/song.service";
import {ReadSong} from "../../service/model/song.model";
import {SmallSongCardComponent} from "../../shared/small-song-card/small-song-card.component";
import {SongContentService} from "../../service/song-content.service";

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    FaIconComponent,
    RouterLink,
    SmallSongCardComponent
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export class LibraryComponent implements OnInit{
  private songService : SongService = inject(SongService);
  private songContentService = inject(SongContentService);
  isLoading: boolean = false;

  songs: Array<ReadSong> = [];

  constructor() {
    effect(() => {
      if(this.songService.getAllSongsSig().status === "OK") {
        this.songs = this.songService.getAllSongsSig().value!;
      }
      this.isLoading = false;
    });
  }

  ngOnInit(): void {
    this.getAllSongs()
  }

  private getAllSongs() {
    this.isLoading = true;
    this.songService.getAll();
  }

  onPlaySong(songToPlayFirst: ReadSong) {
    this.songContentService.createNewQueue(songToPlayFirst, this.songs!);
  }
}
