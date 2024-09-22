import {Component, effect, inject, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FaIconLibrary, FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {fontAwesomeIcons} from "./shared/font-awesome-icons";
import {NavigationComponent} from "./layout/navigation/navigation.component";
import {LibraryComponent} from "./layout/library/library.component";
import {HeaderComponent} from "./layout/header/header.component";
import {ToastService} from "./service/toast.service";
import {NgbModal, NgbModalRef, NgbToast} from "@ng-bootstrap/ng-bootstrap";
import {PlayerComponent} from "./layout/player/player.component";
import {AuthService} from "./service/auth.service";
import {AuthPopupComponent} from "./layout/auth-popup/auth-popup.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FontAwesomeModule, NavigationComponent, LibraryComponent, HeaderComponent, NgbToast, PlayerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'spotify_ui';

  private faIconLibrary = inject(FaIconLibrary);

  toastService: ToastService = inject(ToastService);

  private authService = inject(AuthService);

  private modalService = inject(NgbModal);

  private authModalRef: NgbModalRef |null = null;

  constructor() {
    effect(() => {
      this.openOrCloseAuthModal(this.authService.authPopupChange());
    }, {allowSignalWrites: true});
  }

  ngOnInit(): void {
    this.initFontAwesome();
    this.toastService.showToast("Hello toast!", "SUCCESS");
  }

  private initFontAwesome() {
    this.faIconLibrary.addIcons(...fontAwesomeIcons)
  }

  private openOrCloseAuthModal(state: "OPEN" | "CLOSE") {
    if(state === "OPEN") {
      this.openAuthPopup();
    } else if(this.authModalRef !== null && state === "CLOSE" && this.modalService.hasOpenModals()) {
      this.authModalRef.close();
    }
  }

  private openAuthPopup() {
    this.authModalRef = this.modalService.open(AuthPopupComponent, {
      ariaDescribedBy: 'auth-modal',
      centered: true,
    });

    this.authModalRef.dismissed.subscribe({
      next: () => {
        this.authService.openOrCloseAuthPopup("CLOSE");
      }
    })
    this.authModalRef.closed.subscribe({
      next: () => {
        this.authService.openOrCloseAuthPopup("CLOSE");
      }
    })
  }
}


