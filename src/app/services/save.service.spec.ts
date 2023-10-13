import { TestBed } from "@angular/core/testing";

import { SaveService } from "./save.service";
import { FirebaseService } from "./firebase.service";
import { of, throwError } from "rxjs";
import { PuzzleDoc } from "./puzzle.service";
import { AnswerDoc } from "./answer.service";

describe("SaveService", () => {
  let service: SaveService;

  const firebaseServiceSpy = jasmine.createSpyObj("FirebaseService", ["setDoc"]);

  const testId = "testId";
  const puzzleDoc = { id: testId, locked: false } as PuzzleDoc;
  const lockedPuzzleDoc = { id: testId, locked: true } as PuzzleDoc;
  const answerDoc = { id: testId } as AnswerDoc;

  beforeEach(() => {
    firebaseServiceSpy.setDoc.withArgs("puzzle", testId, puzzleDoc).and.returnValue(of(undefined));
    firebaseServiceSpy.setDoc.withArgs("answers", testId, answerDoc).and.returnValue(of(undefined));
    firebaseServiceSpy.setDoc.calls.reset();

    TestBed.configureTestingModule({
      providers: [{ provide: FirebaseService, useValue: firebaseServiceSpy }],
    });
    service = TestBed.inject(SaveService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("savePuzzle", () => {
    it("should do nothing when successful", () => {
      service.savePuzzle(puzzleDoc).subscribe(() => {
        expect(firebaseServiceSpy.setDoc).toHaveBeenCalledWith("puzzle", testId, puzzleDoc);
      });
    });

    it("should throw error when puzzle locked", () => {
      service.savePuzzle(lockedPuzzleDoc).subscribe(
        () => {},
        (err) => {
          expect(firebaseServiceSpy.setDoc).not.toHaveBeenCalled();
          expect(err.message).toEqual("Puzzle is locked");
        }
      );
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to set doc";

      firebaseServiceSpy.setDoc.withArgs("puzzle", testId, puzzleDoc).and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.savePuzzle(puzzleDoc).subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("saveAnswers", () => {
    it("should do nothing when successful", () => {
      service.saveAnswers(answerDoc).subscribe(() => {
        expect(firebaseServiceSpy.setDoc).toHaveBeenCalledWith("answers", testId, answerDoc);
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to set doc";

      firebaseServiceSpy.setDoc.withArgs("answers", testId, answerDoc).and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.saveAnswers(answerDoc).subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });
});
