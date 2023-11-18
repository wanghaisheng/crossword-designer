import { TestBed } from "@angular/core/testing";
import { DocumentData, DocumentReference, Query, QueryDocumentSnapshot, QuerySnapshot, SnapshotMetadata } from "@angular/fire/firestore";

import { of, throwError } from "rxjs";

import { LoadService } from "./load.service";
import { FirebaseService } from "./firebase.service";
import { AnswerDoc } from "src/app/models/answer.model";
import { PuzzleDoc } from "src/app/models/puzzle.model";

describe("LoadService", () => {
  let service: LoadService;

  const firebaseServiceSpy = jasmine.createSpyObj("FirebaseService", [
    "addDoc",
    "setDoc",
    "getDoc",
    "getDocs",
    "deleteDoc",
    "updateDoc",
    "getCurrentUser",
  ]);

  const testId = "testId";
  const puzzleDoc = { name: "Test Puzzle" } as PuzzleDoc;
  const answerDoc = { answers: ["test answer"] } as AnswerDoc;

  const newAnswerBank = {
    answers: [],
    themeAnswers: {},
  };

  beforeEach(() => {
    firebaseServiceSpy.getCurrentUser.and.returnValue({ uid: "test-user-id" });
    firebaseServiceSpy.addDoc.and.returnValue(of({ id: testId } as DocumentReference));
    firebaseServiceSpy.setDoc.and.returnValue(of(undefined));
    firebaseServiceSpy.deleteDoc.and.returnValue(of(undefined));
    firebaseServiceSpy.updateDoc.and.returnValue(of(undefined));
    firebaseServiceSpy.getDoc.withArgs("puzzle", testId).and.returnValue(of({ data: () => puzzleDoc, id: testId }));
    firebaseServiceSpy.getDoc.withArgs("answers", testId).and.returnValue(of({ data: () => answerDoc, id: testId }));
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

    TestBed.configureTestingModule({
      providers: [{ provide: FirebaseService, useValue: firebaseServiceSpy }],
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

  describe("getPuzzle", () => {
    it("should return puzzle doc when successful", () => {
      service.getPuzzle(testId).subscribe((doc) => {
        expect(firebaseServiceSpy.getDoc).toHaveBeenCalledWith("puzzle", testId);
        expect(doc.id).toEqual(testId);
        expect(doc.name).toEqual(puzzleDoc.name);
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to get doc";
      firebaseServiceSpy.getDoc.withArgs("puzzle", testId).and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.getPuzzle(testId).subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("getAnswers", () => {
    it("should return answer doc when successful", () => {
      service.getAnswers(testId).subscribe((doc) => {
        expect(firebaseServiceSpy.getDoc).toHaveBeenCalledWith("answers", testId);
        expect(doc.id).toEqual(testId);
        expect(doc.answers).toEqual(answerDoc.answers);
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to get doc";
      firebaseServiceSpy.getDoc.withArgs("answers", testId).and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.getAnswers(testId).subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("updatePuzzle", () => {
    it("should do nothing when successful and not active id", () => {
      const patch = { name: "New Name" };

      service.updatePuzzle(testId, patch).subscribe(() => {
        expect(firebaseServiceSpy.updateDoc).toHaveBeenCalledWith("puzzle", testId, patch);
      });
    });

    it("should update puzzle patch when successful and active id", () => {
      const patch = { name: "New Name" };

      service.setActiveId(testId);
      service.updatePuzzle(testId, patch).subscribe(() => {
        expect(firebaseServiceSpy.updateDoc).toHaveBeenCalledWith("puzzle", testId, patch);
        expect(service.activePuzzlePatch$.value).toEqual(patch);
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
