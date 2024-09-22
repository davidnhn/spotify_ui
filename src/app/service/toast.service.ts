import { Injectable } from '@angular/core';
import {ToastInfo} from "./model/toast-info.model";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts: ToastInfo[] = []

  constructor() {
  }

  showToast(body:string, type: "SUCCESS" | "DANGER")  {
    let className;
    if (type == "DANGER") {
      className = 'bg-danger text-light';
    } else {
      className = 'bg-success text-light';
    }
    const toastInfo: ToastInfo = {body, className};
    this.toasts.push(toastInfo);
  }

  remove(toast: ToastInfo): void {
    this.toasts = this.toasts.filter(toastInArray => toastInArray !== toast );
  }
}
