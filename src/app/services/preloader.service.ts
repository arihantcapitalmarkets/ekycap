import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreloaderService {
  private _loading = new Subject<boolean>();

  get loading$() {
    return this._loading.asObservable();
  }

  show() {
    this._loading.next(true);
  }

  hide() {
    this._loading.next(false);
  }
}
