import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { FirebaseService } from "./firebase.service";
import { DocumentData } from "@angular/fire/firestore";
import { catchError, map } from "rxjs/operators";

export class AnswerBank {
  id: string;
  themeAnswers: Map<string, Array<number>>;
  answers: Array<string>;

  constructor(id: string = "", themeAnswers: Object = {}, answers: Array<string> = []) {
    this.id = id;
    this.themeAnswers = new Map<string, Array<number>>(Object.entries(themeAnswers));
    this.answers = answers;
  }
}

export interface AnswerDoc {
  id: string;
  themeAnswers: Object;
  answers: Array<string>;
}

@Injectable({
  providedIn: "root",
})
export class AnswerService {
  public get answerBank(): AnswerBank {
    return this._answerBank;
  }

  private _answerBank: AnswerBank = new AnswerBank();

  constructor(private firebaseService: FirebaseService) {}

  /**
   * Loads answer bank with the provided id from the database
   * @param id puzzle id
   * @returns an Observable boolean (true if answer bank loaded from the database, false if already loaded)
   */
  public loadAnswers(id: string): Observable<boolean> {
    if (id == this._answerBank.id) {
      return of(false);
    }

    return this.firebaseService.getDoc("answers", id).pipe(
      map((docData: DocumentData | undefined) => {
        this._answerBank = new AnswerBank(id, docData?.themeAnswers, docData?.answers);
      }),
      map(() => true),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  /**
   * Adds answer to the answer bank
   * @param text answer text
   * @param isTheme whether or not the answer is a theme answer
   */
  public addAnswer(text: string, isTheme: boolean) {
    if (text) {
      let answer = text.replace(/ /g, "").toUpperCase();

      if (isTheme) {
        this._answerBank.themeAnswers.set(answer, []);
      } else {
        this._answerBank.answers.push(answer);
      }
    }
  }

  /**
   * Removes answer from the answer bank
   * @param key answer key
   * @param isTheme whether or not the answer is a theme answer
   */
  public removeAnswer(key: string, isTheme: boolean) {
    if (isTheme) {
      this._answerBank.themeAnswers.delete(key.toUpperCase());
    } else {
      const index = this._answerBank.answers.findIndex((a) => a == key.toUpperCase());
      this._answerBank.answers.splice(index, 1);
    }
  }

  /**
   * Toggles circle for the provided theme answer index
   * @param key answer key
   * @param index answer circle index
   */
  public toggleCircle(key: string, index: number) {
    let circles = this._answerBank.themeAnswers.get(key.toUpperCase());

    if (circles) {
      let pos = circles.findIndex((i) => i == index);

      if (pos != -1) {
        circles.splice(pos, 1);
      } else {
        circles.push(index);
      }

      this._answerBank.themeAnswers.set(key.toUpperCase(), circles);
    }
  }

  /**
   * Clears answer bank
   */
  public clearAnswers(): void {
    this._answerBank = new AnswerBank(this._answerBank.id);
  }

  /**
   * Saves answer bank to the database
   * @returns an Observable
   */
  public saveAnswers(): Observable<void> {
    let answers: AnswerDoc = {
      id: this._answerBank.id,
      themeAnswers: Object.fromEntries(this._answerBank.themeAnswers.entries()),
      answers: this._answerBank.answers,
    };

    return this.firebaseService.setDoc("answers", this._answerBank.id, answers).pipe(
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }
}
