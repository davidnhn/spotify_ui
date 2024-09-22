import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {State} from "./model/state.model";
import {ReadSong, SaveSong} from "./model/song.model";
import {environment} from "../../environments/environment";
import {catchError, map, Observable, of} from "rxjs";
import {ToastService} from "./toast.service";

@Injectable({
  providedIn: 'root'
})
export class SongService {

  http: HttpClient = inject(HttpClient);
  toastService = inject(ToastService);

  private add$: WritableSignal<State<SaveSong, HttpErrorResponse>> =
    signal(State.Builder<SaveSong,HttpErrorResponse>()
      .forInit()
      .build());
  addSig = computed(() => this.add$());

  private getAll$ : WritableSignal<State<Array<ReadSong>, HttpErrorResponse>> =
    signal(State.Builder<Array<ReadSong>,HttpErrorResponse>()
      .forInit()
      .build());
  getAllSongsSig = computed(() => this.getAll$());

  private addOrRemoveFavoriteSong$: WritableSignal<State<ReadSong, HttpErrorResponse>> =
    signal(State.Builder<ReadSong,HttpErrorResponse>()
      .forInit()
      .build());
  addOrRemoveFavoriteSongSig = computed(() => this.addOrRemoveFavoriteSong$());

  private fetchFavoriteSongs$: WritableSignal<State<Array<ReadSong>, HttpErrorResponse>> =
    signal(State.Builder<Array<ReadSong>,HttpErrorResponse>().forInit().build());
  fetchFavoriteSongsSig = computed(() => this.fetchFavoriteSongs$());

  constructor() { }

  add(song: SaveSong): void {
    const formData = new FormData();
    formData.append("cover", song.cover!);
    formData.append("file", song.file!);
    const clone = structuredClone(song);
    clone.file = undefined;
    clone.cover = undefined;
    formData.append('dto', JSON.stringify(clone));
    this.http.post<SaveSong>(`${environment.API_URL}/api/songs`, formData)
      .subscribe({
        next: savedSong => this.add$
          .set(State.Builder<SaveSong, HttpErrorResponse>()
          .forSuccess(savedSong)
            .build()),
        error: (err: HttpErrorResponse) => this.add$
          .set(State.Builder<SaveSong, HttpErrorResponse>()
            .forError(err)
            .build())
      })
  }

  /* payload
 Form Data{
    cover: (binary)
    file: (binary)
    dto: {"coverContentType":"audio/mpeg,
          "title":{
                "value": "akunana",
                },
          "author": {
                "value": "aya nakamura"
                }
         }
 }
 */

  reset(): void {
    this.add$.set(State.Builder<SaveSong, HttpErrorResponse>().forInit().build());
  }

  getAll(): void {
    this.http.get<Array<ReadSong>>(`${environment.API_URL}/api/songs`)
    .subscribe({
      next: songs => this.getAll$
        .set(State.Builder<Array<ReadSong>, HttpErrorResponse>()
          .forSuccess(songs)
          .build()),
      error: (err: HttpErrorResponse) => this.getAll$
        .set(State.Builder<Array<ReadSong>,HttpErrorResponse>()
        .forError(err)
          .build())
    })
  }

  search(newSearchTerm: string): Observable<State<Array<ReadSong>, HttpErrorResponse>> {
    const queryParam = new HttpParams().set('term', newSearchTerm);

    return this.http.get<Array<ReadSong>>(`${environment.API_URL}/api/songs/search`, {params:queryParam})
      .pipe(
        map(songs => State.Builder<Array<ReadSong>, HttpErrorResponse>().forSuccess(songs).build()),
        catchError(err => of(State.Builder<Array<ReadSong>,HttpErrorResponse>().forError(err).build()))
      );
  }

  addOrRemoveFavorite(favorite: boolean, publicId: string): void {
    this.http.post<ReadSong>(`${environment.API_URL}/api/songs/like`, {favorite, publicId})
    .subscribe({
      next: updatedSong => {
        this.addOrRemoveFavoriteSong$
          .set(State.Builder<ReadSong, HttpErrorResponse>().forSuccess(updatedSong).build());
        if(updatedSong.favorite) {
          this.toastService.showToast('Song added to favorite', 'SUCCESS');
        } else {
          this.toastService.showToast('Song removed from favorite', 'SUCCESS');
        }
      },
      error: err => {
        this.addOrRemoveFavoriteSong$.set(State.Builder<ReadSong,HttpErrorResponse>().forError(err).build());
        this.toastService.showToast('Error adding or removing from favorite', 'DANGER')
    }
    })
  }

  fetchFavorite():void {
    this.http.get<Array<ReadSong>>(`${environment.API_URL}/api/songs/like`)
    .subscribe({
      next: favorites => this.fetchFavoriteSongs$
        .set(
          State.Builder<Array<ReadSong>,HttpErrorResponse>()
            .forSuccess(favorites)
            .build()),
      error: err => this.fetchFavoriteSongs$
        .set(State.Builder<Array<ReadSong>,HttpErrorResponse>().forError(err).build())
    })
  }
}



