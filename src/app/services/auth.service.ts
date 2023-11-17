import { Injectable } from "@angular/core";
import { FirebaseService } from "./firebase.service";
import { BehaviorSubject, Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { FirebaseError } from "@angular/fire/app";

export interface User {
  id: string;
  email: string | null;
  name: string | null;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public currentUser$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor(private firebaseService: FirebaseService) {}

  public signIn(email: string, password: string): Observable<void> {
    return this.firebaseService.signInUser(email, password).pipe(
      map(() => {
        this.currentUser$.next(this.getCurrentUser());
      }),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  public signOut(): Observable<void> {
    return this.firebaseService.signOutUser().pipe(
      map(() => {
        this.currentUser$.next(null);
      }),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  public getCurrentUser(): User | null {
    const user = this.firebaseService.getCurrentUser();
    return user
      ? {
          id: user.uid,
          email: user.email,
          name: user.displayName,
        }
      : null;
  }
}
