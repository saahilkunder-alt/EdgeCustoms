import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private openServicesSource = new Subject<void>();
  openServices$ = this.openServicesSource.asObservable();

  triggerOpenServices() {
    this.openServicesSource.next();
  }
}
