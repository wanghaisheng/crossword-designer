import { TestBed } from "@angular/core/testing";

import { LoadService } from "./load.service";
import { PuzzleDoc, PuzzleService } from "./puzzle.service";
import { of, throwError } from "rxjs";
import { FirebaseService } from "./firebase.service";
import { DocumentData, DocumentReference, Query, QueryDocumentSnapshot, QuerySnapshot, SnapshotMetadata } from "@angular/fire/firestore";
import { AnswerDoc, AnswerService } from "./answer.service";

describe("LoadService", () => {
  let service: LoadService;

  const firebaseServiceSpy = jasmine.createSpyObj("FirebaseService", ["addDoc", "setDoc", "getDoc", "getDocs", "deleteDoc", "updateDoc"]);
  const answerServiceSpy = jasmine.createSpyObj("AnswerService", ["activateAnswers"]);
  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["activatePuzzle"]);

  const testId = "testId";
  const puzzleDoc = { id: testId } as PuzzleDoc;
  const answerDoc = { id: testId } as AnswerDoc;

  const newAnswerBank: AnswerDoc = {
    id: testId,
    answers: [],
    themeAnswers: {},
  };

  beforeEach(() => {
    firebaseServiceSpy.addDoc.and.returnValue(of({ id: testId } as DocumentReference));
    firebaseServiceSpy.setDoc.and.returnValue(of(undefined));
    firebaseServiceSpy.deleteDoc.and.returnValue(of(undefined));
    firebaseServiceSpy.updateDoc.and.returnValue(of(undefined));
    firebaseServiceSpy.getDoc.withArgs("puzzle", testId).and.returnValue(of(puzzleDoc));
    firebaseServiceSpy.getDoc.withArgs("answers", testId).and.returnValue(of(answerDoc));
    firebaseServiceSpy.getDocs.and.returnValue(
      of({
        docs: [
          {
            id: "testId1",
            data: () => {
              return { name: "Test 1" } as DocumentData;
            },
          } as QueryDocumentSnapshot,
          {
            id: "testId2",
            data: () => {
              return { name: "Test 2" } as DocumentData;
            },
          } as QueryDocumentSnapshot,
        ],
        metadata: {} as SnapshotMetadata,
        query: {} as Query,
        size: 3,
        empty: false,
        forEach: () => {},
        docChanges: () => {
          return [];
        },
      } as QuerySnapshot)
    );

    firebaseServiceSpy.getDoc.calls.reset();
    puzzleServiceSpy.activatePuzzle.calls.reset();
    answerServiceSpy.activateAnswers.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        { provide: FirebaseService, useValue: firebaseServiceSpy },
        { provide: AnswerService, useValue: answerServiceSpy },
        { provide: PuzzleService, useValue: puzzleServiceSpy },
      ],
    });
    service = TestBed.inject(LoadService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getPuzzleList", () => {
    it("should return data when successful", () => {
      service.getPuzzleList().subscribe((result) => {
        expect(result).toEqual([{ name: "Test 1", id: "testId1" } as PuzzleDoc, { name: "Test 2", id: "testId2" } as PuzzleDoc]);
      });
    });

    it("should return throw error when unsuccessful", () => {
      const errorMsg = "Failed to get docs";
      firebaseServiceSpy.getDocs.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.getPuzzleList().subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("setActiveId", () => {
    it("should emit new active id", () => {
      service.setActiveId("testId");

      service.activePuzzleId$.subscribe((id) => {
        expect(id).toEqual("testId");
      });

      service.activePuzzleId$.unsubscribe();
    });
  });

  describe("createPuzzle", () => {
    it("should do nothing when successful", () => {
      service.createPuzzle("Test Puzzle", 10, 12).subscribe(() => {
        expect(firebaseServiceSpy.addDoc).toHaveBeenCalled();
        expect(firebaseServiceSpy.setDoc).toHaveBeenCalledWith("answers", testId, newAnswerBank);
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to add doc";
      firebaseServiceSpy.addDoc.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.createPuzzle(testId, 10, 12).subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("loadPuzzle", () => {
    it("should call activate functions when successful", () => {
      service.loadPuzzle(testId).subscribe(() => {
        expect(firebaseServiceSpy.getDoc).toHaveBeenCalledWith("puzzle", testId);
        expect(puzzleServiceSpy.activatePuzzle).toHaveBeenCalledWith(puzzleDoc);
        expect(firebaseServiceSpy.getDoc).toHaveBeenCalledWith("answers", testId);
        expect(answerServiceSpy.activateAnswers).toHaveBeenCalledWith(answerDoc);
      });
    });

    it("should return throw error when unsuccessful", () => {
      const errorMsg = "Failed to get doc";
      firebaseServiceSpy.getDoc.withArgs("puzzle", testId).and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.loadPuzzle(testId).subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("updatePuzzle", () => {
    it("should do nothing when successful", () => {
      const patch = { name: "New Name" };

      service.updatePuzzle(testId, patch).subscribe(() => {
        expect(firebaseServiceSpy.updateDoc).toHaveBeenCalledWith("puzzle", testId, patch);
      });
    });

    it("should throw error when unsuccessful", () => {
      const patch = { name: "New Name" };
      const errorMsg = "Failed to update doc";

      firebaseServiceSpy.updateDoc.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.updatePuzzle(testId, patch).subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("deletePuzzle", () => {
    it("should do nothing when successful", () => {
      service.deletePuzzle(testId).subscribe(() => {
        expect(firebaseServiceSpy.deleteDoc).toHaveBeenCalledWith("puzzle", testId);
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to delete doc";

      firebaseServiceSpy.deleteDoc.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.deletePuzzle(testId).subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });
});
